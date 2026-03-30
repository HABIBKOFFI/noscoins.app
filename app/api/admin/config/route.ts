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

  const configs = await prisma.config.findMany({ orderBy: { key: "asc" } });
  return NextResponse.json({ data: configs });
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  if (!token) return Errors.UNAUTHORIZED();
  let payload: { userId: string; role: string };
  try { payload = await verifyToken(token); } catch { return Errors.UNAUTHORIZED(); }
  if (payload.role !== "admin") return Errors.FORBIDDEN();

  const { key, value } = await req.json();
  if (!key || value === undefined) return Errors.VALIDATION_ERROR({ key: "required", value: "required" });

  const config = await prisma.config.upsert({
    where: { key },
    update: { value: String(value), updated_by: payload.userId, updated_at: new Date() },
    create: { key, value: String(value), updated_by: payload.userId },
  });

  await prisma.auditLog.create({
    data: {
      actor_id: payload.userId,
      action: "config_updated",
      target_type: "Config",
      metadata: { key, value: String(value) },
    },
  });

  return NextResponse.json({ data: config });
}
