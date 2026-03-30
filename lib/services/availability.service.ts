import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

const LOCK_TTL_SECONDS = 15 * 60; // 15 minutes

function lockKey(availabilityId: string) {
  return `lock:availability:${availabilityId}`;
}

/**
 * Atomically lock an availability slot using Redis SETNX.
 * Returns true if lock was acquired, false if already taken.
 * CLAUDE.md §24 — Redis is source of truth, PostgreSQL is persistent backup.
 */
export async function lockSlot(
  availabilityId: string,
  bookingId: string,
  userId: string
): Promise<boolean> {
  const key = lockKey(availabilityId);

  // SETNX: atomic — only one caller wins
  const acquired = await redis.set(key, bookingId, {
    nx: true,
    ex: LOCK_TTL_SECONDS,
  });

  if (!acquired) return false;

  // Persist lock to PostgreSQL (source of truth for audit/history)
  await prisma.availability.update({
    where: { id: availabilityId },
    data: {
      locked_until: new Date(Date.now() + LOCK_TTL_SECONDS * 1000),
      locked_by_user_id: userId,
      locked_booking_id: bookingId,
    },
  });

  return true;
}

/**
 * Release a slot lock (after payment success, failure, or expiry).
 */
export async function releaseSlot(availabilityId: string): Promise<void> {
  await redis.del(lockKey(availabilityId));

  await prisma.availability.update({
    where: { id: availabilityId },
    data: {
      locked_until: null,
      locked_by_user_id: null,
      locked_booking_id: null,
    },
  });
}

/**
 * Check if a slot is available (Redis first, PostgreSQL fallback).
 */
export async function isSlotAvailable(availabilityId: string): Promise<boolean> {
  try {
    const lockValue = await redis.get(lockKey(availabilityId));
    if (lockValue) return false;
  } catch {
    // Redis unavailable — fallback to PostgreSQL (degraded mode)
    const slot = await prisma.availability.findUnique({
      where: { id: availabilityId },
    });
    if (!slot) return false;
    if (slot.blocked) return false;
    if (slot.locked_until && slot.locked_until > new Date()) return false;
    return true;
  }

  const slot = await prisma.availability.findUnique({
    where: { id: availabilityId },
  });
  return !!slot && !slot.blocked;
}

/**
 * QStash job: cleanup all expired locks.
 * Runs every minute via cron.
 */
export async function cleanupExpiredLocks(): Promise<number> {
  const expired = await prisma.availability.findMany({
    where: {
      locked_until: { lt: new Date() },
      locked_booking_id: { not: null },
    },
  });

  for (const slot of expired) {
    if (!slot.locked_booking_id) continue;

    await prisma.booking.update({
      where: { id: slot.locked_booking_id },
      data: { status: "cancelled" },
    });

    await prisma.availability.update({
      where: { id: slot.id },
      data: {
        locked_until: null,
        locked_by_user_id: null,
        locked_booking_id: null,
      },
    });

    // Redis TTL already handled expiry — no need to del
  }

  return expired.length;
}
