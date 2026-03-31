import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, signAccessToken, signRefreshToken } from "@/lib/auth";
import { Errors } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get("refresh_token")?.value;
    if (!refreshToken) return Errors.UNAUTHORIZED();

    // Verify JWT signature
    let payload: { userId: string; role: string };
    try {
      payload = await verifyToken(refreshToken);
    } catch {
      return Errors.UNAUTHORIZED();
    }

    // Verify session exists in DB (rotation check)
    const session = await prisma.userSession.findUnique({
      where: { refresh_token: refreshToken },
      include: { user: true },
    });

    if (!session) return Errors.UNAUTHORIZED();

    // Supprimer la session expirée proprement
    if (session.expires_at < new Date()) {
      await prisma.userSession.delete({ where: { id: session.id } }).catch(() => {});
      return Errors.UNAUTHORIZED();
    }

    // Rotate: delete old session, create new one
    const newRefreshToken = await signRefreshToken(payload.userId);
    await prisma.$transaction([
      prisma.userSession.delete({ where: { id: session.id } }),
      prisma.userSession.create({
        data: {
          user_id: payload.userId,
          refresh_token: newRefreshToken,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    const accessToken = await signAccessToken(
      session.user.id,
      session.user.type
    );

    const res = NextResponse.json({ success: true });

    res.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60,
      path: "/",
    });

    res.cookies.set("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/api/auth/refresh",
    });

    return res;
  } catch (err) {
    console.error("[refresh] error:", err instanceof Error ? err.message : "unknown");
    return Errors.INTERNAL();
  }
}
