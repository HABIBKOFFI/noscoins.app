import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { Errors } from "@/lib/errors";
import { updateVenueLocation } from "@/lib/services/venue.service";
import { VenueStatus, BookingMode, Currency } from "@prisma/client";

const updateVenueSchema = z.object({
  name: z.string().min(2).optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  capacity_seat: z.number().int().positive().optional(),
  capacity_stand: z.number().int().positive().optional(),
  base_price: z.number().positive().optional(),
  currency: z.nativeEnum(Currency).optional(),
  booking_mode: z.nativeEnum(BookingMode).optional(),
  balance_due_days_before: z.number().int().positive().optional(),
  is_off_market: z.boolean().optional(),
  status: z.nativeEnum(VenueStatus).optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/venues/:id
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  const venue = await prisma.venue.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, email: true, phone: true } },
      services: true,
      reviews: {
        select: {
          score_overall: true,
          score_cleanliness: true,
          score_welcome: true,
          score_value: true,
          comment: true,
          created_at: true,
        },
      },
    },
  });

  if (!venue || venue.status === VenueStatus.suspended) {
    return Errors.NOT_FOUND("Venue");
  }

  // Hide secret_link from public response
  const { secret_link: _secret, ...publicVenue } = venue;
  return NextResponse.json({ data: publicVenue });
}

// PATCH /api/venues/:id
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const token = req.cookies.get("access_token")?.value;
  if (!token) return Errors.UNAUTHORIZED();

  let payload: { userId: string; role: string };
  try {
    payload = await verifyToken(token);
  } catch {
    return Errors.UNAUTHORIZED();
  }

  const venue = await prisma.venue.findUnique({ where: { id } });
  if (!venue) return Errors.NOT_FOUND("Venue");

  if (payload.role !== "admin" && venue.owner_id !== payload.userId) {
    return Errors.FORBIDDEN();
  }

  // Only admins can change status
  const body = await req.json();
  if (body.status && payload.role !== "admin") {
    return Errors.FORBIDDEN();
  }

  const parsed = updateVenueSchema.safeParse(body);
  if (!parsed.success) {
    return Errors.VALIDATION_ERROR(parsed.error.flatten().fieldErrors);
  }

  const { latitude, longitude, is_off_market, ...data } = parsed.data;

  // Regenerate secret_link if toggling off_market
  let secretLinkUpdate: { secret_link?: string | null } = {};
  if (is_off_market !== undefined && is_off_market !== venue.is_off_market) {
    secretLinkUpdate = { secret_link: is_off_market ? nanoid(21) : null };
  }

  const updated = await prisma.venue.update({
    where: { id },
    data: {
      ...data,
      ...(latitude != null ? { latitude } : {}),
      ...(longitude != null ? { longitude } : {}),
      ...(is_off_market !== undefined ? { is_off_market } : {}),
      ...secretLinkUpdate,
    },
  });

  // Sync PostGIS location if lat/lng changed
  const newLat = latitude ?? venue.latitude;
  const newLng = longitude ?? venue.longitude;
  if ((latitude != null || longitude != null) && newLat && newLng) {
    await updateVenueLocation(id, newLng, newLat);
  }

  const { secret_link: _secret, ...publicVenue } = updated;
  return NextResponse.json({ data: publicVenue });
}

// DELETE /api/venues/:id — admin only (suspends, not hard delete)
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const token = req.cookies.get("access_token")?.value;
  if (!token) return Errors.UNAUTHORIZED();

  let payload: { userId: string; role: string };
  try {
    payload = await verifyToken(token);
  } catch {
    return Errors.UNAUTHORIZED();
  }

  if (payload.role !== "admin") return Errors.FORBIDDEN();

  const venue = await prisma.venue.findUnique({ where: { id } });
  if (!venue) return Errors.NOT_FOUND("Venue");

  await prisma.venue.update({
    where: { id },
    data: { status: VenueStatus.suspended },
  });

  return NextResponse.json({ success: true });
}
