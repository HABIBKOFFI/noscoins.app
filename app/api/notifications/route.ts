import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createError, ErrorCode } from "@/lib/errors";

/**
 * GET /api/notifications
 * Récupère les notifications de l'utilisateur connecté.
 */
export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json(createError(ErrorCode.UNAUTHORIZED, "Non authentifié"), { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get("unread") === "true";

  const notifications = await prisma.notification.findMany({
    where: {
      user_id: userId,
      ...(unreadOnly ? { read_at: null } : {}),
    },
    orderBy: { created_at: "desc" },
    take: 50,
  });

  const unreadCount = await prisma.notification.count({
    where: { user_id: userId, read_at: null },
  });

  return NextResponse.json({ data: notifications, unreadCount });
}

/**
 * PATCH /api/notifications
 * Marque toutes les notifications comme lues.
 */
export async function PATCH(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json(createError(ErrorCode.UNAUTHORIZED, "Non authentifié"), { status: 401 });
  }

  await prisma.notification.updateMany({
    where: { user_id: userId, read_at: null },
    data: { read_at: new Date() },
  });

  return NextResponse.json({ success: true });
}
