import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { Errors } from "@/lib/errors";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get("access_token")?.value;
  if (!token) return Errors.UNAUTHORIZED();

  let payload: { userId: string; role: string };
  try {
    payload = await verifyToken(token);
  } catch {
    return Errors.UNAUTHORIZED();
  }

  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      venue: { include: { owner: { select: { id: true, email: true, phone: true } } } },
      user: { select: { id: true, email: true, phone: true } },
      booking_services: { include: { service: true } },
      payments: true,
    },
  });

  if (!booking) return Errors.NOT_FOUND("Booking");

  const isAdmin = payload.role === "admin";
  const isClient = booking.user_id === payload.userId;
  const isOwner = booking.venue.owner_id === payload.userId;
  if (!isAdmin && !isClient && !isOwner) return Errors.FORBIDDEN();

  return NextResponse.json({ data: booking });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get("access_token")?.value;
  if (!token) return Errors.UNAUTHORIZED();

  let payload: { userId: string; role: string };
  try {
    payload = await verifyToken(token);
  } catch {
    return Errors.UNAUTHORIZED();
  }

  const { id } = await params;
  const { action } = await req.json();

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { venue: true },
  });

  if (!booking) return Errors.NOT_FOUND("Booking");

  const isAdmin = payload.role === "admin";
  const isClient = booking.user_id === payload.userId;
  const isOwner = booking.venue.owner_id === payload.userId;

  if (action === "cancel") {
    if (!isAdmin && !isClient && !isOwner) return Errors.FORBIDDEN();
    if (!["locked", "confirmed", "paid"].includes(booking.status)) {
      return Errors.VALIDATION_ERROR({ status: "Cannot cancel in current state" });
    }
    await prisma.booking.update({ where: { id }, data: { status: "cancelled" } });
    await prisma.auditLog.create({
      data: {
        actor_id: payload.userId,
        action: "booking_cancelled",
        target_type: "Booking",
        target_id: id,
        metadata: { cancelled_by: payload.role },
      },
    });
    return NextResponse.json({ data: { status: "cancelled" } });
  }

  if (action === "complete") {
    if (!isAdmin && !isOwner) return Errors.FORBIDDEN();
    if (booking.status !== "paid") {
      return Errors.VALIDATION_ERROR({ status: "Booking must be paid to complete" });
    }
    await prisma.booking.update({ where: { id }, data: { status: "completed" } });
    return NextResponse.json({ data: { status: "completed" } });
  }

  return Errors.VALIDATION_ERROR({ action: "Unknown action" });
}
