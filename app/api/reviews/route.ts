import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createError, ErrorCode } from "@/lib/errors";

const createSchema = z.object({
  bookingId: z.string().uuid(),
  scoreCleanliness: z.number().int().min(1).max(5),
  scoreWelcome: z.number().int().min(1).max(5),
  scoreValue: z.number().int().min(1).max(5),
  scoreOverall: z.number().int().min(1).max(5),
  comment: z.string().max(3000).optional(),
});

/**
 * GET /api/reviews?venueId=xxx
 * Liste les avis d'un espace.
 */
export async function GET(req: NextRequest) {
  const venueId = new URL(req.url).searchParams.get("venueId");
  if (!venueId) {
    return NextResponse.json(createError(ErrorCode.VALIDATION_ERROR, "venueId requis"), { status: 400 });
  }

  const reviews = await prisma.review.findMany({
    where: { venue_id: venueId },
    include: { user: { select: { id: true, email: true } } },
    orderBy: { created_at: "desc" },
  });

  const avg = reviews.length
    ? reviews.reduce((sum, r) => sum + (r.score_overall ?? 0), 0) / reviews.length
    : null;

  return NextResponse.json({
    data: reviews,
    averageScore: avg ? Math.round(avg * 10) / 10 : null,
    total: reviews.length,
  });
}

/**
 * POST /api/reviews
 * Client laisse un avis après réservation complétée.
 */
export async function POST(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  const userRole = req.headers.get("x-user-role");
  if (!userId || userRole !== "client") {
    return NextResponse.json(createError(ErrorCode.FORBIDDEN, "Réservé aux clients"), { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      createError(ErrorCode.VALIDATION_ERROR, "Données invalides", parsed.error.flatten()),
      { status: 400 }
    );
  }

  const { bookingId, scoreCleanliness, scoreWelcome, scoreValue, scoreOverall, comment } = parsed.data;

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, user_id: userId, status: "completed" },
  });

  if (!booking) {
    return NextResponse.json(
      createError(ErrorCode.FORBIDDEN, "Avis possible uniquement sur une réservation complétée"),
      { status: 403 }
    );
  }

  // Vérifier qu'il n'y a pas déjà un avis (UNIQUE sur booking_id)
  const existing = await prisma.review.findUnique({ where: { booking_id: bookingId } });
  if (existing) {
    return NextResponse.json(
      createError(ErrorCode.VALIDATION_ERROR, "Vous avez déjà laissé un avis pour cette réservation"),
      { status: 409 }
    );
  }

  const review = await prisma.review.create({
    data: {
      booking_id: bookingId,
      venue_id: booking.venue_id,
      user_id: userId,
      score_cleanliness: scoreCleanliness,
      score_welcome: scoreWelcome,
      score_value: scoreValue,
      score_overall: scoreOverall,
      comment,
    },
  });

  return NextResponse.json(review, { status: 201 });
}
