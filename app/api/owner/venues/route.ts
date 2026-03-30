import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { Errors } from "@/lib/errors";
import { nanoid } from "nanoid";

const createVenueSchema = z.object({
  name: z.string().min(2),
  city: z.string().min(1),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  capacity_seat: z.number().int().positive().optional(),
  capacity_stand: z.number().int().positive().optional(),
  base_price: z.number().positive(),
  currency: z.enum(["EUR", "XOF"]),
  booking_mode: z.enum(["instant", "request"]).default("instant"),
  balance_due_days_before: z.number().int().default(30),
  is_off_market: z.boolean().default(false),
});

export async function GET(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  if (!token) return Errors.UNAUTHORIZED();
  let payload: { userId: string; role: string };
  try { payload = await verifyToken(token); } catch { return Errors.UNAUTHORIZED(); }
  if (payload.role !== "owner") return Errors.FORBIDDEN();

  const venues = await prisma.venue.findMany({
    where: { owner_id: payload.userId },
    include: {
      _count: { select: { bookings: true, reviews: true } },
    },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json({ data: venues });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  if (!token) return Errors.UNAUTHORIZED();
  let payload: { userId: string; role: string };
  try { payload = await verifyToken(token); } catch { return Errors.UNAUTHORIZED(); }
  if (payload.role !== "owner") return Errors.FORBIDDEN();

  const body = await req.json();
  const parsed = createVenueSchema.safeParse(body);
  if (!parsed.success) return Errors.VALIDATION_ERROR(parsed.error.flatten().fieldErrors);

  const data = parsed.data;
  const secretLink = data.is_off_market ? nanoid(21) : null;

  const venue = await prisma.venue.create({
    data: {
      owner_id: payload.userId,
      name: data.name,
      city: data.city,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      capacity_seat: data.capacity_seat,
      capacity_stand: data.capacity_stand,
      base_price: data.base_price,
      currency: data.currency,
      booking_mode: data.booking_mode,
      balance_due_days_before: data.balance_due_days_before,
      is_off_market: data.is_off_market,
      secret_link: secretLink,
      status: "pending",
    },
  });

  return NextResponse.json({ data: venue }, { status: 201 });
}
