import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createError, ErrorCode } from "@/lib/errors";
import { enqueue } from "@/lib/qstash";
import { lockSlot } from "@/lib/services/availability.service";
import { verifyToken } from "@/lib/auth";

async function resolveUser(req: NextRequest): Promise<{ userId: string; userRole: string } | null> {
  const headerId = req.headers.get("x-user-id");
  const headerRole = req.headers.get("x-user-role");
  if (headerId && headerRole) return { userId: headerId, userRole: headerRole };
  const token = req.cookies.get("access_token")?.value;
  if (!token) return null;
  try { const p = await verifyToken(token); return { userId: p.userId, userRole: p.role }; }
  catch { return null; }
}

const ownerResponseSchema = z.union([
  z.object({
    action: z.literal("accept"),
  }),
  z.object({
    action: z.literal("refuse"),
    message: z.string().max(500).optional(),
  }),
  z.object({
    action: z.literal("counter"),
    proposedPrice: z.number().positive(),
    proposedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    message: z.string().max(2000).optional(),
  }),
]);

const clientResponseSchema = z.object({
  action: z.enum(["accept", "refuse"]),
});

/**
 * GET /api/quotes/:id
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await resolveUser(req);
  if (!user) return NextResponse.json(createError(ErrorCode.UNAUTHORIZED, "Non authentifié"), { status: 401 });
  const { userId } = user;

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      venue: {
        select: { id: true, name: true, city: true, base_price: true, currency: true, owner_id: true },
      },
      client: { select: { id: true, email: true } },
    },
  });

  if (!quote) {
    return NextResponse.json(createError(ErrorCode.NOT_FOUND, "Devis introuvable"), { status: 404 });
  }

  const isClient = quote.client_id === userId;
  const isOwner = quote.venue.owner_id === userId;
  const isAdmin = user.userRole === "admin";

  if (!isClient && !isOwner && !isAdmin) {
    return NextResponse.json(createError(ErrorCode.FORBIDDEN, "Accès refusé"), { status: 403 });
  }

  return NextResponse.json(quote);
}

/**
 * PATCH /api/quotes/:id
 * Propriétaire : accepte / refuse / contre-propose.
 * Client : accepte ou refuse une contre-proposition.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await resolveUser(req);
  if (!user) return NextResponse.json(createError(ErrorCode.UNAUTHORIZED, "Non authentifié"), { status: 401 });
  const { userId, userRole } = user;

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      venue: { include: { owner: true } },
      client: true,
    },
  });

  if (!quote) {
    return NextResponse.json(createError(ErrorCode.NOT_FOUND, "Devis introuvable"), { status: 404 });
  }

  if (quote.status === "expired" || quote.status === "refused") {
    return NextResponse.json(createError(ErrorCode.QUOTE_EXPIRED, "Ce devis n'est plus actif"), { status: 409 });
  }

  const body = await req.json().catch(() => null);

  // ── Réponse du propriétaire ─────────────────────────────────────────────────
  if (quote.venue.owner_id === userId && userRole === "owner") {
    const parsed = ownerResponseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        createError(ErrorCode.VALIDATION_ERROR, "Données invalides", parsed.error.flatten()),
        { status: 400 }
      );
    }

    const { action } = parsed.data;

    if (action === "refuse") {
      await prisma.quote.update({
        where: { id },
        data: { status: "refused" },
      });

      await prisma.notification.create({
        data: {
          user_id: quote.client_id,
          type: "quote_refused",
          title: "Devis refusé",
          body: `Votre demande pour ${quote.venue.name} a été refusée.`,
        },
      });

      return NextResponse.json({ status: "refused" });
    }

    if (action === "accept") {
      // Créer le Booking depuis le devis — le lock démarre ici
      const lockConfig = await prisma.config.findUnique({ where: { key: "booking_lock_minutes" } });
      const lockMinutes = parseInt(lockConfig?.value ?? "15");
      const expiresAt = new Date(Date.now() + lockMinutes * 60 * 1000);

      const booking = await prisma.booking.create({
        data: {
          venue_id: quote.venue_id,
          user_id: quote.client_id,
          quote_id: quote.id,
          status: "locked",
          total_price: quote.proposed_price ?? quote.venue.base_price ?? 0,
          deposit_amount: Number(quote.proposed_price ?? quote.venue.base_price ?? 0) * 0.30,
          client_currency: quote.venue.currency ?? "EUR",
          owner_currency: quote.venue.currency ?? "EUR",
          expires_at: expiresAt,
        },
      });

      // Locker le créneau
      const availability = await prisma.availability.findFirst({
        where: {
          venue_id: quote.venue_id,
          date: quote.requested_date ?? new Date(),
          blocked: false,
          locked_booking_id: null,
        },
      });

      if (availability) {
        await lockSlot(availability.id, booking.id, quote.client_id);
      }

      await prisma.quote.update({
        where: { id },
        data: { status: "accepted" },
      });

      await prisma.notification.create({
        data: {
          user_id: quote.client_id,
          type: "quote_accepted",
          title: "Devis accepté !",
          body: `Votre demande pour ${quote.venue.name} est acceptée. Vous avez ${lockMinutes} min pour payer.`,
        },
      });

      return NextResponse.json({ status: "accepted", booking });
    }

    if (action === "counter") {
      const { proposedPrice, proposedDate, message } = parsed.data as {
        action: "counter"; proposedPrice: number; proposedDate: string; message?: string;
      };

      // Nouveau délai d'expiration
      const expiryConfig = await prisma.config.findUnique({ where: { key: "quote_expiry_hours" } });
      const expiryHours = parseInt(expiryConfig?.value ?? "48");
      const newExpiry = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

      await prisma.quote.update({
        where: { id },
        data: {
          status: "countered",
          proposed_price: proposedPrice,
          proposed_date: new Date(proposedDate),
          message: message ?? quote.message,
          expires_at: newExpiry,
        },
      });

      await prisma.notification.create({
        data: {
          user_id: quote.client_id,
          type: "quote_countered",
          title: "Contre-proposition reçue",
          body: `${quote.venue.name} a fait une contre-proposition pour votre demande.`,
        },
      });

      return NextResponse.json({ status: "countered" });
    }
  }

  // ── Réponse du client à une contre-proposition ──────────────────────────────
  if (quote.client_id === userId && userRole === "client") {
    if (quote.status !== "countered") {
      return NextResponse.json(
        createError(ErrorCode.VALIDATION_ERROR, "Aucune contre-proposition à accepter"),
        { status: 409 }
      );
    }

    const parsed = clientResponseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        createError(ErrorCode.VALIDATION_ERROR, "Données invalides"),
        { status: 400 }
      );
    }

    if (parsed.data.action === "refuse") {
      await prisma.quote.update({ where: { id }, data: { status: "refused" } });
      return NextResponse.json({ status: "refused" });
    }

    // Accepter la contre-proposition → créer booking + lock
    const lockConfig = await prisma.config.findUnique({ where: { key: "booking_lock_minutes" } });
    const lockMinutes = parseInt(lockConfig?.value ?? "15");
    const expiresAt = new Date(Date.now() + lockMinutes * 60 * 1000);

    const booking = await prisma.booking.create({
      data: {
        venue_id: quote.venue_id,
        user_id: quote.client_id,
        quote_id: quote.id,
        status: "locked",
        total_price: quote.proposed_price ?? quote.venue.base_price ?? 0,
        deposit_amount: Number(quote.proposed_price ?? quote.venue.base_price ?? 0) * 0.30,
        client_currency: quote.venue.currency ?? "EUR",
        owner_currency: quote.venue.currency ?? "EUR",
        expires_at: expiresAt,
      },
    });

    await prisma.quote.update({ where: { id }, data: { status: "accepted" } });

    await enqueue("track-event", {
      event_type: "start_booking",
      user_id: userId,
      venue_id: quote.venue_id,
      booking_id: booking.id,
    });

    return NextResponse.json({ status: "accepted", booking });
  }

  return NextResponse.json(createError(ErrorCode.FORBIDDEN, "Action non autorisée"), { status: 403 });
}
