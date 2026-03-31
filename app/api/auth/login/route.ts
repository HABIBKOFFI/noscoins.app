import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signAccessToken, signRefreshToken } from "@/lib/auth";
import { Errors } from "@/lib/errors";
import { authRatelimit, isRateLimited } from "@/lib/ratelimit";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const SECURE = process.env.NODE_ENV === "production";

export async function POST(req: NextRequest) {
  try {
    // ── Rate limiting : 5 tentatives / 15 min par IP ──
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    if (await isRateLimited(authRatelimit, `login:${ip}`)) {
      return NextResponse.json(
        { error: { code: "RATE_LIMITED", message: "Trop de tentatives. Réessayez dans 15 minutes." } },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return Errors.VALIDATION_ERROR(parsed.error.flatten().fieldErrors);
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password_hash) {
      return Errors.VALIDATION_ERROR({ email: ["Identifiants invalides."] });
    }

    if (user.account_status === "blacklisted") {
      return Errors.FORBIDDEN();
    }

    if (
      user.account_status === "suspended" &&
      user.suspended_until &&
      user.suspended_until > new Date()
    ) {
      return Errors.FORBIDDEN();
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return Errors.VALIDATION_ERROR({ email: ["Identifiants invalides."] });
    }

    const accessToken  = await signAccessToken(user.id, user.type);
    const refreshToken = await signRefreshToken(user.id);

    await prisma.userSession.create({
      data: {
        user_id:    user.id,
        refresh_token: refreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const res = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, type: user.type },
    });

    res.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: SECURE,
      sameSite: "strict",
      maxAge: 15 * 60,
      path: "/",
    });

    res.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: SECURE,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/api/auth/refresh",
    });

    return res;
  } catch (err) {
    console.error("[login] error:", err instanceof Error ? err.message : "unknown");
    return Errors.INTERNAL();
  }
}
