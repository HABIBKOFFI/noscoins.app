import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { Errors } from "@/lib/errors";
import { nanoid } from "nanoid";

const updateVenueSchema = z.object({
  name: z.string().min(2).optional(),
  city: z.string().min(1).optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  capacity_seat: z.number().int().positive().optional(),
  capacity_stand: z.number().int().positive().optional(),
  base_price: z.number().positive().optional(),
  booking_mode: z.enum(["instant", "request"]).optional(),
  balance_due_days_before: z.number().int().optional(),
  is_off_market: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get("access_token")?.value;
  if (!token) return Errors.UNAUTHORIZED();
  let payload: { userId: string; role: string };
  try { payload = await verifyToken(token); } catch { return Errors.UNAUTHORIZED(); }
  if (payload.role !== "owner") return Errors.FORBIDDEN();

  const { id } = await params;
  const venue = await prisma.venue.findUnique({
    where: { id, owner_id: payload.userId },
    include: {
      services: true,
      _count: { select: { bookings: true, reviews: true, quotes: true } },
    },
  });

  if (!venue) return Errors.NOT_FOUND("Venue");
  return NextResponse.json({ data: venue });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get("access_token")?.value;
  if (!token) return Errors.UNAUTHORIZED();
  let payload: { userId: string; role: string };
  try { payload = await verifyToken(token); } catch { return Errors.UNAUTHORIZED(); }
  if (payload.role !== "owner") return Errors.FORBIDDEN();

  const { id } = await params;
  const existing = await prisma.venue.findUnique({ where: { id, owner_id: payload.userId } });
  if (!existing) return Errors.NOT_FOUND("Venue");

  const body = await req.json();
  const parsed = updateVenueSchema.safeParse(body);
  if (!parsed.success) return Errors.VALIDATION_ERROR(parsed.error.flatten().fieldErrors);

  const data = parsed.data;

  // Regenerate secret_link if off_market toggled on
  const secretLink =
    data.is_off_market === true && !existing.is_off_market
      ? nanoid(21)
      : data.is_off_market === false
      ? null
      : existing.secret_link;

  const venue = await prisma.venue.update({
    where: { id },
    data: { ...data, secret_link: secretLink },
  });

  return NextResponse.json({ data: venue });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get("access_token")?.value;
  if (!token) return Errors.UNAUTHORIZED();
  let payload: { userId: string; role: string };
  try { payload = await verifyToken(token); } catch { return Errors.UNAUTHORIZED(); }
  if (payload.role !== "owner") return Errors.FORBIDDEN();

  const { id } = await params;
  const existing = await prisma.venue.findUnique({ where: { id, owner_id: payload.userId } });
  if (!existing) return Errors.NOT_FOUND("Venue");

  // Only allow deletion if no confirmed/paid bookings
  const activeBookings = await prisma.booking.count({
    where: { venue_id: id, status: { in: ["confirmed", "paid"] } },
  });
  if (activeBookings > 0) {
    return Errors.VALIDATION_ERROR({ venue: "Cannot delete venue with active bookings" });
  }

  await prisma.venue.delete({ where: { id } });
  return NextResponse.json({ data: { deleted: true } });
}
