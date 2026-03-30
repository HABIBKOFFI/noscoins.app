import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { Errors } from "@/lib/errors";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  if (!token) return Errors.UNAUTHORIZED();

  let payload: { userId: string; role: string };
  try {
    payload = await verifyToken(token);
  } catch {
    return Errors.UNAUTHORIZED();
  }

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role"); // "client" | "owner" — hints but uses real userId

  let where: Record<string, unknown> = {};

  if (payload.role === "admin") {
    // Admin can see all
    const statusFilter = searchParams.get("status");
    if (statusFilter) where = { status: statusFilter };
  } else if (payload.role === "owner" || role === "owner") {
    where = { venue: { owner_id: payload.userId } };
  } else {
    // client
    where = { user_id: payload.userId };
  }

  const bookings = await prisma.booking.findMany({
    where: where as never,
    include: {
      venue: { select: { id: true, name: true, city: true, owner_id: true } },
      user: { select: { id: true, email: true } },
    },
    orderBy: { created_at: "desc" },
    take: 50,
  });

  return NextResponse.json({ data: bookings });
}
