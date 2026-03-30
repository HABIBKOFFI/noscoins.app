import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createError, ErrorCode } from "@/lib/errors";
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

const sendSchema = z.object({
  booking_id: z.string().uuid(),
  content: z.string().max(4000).optional(),
  // receiver_id is auto-detected from the booking
  receiver_id: z.string().uuid().optional(),
  attachment_url: z.string().url().optional(),
  attachment_type: z.enum(["image", "pdf", "document"]).optional(),
});

/**
 * GET /api/messages?bookingId=xxx
 */
export async function GET(req: NextRequest) {
  const user = await resolveUser(req);
  if (!user) return NextResponse.json(createError(ErrorCode.UNAUTHORIZED, "Non authentifié"), { status: 401 });
  const { userId, userRole } = user;

  const bookingId = new URL(req.url).searchParams.get("bookingId");
  if (!bookingId) {
    return NextResponse.json(createError(ErrorCode.VALIDATION_ERROR, "bookingId requis"), { status: 400 });
  }

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId },
    include: { venue: { select: { owner_id: true } } },
  });

  if (!booking) {
    return NextResponse.json(createError(ErrorCode.NOT_FOUND, "Réservation introuvable"), { status: 404 });
  }

  const isParticipant = booking.user_id === userId || booking.venue.owner_id === userId;
  if (!isParticipant && userRole !== "admin") {
    return NextResponse.json(createError(ErrorCode.FORBIDDEN, "Accès refusé"), { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: { booking_id: bookingId },
    include: { sender: { select: { id: true, email: true, type: true } } },
    orderBy: { created_at: "asc" },
  });

  // Mark received messages as read
  await prisma.message.updateMany({
    where: { booking_id: bookingId, receiver_id: userId, read_at: null },
    data: { read_at: new Date() },
  });

  return NextResponse.json({ data: messages });
}

/**
 * POST /api/messages
 */
export async function POST(req: NextRequest) {
  const user = await resolveUser(req);
  if (!user) return NextResponse.json(createError(ErrorCode.UNAUTHORIZED, "Non authentifié"), { status: 401 });
  const { userId } = user;

  const body = await req.json().catch(() => null);
  const parsed = sendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(createError(ErrorCode.VALIDATION_ERROR, "Données invalides", parsed.error.flatten()), { status: 400 });
  }

  const { booking_id, content, attachment_url, attachment_type } = parsed.data;

  if (!content && !attachment_url) {
    return NextResponse.json(createError(ErrorCode.VALIDATION_ERROR, "Contenu requis"), { status: 400 });
  }

  const booking = await prisma.booking.findFirst({
    where: { id: booking_id },
    include: { venue: { select: { owner_id: true } } },
  });

  if (!booking) {
    return NextResponse.json(createError(ErrorCode.NOT_FOUND, "Réservation introuvable"), { status: 404 });
  }

  const isClient = booking.user_id === userId;
  const isOwner = booking.venue.owner_id === userId;
  if (!isClient && !isOwner) {
    return NextResponse.json(createError(ErrorCode.FORBIDDEN, "Vous n'êtes pas partie de cette réservation"), { status: 403 });
  }

  // Auto-detect receiver: the other party
  const receiverId = isClient ? booking.venue.owner_id : booking.user_id;

  const message = await prisma.message.create({
    data: {
      booking_id,
      sender_id: userId,
      receiver_id: receiverId,
      content,
      attachment_url,
      attachment_type,
    },
    include: { sender: { select: { id: true, email: true, type: true } } },
  });

  await prisma.notification.create({
    data: {
      user_id: receiverId,
      type: "new_message",
      title: "Nouveau message",
      body: content?.slice(0, 100) ?? "Pièce jointe reçue",
    },
  });

  return NextResponse.json({ data: message }, { status: 201 });
}
