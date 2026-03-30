import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createError, ErrorCode } from "@/lib/errors";
import { uploadDocument } from "@/lib/cloudinary";

/**
 * GET /api/documents
 * Propriétaire : liste ses documents KYC.
 * Admin : liste tous les documents en attente.
 */
export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  const userRole = req.headers.get("x-user-role");
  if (!userId) {
    return NextResponse.json(createError(ErrorCode.UNAUTHORIZED, "Non authentifié"), { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  if (userRole === "admin") {
    const status = searchParams.get("status") ?? "pending";
    const docs = await prisma.document.findMany({
      where: { status: status as any },
      include: { user: { select: { id: true, email: true } } },
      orderBy: { created_at: "asc" },
    });
    return NextResponse.json(docs);
  }

  if (userRole === "owner") {
    const docs = await prisma.document.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json(docs);
  }

  return NextResponse.json(createError(ErrorCode.FORBIDDEN, "Accès refusé"), { status: 403 });
}

/**
 * POST /api/documents
 * Propriétaire soumet un document KYC (multipart/form-data).
 */
export async function POST(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  const userRole = req.headers.get("x-user-role");
  if (!userId || userRole !== "owner") {
    return NextResponse.json(createError(ErrorCode.FORBIDDEN, "Réservé aux propriétaires"), { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(createError(ErrorCode.VALIDATION_ERROR, "Requête multipart invalide"), { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const docType = formData.get("type") as string | null;

  if (!file || !docType) {
    return NextResponse.json(
      createError(ErrorCode.VALIDATION_ERROR, "Champs requis : file, type"),
      { status: 400 }
    );
  }

  const validTypes = ["identity", "rib", "business_registration", "other"];
  if (!validTypes.includes(docType)) {
    return NextResponse.json(
      createError(ErrorCode.VALIDATION_ERROR, `Type invalide. Valeurs autorisées : ${validTypes.join(", ")}`),
      { status: 400 }
    );
  }

  // Limite de taille : 10MB
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(createError(ErrorCode.VALIDATION_ERROR, "Fichier trop volumineux (max 10MB)"), { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const uploaded = await uploadDocument(buffer, { userId, docType });

    // Supprimer les anciens documents du même type en attente/refusés
    await prisma.document.deleteMany({
      where: { user_id: userId, type: docType as any, status: { in: ["pending", "rejected"] } },
    });

    const doc = await prisma.document.create({
      data: {
        user_id: userId,
        type: docType as any,
        file_url: uploaded.url,
        status: "pending",
      },
    });

    // Notifier les admins
    const admins = await prisma.user.findMany({
      where: { type: "admin", account_status: "active" },
      select: { id: true },
    });

    await Promise.all(
      admins.map((admin) =>
        prisma.notification.create({
          data: {
            user_id: admin.id,
            type: "kyc_submitted",
            title: "Document KYC soumis",
            body: `Un propriétaire a soumis un document ${docType} à vérifier.`,
          },
        })
      )
    );

    return NextResponse.json(doc, { status: 201 });
  } catch (err: any) {
    console.error("[documents] Erreur upload:", err);
    return NextResponse.json(
      createError(ErrorCode.PAYMENT_FAILED, "Erreur lors de l'upload du document"),
      { status: 500 }
    );
  }
}
