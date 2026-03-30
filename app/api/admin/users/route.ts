import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { Errors } from "@/lib/errors";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  if (!token) return Errors.UNAUTHORIZED();
  let payload: { userId: string; role: string };
  try { payload = await verifyToken(token); } catch { return Errors.UNAUTHORIZED(); }
  if (payload.role !== "admin") return Errors.FORBIDDEN();

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const search = searchParams.get("q");

  const users = await prisma.user.findMany({
    where: {
      ...(type ? { type: type as never } : {}),
      ...(status ? { account_status: status as never } : {}),
      ...(search ? { email: { contains: search, mode: "insensitive" } } : {}),
    },
    select: {
      id: true,
      type: true,
      email: true,
      phone: true,
      country_code: true,
      account_status: true,
      suspended_until: true,
      suspension_reason: true,
      created_at: true,
      _count: { select: { bookings: true, venues: true } },
    },
    orderBy: { created_at: "desc" },
    take: 100,
  });

  return NextResponse.json({ data: users });
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  if (!token) return Errors.UNAUTHORIZED();
  let payload: { userId: string; role: string };
  try { payload = await verifyToken(token); } catch { return Errors.UNAUTHORIZED(); }
  if (payload.role !== "admin") return Errors.FORBIDDEN();

  const { userId, action, reason, until } = await req.json();
  if (!userId || !action) return Errors.VALIDATION_ERROR({ userId: "required", action: "required" });

  if (action === "suspend") {
    await prisma.user.update({
      where: { id: userId },
      data: {
        account_status: "suspended",
        suspended_until: until ? new Date(until) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        suspension_reason: reason ?? "Décision admin",
      },
    });
  } else if (action === "blacklist") {
    await prisma.user.update({
      where: { id: userId },
      data: { account_status: "blacklisted", suspension_reason: reason ?? "Blacklisté par admin" },
    });
  } else if (action === "reactivate") {
    await prisma.user.update({
      where: { id: userId },
      data: { account_status: "active", suspended_until: null, suspension_reason: null },
    });
  } else {
    return Errors.VALIDATION_ERROR({ action: "Must be suspend | blacklist | reactivate" });
  }

  await prisma.auditLog.create({
    data: {
      actor_id: payload.userId,
      action: `user_${action}`,
      target_type: "User",
      target_id: userId,
      metadata: { reason: reason ?? null },
    },
  });

  return NextResponse.json({ data: { success: true } });
}
