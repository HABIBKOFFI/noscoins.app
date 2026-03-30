import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { Errors } from "@/lib/errors";

const serviceSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  type: z.enum(["mandatory", "optional"]),
  category: z.string().optional(),
  description: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get("access_token")?.value;
  if (!token) return Errors.UNAUTHORIZED();
  let payload: { userId: string; role: string };
  try { payload = await verifyToken(token); } catch { return Errors.UNAUTHORIZED(); }
  if (payload.role !== "owner") return Errors.FORBIDDEN();

  const { id } = await params;
  const venue = await prisma.venue.findUnique({ where: { id, owner_id: payload.userId } });
  if (!venue) return Errors.NOT_FOUND("Venue");

  const services = await prisma.service.findMany({ where: { venue_id: id } });
  return NextResponse.json({ data: services });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get("access_token")?.value;
  if (!token) return Errors.UNAUTHORIZED();
  let payload: { userId: string; role: string };
  try { payload = await verifyToken(token); } catch { return Errors.UNAUTHORIZED(); }
  if (payload.role !== "owner") return Errors.FORBIDDEN();

  const { id } = await params;
  const venue = await prisma.venue.findUnique({ where: { id, owner_id: payload.userId } });
  if (!venue) return Errors.NOT_FOUND("Venue");

  const body = await req.json();
  const parsed = serviceSchema.safeParse(body);
  if (!parsed.success) return Errors.VALIDATION_ERROR(parsed.error.flatten().fieldErrors);

  const service = await prisma.service.create({
    data: {
      venue_id: id,
      currency: venue.currency ?? "EUR",
      ...parsed.data,
    },
  });

  return NextResponse.json({ data: service }, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get("access_token")?.value;
  if (!token) return Errors.UNAUTHORIZED();
  let payload: { userId: string; role: string };
  try { payload = await verifyToken(token); } catch { return Errors.UNAUTHORIZED(); }
  if (payload.role !== "owner") return Errors.FORBIDDEN();

  const { id } = await params;
  const { serviceId } = await req.json();
  if (!serviceId) return Errors.VALIDATION_ERROR({ serviceId: "required" });

  const service = await prisma.service.findFirst({
    where: { id: serviceId, venue: { owner_id: payload.userId } },
  });
  if (!service) return Errors.NOT_FOUND("Service");

  await prisma.service.delete({ where: { id: serviceId } });
  return NextResponse.json({ data: { deleted: true } });
}
