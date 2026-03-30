import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { Errors } from "@/lib/errors";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  if (!token) return Errors.UNAUTHORIZED();

  try {
    const payload = await verifyToken(token);
    return NextResponse.json({ data: { userId: payload.userId, role: payload.role } });
  } catch {
    return Errors.UNAUTHORIZED();
  }
}
