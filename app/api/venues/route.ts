import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { Errors } from "@/lib/errors";
import { updateVenueLocation, searchVenuesByLocation } from "@/lib/services/venue.service";
import { VenueStatus, Currency, BookingMode } from "@prisma/client";

const createVenueSchema = z.object({
  name: z.string().min(2),
  city: z.string().optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  capacity_seat: z.number().int().positive().optional(),
  capacity_stand: z.number().int().positive().optional(),
  base_price: z.number().positive().optional(),
  currency: z.nativeEnum(Currency).optional(),
  booking_mode: z.nativeEnum(BookingMode).default("instant"),
  balance_due_days_before: z.number().int().positive().default(30),
  is_off_market: z.boolean().default(false),
});

// GET /api/venues — public list of published venues
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
  const city = searchParams.get("city");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radius = searchParams.get("radius"); // km

  // Geolocation search
  if (lat && lng) {
    const results = await searchVenuesByLocation(
      parseFloat(lat),
      parseFloat(lng),
      (parseFloat(radius ?? "50")) * 1000
    );
    return NextResponse.json({ data: results, total: results.length });
  }

  const where = {
    status: VenueStatus.published,
    ...(city ? { city: { contains: city, mode: "insensitive" as const } } : {}),
  };

  const [venues, total] = await Promise.all([
    prisma.venue.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        name: true,
        city: true,
        capacity_seat: true,
        base_price: true,
        currency: true,
        booking_mode: true,
        reviews: { select: { score_overall: true } },
      },
    }),
    prisma.venue.count({ where }),
  ]);

  return NextResponse.json({
    data: venues,
    total,
    page,
    limit,
    hasMore: page * limit < total,
  });
}

// POST /api/venues — create venue (owner only)
export async function POST(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  if (!token) return Errors.UNAUTHORIZED();

  let payload: { userId: string; role: string };
  try {
    payload = await verifyToken(token);
  } catch {
    return Errors.UNAUTHORIZED();
  }

  if (payload.role !== "owner" && payload.role !== "admin") {
    return Errors.FORBIDDEN();
  }

  const body = await req.json();
  const parsed = createVenueSchema.safeParse(body);
  if (!parsed.success) {
    return Errors.VALIDATION_ERROR(parsed.error.flatten().fieldErrors);
  }

  const { latitude, longitude, is_off_market, ...data } = parsed.data;

  const secretLink = is_off_market ? nanoid(21) : null;

  const venue = await prisma.venue.create({
    data: {
      ...data,
      latitude,
      longitude,
      is_off_market,
      secret_link: secretLink,
      owner_id: payload.userId,
      status: VenueStatus.pending,
    },
  });

  // Set PostGIS location if coordinates provided
  if (latitude != null && longitude != null) {
    await updateVenueLocation(venue.id, longitude, latitude);
  }

  return NextResponse.json({ data: venue }, { status: 201 });
}
