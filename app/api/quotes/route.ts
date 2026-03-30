import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createError, ErrorCode } from "@/lib/errors";
import { enqueue } from "@/lib/qstash";
import { sendNewQuote } from "@/lib/resend";
import { verifyToken } from "@/lib/auth";

async function resolveUser(req: NextRequest): Promise<{ userId: string; userRole: string } | null> {
  // Prefer middleware-injected headers, fall back to cookie
  const headerId = req.headers.get("x-user-id");
  const headerRole = req.headers.get("x-user-role");
  if (headerId && headerRole) return { userId: headerId, userRole: headerRole };
  const token = req.cookies.get("access_token")?.value;
  if (!token) return null;
  try {
    const p = await verifyToken(token);
    return { userId: p.userId, userRole: p.role };
  } catch { return null; }
}

const createSchema = z.object({
  venueId: z.string().uuid(),
  requestedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  requestedServices: z.array(z.string().uuid()).optional(),
  message: z.string().max(2000).optional(),
  requestedBudget: z.number().positive().optional(),
});

/**
 * GET /api/quotes
 * Client : liste ses devis. Propriétaire : devis sur ses espaces.
 */
export async function GET(req: NextRequest) {
  const user = await resolveUser(req);
  if (!user) return NextResponse.json(createError(ErrorCode.UNAUTHORIZED, "Non authentifié"), { status: 401 });
  const { userId, userRole } = user;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));

  let where: Record<string, unknown> = {};

  if (userRole === "client") {
    where = { client_id: userId };
  } else if (userRole === "owner") {
    where = { venue: { owner_id: userId } };
  } else if (userRole === "admin") {
    // admin voit tout
  }

  if (status) where.status = status;

  const [quotes, total] = await Promise.all([
    prisma.quote.findMany({
      where,
      include: {
        venue: { select: { id: true, name: true, city: true, base_price: true, currency: true } },
        client: { select: { id: true, email: true } },
      },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.quote.count({ where }),
  ]);

  return NextResponse.json({ data: quotes, total, page, limit });
}

/**
 * POST /api/quotes
 * Client soumet une demande de devis.
 */
export async function POST(req: NextRequest) {
  const user = await resolveUser(req);
  const userId = user?.userId;
  const userRole = user?.userRole;
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

  const { venueId, requestedDate, requestedServices, message, requestedBudget } = parsed.data;

  const venue = await prisma.venue.findFirst({
    where: { id: venueId, status: "published" },
    include: { owner: true },
  });

  if (!venue) {
    return NextResponse.json(createError(ErrorCode.VENUE_NOT_AVAILABLE, "Espace introuvable ou non disponible"), { status: 404 });
  }

  // Délai d'expiration du devis depuis Config
  const expiryConfig = await prisma.config.findUnique({ where: { key: "quote_expiry_hours" } });
  const expiryHours = parseInt(expiryConfig?.value ?? "48");
  const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

  const quote = await prisma.quote.create({
    data: {
      venue_id: venueId,
      client_id: userId,
      status: "pending",
      requested_date: new Date(requestedDate),
      requested_services: requestedServices ? { serviceIds: requestedServices } : undefined,
      proposed_price: requestedBudget ?? venue.base_price,
      message,
      expires_at: expiresAt,
    },
    include: {
      venue: { select: { name: true, city: true } },
    },
  });

  // Notifier le propriétaire
  const client = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });

  if (venue.owner.email) {
    await sendNewQuote(venue.owner.email, {
      ownerName: venue.owner.email,
      venueName: venue.name,
      clientName: client?.email ?? userId,
      eventDate: requestedDate,
      quoteId: quote.id,
    }).catch(console.error);
  }

  await prisma.notification.create({
    data: {
      user_id: venue.owner_id,
      type: "new_quote",
      title: "Nouvelle demande de devis",
      body: `${client?.email} souhaite réserver ${venue.name} le ${requestedDate}`,
    },
  });

  // Matching intelligent — lancer en async (section 27)
  await enqueue("run-matching", {
    quote_id: quote.id,
    venue_id: venueId,
    requested_date: requestedDate,
    requested_capacity: null,
    requested_budget: requestedBudget,
  });

  // Tracker
  await enqueue("track-event", {
    event_type: "request_quote",
    user_id: userId,
    venue_id: venueId,
    properties: { quote_id: quote.id },
  });

  return NextResponse.json(quote, { status: 201 });
}
