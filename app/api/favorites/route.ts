import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createError, ErrorCode } from "@/lib/errors";

const schema = z.object({ venueId: z.string().uuid() });

/**
 * GET /api/favorites
 * Retourne les favoris du client connecté.
 */
export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json(createError(ErrorCode.UNAUTHORIZED, "Non authentifié"), { status: 401 });
  }

  const favorites = await prisma.favorite.findMany({
    where: { user_id: userId },
    include: {
      venue: {
        select: {
          id: true, name: true, city: true, base_price: true, currency: true,
          capacity_seat: true, status: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json(favorites);
}

/**
 * POST /api/favorites
 * Ajoute un espace aux favoris.
 */
export async function POST(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json(createError(ErrorCode.UNAUTHORIZED, "Non authentifié"), { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      createError(ErrorCode.VALIDATION_ERROR, "venueId invalide"),
      { status: 400 }
    );
  }

  const { venueId } = parsed.data;

  const venue = await prisma.venue.findFirst({
    where: { id: venueId, status: "published" },
  });
  if (!venue) {
    return NextResponse.json(createError(ErrorCode.NOT_FOUND, "Espace introuvable"), { status: 404 });
  }

  const favorite = await prisma.favorite.upsert({
    where: { user_id_venue_id: { user_id: userId, venue_id: venueId } },
    create: { user_id: userId, venue_id: venueId },
    update: {},
  });

  return NextResponse.json(favorite, { status: 201 });
}

/**
 * DELETE /api/favorites?venueId=xxx
 * Retire un espace des favoris.
 */
export async function DELETE(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json(createError(ErrorCode.UNAUTHORIZED, "Non authentifié"), { status: 401 });
  }

  const venueId = new URL(req.url).searchParams.get("venueId");
  if (!venueId) {
    return NextResponse.json(createError(ErrorCode.VALIDATION_ERROR, "venueId requis"), { status: 400 });
  }

  await prisma.favorite.deleteMany({
    where: { user_id: userId, venue_id: venueId },
  });

  return NextResponse.json({ success: true });
}
