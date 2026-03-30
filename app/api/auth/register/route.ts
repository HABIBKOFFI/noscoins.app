import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signAccessToken, signRefreshToken } from "@/lib/auth";
import { Errors } from "@/lib/errors";
import { UserType } from "@prisma/client";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  country_code: z.string().length(2).optional(),
  type: z.nativeEnum(UserType).default("client"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return Errors.VALIDATION_ERROR(parsed.error.flatten().fieldErrors);
    }

    const { email, password, phone, country_code, type } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Errors.VALIDATION_ERROR({ email: ["Cet email est déjà utilisé."] });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password_hash, phone, country_code, type },
    });

    const accessToken = await signAccessToken(user.id, user.type);
    const refreshToken = await signRefreshToken(user.id);

    await prisma.userSession.create({
      data: {
        user_id: user.id,
        refresh_token: refreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const res = NextResponse.json(
      { success: true, user: { id: user.id, email: user.email, type: user.type } },
      { status: 201 }
    );

    res.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60,
      path: "/",
    });

    res.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/api/auth/refresh",
    });

    return res;
  } catch (err) {
    console.error("[register]", err);
    return Errors.INTERNAL();
  }
}
