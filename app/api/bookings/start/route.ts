import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { Errors } from "@/lib/errors";
import { lockSlot, isSlotAvailable } from "@/lib/services/availability.service";
import { enqueue } from "@/lib/qstash";

const LOCK_DURATION_MS = 15 * 60 * 1000;

const startBookingSchema = z.object({
  availabilityId: z.string().uuid(),
  serviceIds: z.array(z.string().uuid()).optional(),
});

export async function POST(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  if (!token) return Errors.UNAUTHORIZED();

  let payload: { userId: string; role: string };
  try {
    payload = await verifyToken(token);
  } catch {
    return Errors.UNAUTHORIZED();
  }

  // Admins cannot book
  if (payload.role === "admin") return Errors.FORBIDDEN();

  const body = await req.json();
  const parsed = startBookingSchema.safeParse(body);
  if (!parsed.success) {
    return Errors.VALIDATION_ERROR(parsed.error.flatten().fieldErrors);
  }

  const { availabilityId, serviceIds = [] } = parsed.data;

  // Check availability slot exists
  const slot = await prisma.availability.findUnique({
    where: { id: availabilityId },
    include: {
      venue: {
        include: {
          services: {
            where: { type: "mandatory" },
          },
        },
      },
    },
  });

  if (!slot) return Errors.NOT_FOUND("Availability");
  if (slot.venue.status !== "published") return Errors.VENUE_NOT_AVAILABLE();

  // Verify slot is available
  const available = await isSlotAvailable(availabilityId);
  if (!available) return Errors.BOOKING_LOCK_EXPIRED();

  // Compute total price: base_price + mandatory services + selected optional services
  const basePrice = Number(slot.venue.base_price ?? 0);
  const mandatoryServices = slot.venue.services;

  let selectedOptionalServices: Awaited<ReturnType<typeof prisma.service.findMany>> = [];
  if (serviceIds.length > 0) {
    // Déduplication
    const uniqueServiceIds = [...new Set(serviceIds)];

    selectedOptionalServices = await prisma.service.findMany({
      where: {
        id: { in: uniqueServiceIds },
        venue_id: slot.venue_id, // Services MUST belong to this venue
        type: "optional",
      },
    });

    // Vérifier que tous les IDs fournis existent et appartiennent bien à ce venue
    if (selectedOptionalServices.length !== uniqueServiceIds.length) {
      return Errors.VALIDATION_ERROR({
        serviceIds: ["Un ou plusieurs services sont invalides ou n'appartiennent pas à cet espace."],
      });
    }
  }

  const allServices = [...mandatoryServices, ...selectedOptionalServices];
  const servicesTotal = allServices.reduce(
    (sum, s) => sum + Number(s.price),
    0
  );
  const totalPrice = basePrice + servicesTotal;
  const depositAmount = totalPrice * 0.3;
  const expiresAt = new Date(Date.now() + LOCK_DURATION_MS);

  // Create booking + lock slot atomically
  const booking = await prisma.booking.create({
    data: {
      venue_id: slot.venue_id,
      user_id: payload.userId,
      status: "locked",
      total_price: totalPrice,
      deposit_amount: depositAmount,
      client_currency: slot.venue.currency ?? "EUR",
      owner_currency: slot.venue.currency ?? "EUR",
      expires_at: expiresAt,
    },
  });

  // Lock the slot (Redis SETNX — race condition proof)
  const locked = await lockSlot(availabilityId, booking.id, payload.userId);
  if (!locked) {
    // Another request won the race — cancel this booking
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "cancelled" },
    });
    return Errors.BOOKING_LOCK_EXPIRED();
  }

  // Attach all services to booking
  if (allServices.length > 0) {
    await prisma.bookingService.createMany({
      data: allServices.map((s) => ({
        booking_id: booking.id,
        service_id: s.id,
        quantity: 1,
        unit_price: s.price,
        total_price: s.price,
      })),
    });
  }

  // Track analytics event
  await enqueue("track-event", {
    event_type: "start_booking",
    user_id: payload.userId,
    venue_id: slot.venue_id,
    booking_id: booking.id,
    properties: { device: "web", country: null },
  });

  return NextResponse.json(
    {
      data: {
        booking_id: booking.id,
        total_price: totalPrice,
        deposit_amount: depositAmount,
        expires_at: expiresAt,
        currency: slot.venue.currency,
      },
    },
    { status: 201 }
  );
}
