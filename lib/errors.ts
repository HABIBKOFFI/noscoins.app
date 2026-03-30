import { NextResponse } from "next/server";

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: Record<string, unknown>
) {
  const body: { error: ApiError } = { error: { code, message } };
  if (details) body.error.details = details;
  return NextResponse.json(body, { status });
}

export const Errors = {
  UNAUTHORIZED: () => errorResponse("UNAUTHORIZED", "Token invalide ou expiré.", 401),
  FORBIDDEN: () => errorResponse("FORBIDDEN", "Accès refusé.", 403),
  NOT_FOUND: (resource = "Resource") =>
    errorResponse("NOT_FOUND", `${resource} introuvable.`, 404),
  BOOKING_LOCK_EXPIRED: () =>
    errorResponse("BOOKING_LOCK_EXPIRED", "Le créneau n'est plus disponible.", 409),
  VENUE_NOT_AVAILABLE: () =>
    errorResponse("VENUE_NOT_AVAILABLE", "Cet espace n'est pas disponible.", 422),
  PAYMENT_FAILED: () =>
    errorResponse("PAYMENT_FAILED", "Le paiement a échoué.", 422),
  QUOTE_EXPIRED: () =>
    errorResponse("QUOTE_EXPIRED", "Ce devis a expiré.", 410),
  KYC_REQUIRED: () =>
    errorResponse("KYC_REQUIRED", "Documents propriétaire manquants.", 403),
  VALIDATION_ERROR: (details: Record<string, unknown>) =>
    errorResponse("VALIDATION_ERROR", "Données invalides.", 400, details),
  INTERNAL: () =>
    errorResponse("INTERNAL_ERROR", "Erreur interne du serveur.", 500),
};
