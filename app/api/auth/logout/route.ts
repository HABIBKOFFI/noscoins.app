import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Errors } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get("refresh_token")?.value;

    if (refreshToken) {
      await prisma.userSession
        .delete({ where: { refresh_token: refreshToken } })
        .catch(() => {}); // Ignore if already deleted
    }

    const res = NextResponse.json({ success: true });
    res.cookies.delete("access_token");
    res.cookies.delete("refresh_token");
    return res;
  } catch (err) {
    console.error("[logout]", err);
    return Errors.INTERNAL();
  }
}
