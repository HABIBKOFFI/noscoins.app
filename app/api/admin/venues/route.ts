import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { Errors } from "@/lib/errors";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  if (!token) return Errors.UNAUTHORIZED();
  let payload: { userId: string; role: string };
  try { payload = await verifyToken(token); } catch { return Errors.UNAUTHORIZED(); }
  if (payload.role !== "admin") return Errors.FORBIDDEN();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "pending";

  const venues = await prisma.venue.findMany({
    where: { status: status as never },
    include: { owner: { select: { id: true, email: true, phone: true, country_code: true } } },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json({ data: venues });
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  if (!token) return Errors.UNAUTHORIZED();
  let payload: { userId: string; role: string };
  try { payload = await verifyToken(token); } catch { return Errors.UNAUTHORIZED(); }
  if (payload.role !== "admin") return Errors.FORBIDDEN();

  const { venueId, action } = await req.json();
  if (!venueId || !action) return Errors.VALIDATION_ERROR({ venueId: "required", action: "required" });

  const newStatus = action === "validate" ? "validated" : action === "publish" ? "published" : action === "suspend" ? "suspended" : null;
  if (!newStatus) return Errors.VALIDATION_ERROR({ action: "Must be validate | publish | suspend" });

  const venue = await prisma.venue.update({
    where: { id: venueId },
    data: { status: newStatus as never },
    include: { owner: { select: { id: true, email: true } } },
  });

  await prisma.auditLog.create({
    data: {
      actor_id: payload.userId,
      action: `venue_${action}`,
      target_type: "Venue",
      target_id: venueId,
      metadata: { new_status: newStatus },
    },
  });

  return NextResponse.json({ data: venue });
}
