import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { Errors } from "@/lib/errors";

const createAvailabilitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
});

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/venues/:id/availability
export async function GET(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const token = req.cookies.get("access_token")?.value;
  let isOwnerOrAdmin = false;

  if (token) {
    try {
      const p = await verifyToken(token);
      isOwnerOrAdmin = p.role === "admin";
      if (!isOwnerOrAdmin) {
        const venue = await prisma.venue.findUnique({ where: { id }, select: { owner_id: true } });
        isOwnerOrAdmin = venue?.owner_id === p.userId;
      }
    } catch { /* unauthenticated = public view */ }
  }

  const slots = await prisma.availability.findMany({
    where: {
      venue_id: id,
      blocked: false,
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
      // Clients only see available slots (not locked ones)
      ...(!isOwnerOrAdmin
        ? {
            OR: [
              { locked_until: null },
              { locked_until: { lt: new Date() } },
            ],
          }
        : {}),
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json({ data: slots });
}

// POST /api/venues/:id/availability — owner only
export async function POST(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const token = req.cookies.get("access_token")?.value;
  if (!token) return Errors.UNAUTHORIZED();

  let payload: { userId: string; role: string };
  try {
    payload = await verifyToken(token);
  } catch {
    return Errors.UNAUTHORIZED();
  }

  const venue = await prisma.venue.findUnique({ where: { id }, select: { owner_id: true } });
  if (!venue) return Errors.NOT_FOUND("Venue");

  if (payload.role !== "admin" && venue.owner_id !== payload.userId) {
    return Errors.FORBIDDEN();
  }

  const body = await req.json();
  // Accept single slot or array
  const slots = Array.isArray(body) ? body : [body];

  const results = [];
  for (const slot of slots) {
    const parsed = createAvailabilitySchema.safeParse(slot);
    if (!parsed.success) {
      return Errors.VALIDATION_ERROR(parsed.error.flatten().fieldErrors);
    }

    const created = await prisma.availability.create({
      data: {
        venue_id: id,
        date: new Date(parsed.data.date),
        start_time: parsed.data.start_time,
        end_time: parsed.data.end_time,
      },
    });
    results.push(created);
  }

  return NextResponse.json({ data: results }, { status: 201 });
}
