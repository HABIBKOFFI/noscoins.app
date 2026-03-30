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

  const docs = await prisma.document.findMany({
    where: { status: status as never },
    include: { user: { select: { id: true, email: true, phone: true, country_code: true } } },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json({ data: docs });
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  if (!token) return Errors.UNAUTHORIZED();
  let payload: { userId: string; role: string };
  try { payload = await verifyToken(token); } catch { return Errors.UNAUTHORIZED(); }
  if (payload.role !== "admin") return Errors.FORBIDDEN();

  const { documentId, action, reason } = await req.json();
  if (!documentId || !action) return Errors.VALIDATION_ERROR({ documentId: "required", action: "required" });

  const newStatus = action === "approve" ? "approved" : action === "reject" ? "rejected" : null;
  if (!newStatus) return Errors.VALIDATION_ERROR({ action: "Must be approve | reject" });

  const doc = await prisma.document.update({
    where: { id: documentId },
    data: {
      status: newStatus as never,
      reviewed_by: payload.userId,
      reviewed_at: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      actor_id: payload.userId,
      action: `document_${action}`,
      target_type: "Document",
      target_id: documentId,
      metadata: { reason: reason ?? null },
    },
  });

  return NextResponse.json({ data: doc });
}
