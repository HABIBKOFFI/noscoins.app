import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createError, ErrorCode } from "@/lib/errors";
import { createPaymentIntent } from "@/lib/stripe";
import { initiatePaydunyaPayment, checkPaydunyaLimit } from "@/lib/paydunya";
import { enqueue } from "@/lib/qstash";
import { convertCurrency } from "@/config/currencies";

const schema = z.object({
  bookingId: z.string().uuid(),
  paymentMethod: z.enum([
    "card", "apple_pay", "google_pay", "sepa",
    "orange_money", "mtn", "moov", "wave",
  ]),
  customerPhone: z.string().optional(), // obligatoire pour mobile money CI
});

const CI_METHODS = new Set(["orange_money", "mtn", "moov", "wave"]);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://noscoins.app";
const IPN_URL = `${APP_URL}/api/webhooks/paydunya`;

/**
 * POST /api/payments
 * Initie un paiement (acompte 30%) pour une réservation lockée.
 */
export async function POST(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json(createError(ErrorCode.UNAUTHORIZED, "Non authentifié"), { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      createError(ErrorCode.VALIDATION_ERROR, "Données invalides", parsed.error.flatten()),
      { status: 400 }
    );
  }

  const { bookingId, paymentMethod, customerPhone } = parsed.data;

  // Vérification mobile money CI
  if (CI_METHODS.has(paymentMethod) && !customerPhone) {
    return NextResponse.json(
      createError(ErrorCode.VALIDATION_ERROR, "Numéro de téléphone requis pour le paiement mobile money"),
      { status: 400 }
    );
  }

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, user_id: userId },
    include: {
      venue: {
        include: { owner: true },
      },
    },
  });

  if (!booking) {
    return NextResponse.json(createError(ErrorCode.NOT_FOUND, "Réservation introuvable"), { status: 404 });
  }

  if (booking.status !== "locked") {
    return NextResponse.json(
      createError(ErrorCode.BOOKING_LOCK_EXPIRED, "La réservation n'est plus en attente de paiement"),
      { status: 409 }
    );
  }

  if (booking.expires_at && booking.expires_at < new Date()) {
    return NextResponse.json(
      createError(ErrorCode.BOOKING_LOCK_EXPIRED, "Le créneau a expiré, veuillez recommencer"),
      { status: 409 }
    );
  }

  const isCI = CI_METHODS.has(paymentMethod);
  const currency = booking.client_currency ?? booking.venue.currency ?? "EUR";

  // Commission depuis Config
  const commissionConfig = await prisma.config.findUnique({
    where: { key: isCI ? "commission_rate_ci" : "commission_rate_eu" },
  });
  const baseRate = parseFloat(commissionConfig?.value ?? "0.12");

  // Commission override promo
  const now = new Date();
  const commissionRate =
    booking.venue.commission_override !== null &&
    booking.venue.commission_override_until &&
    booking.venue.commission_override_until > now
      ? Number(booking.venue.commission_override)
      : baseRate;

  // Frais de service
  const serviceFeeConfig = await prisma.config.findUnique({
    where: { key: isCI ? "service_fee_xof" : "service_fee_eur" },
  });
  const serviceFee = parseFloat(serviceFeeConfig?.value ?? (isCI ? "10000" : "50"));

  const totalPrice = Number(booking.total_price);
  const depositAmount = Number(booking.deposit_amount);
  const commissionAmount = totalPrice * commissionRate;

  try {
    if (!isCI) {
      // ── Stripe Connect (Europe) ──────────────────────────────────
      const connectedAccountId = booking.venue.owner.stripe_account_id;
      if (!connectedAccountId) {
        return NextResponse.json(
          createError(ErrorCode.PAYMENT_FAILED, "Le propriétaire n'a pas encore configuré son compte de paiement"),
          { status: 422 }
        );
      }

      const amountToPay = depositAmount + serviceFee;
      const paymentIntent = await createPaymentIntent({
        amount: amountToPay,
        currency: currency.toLowerCase(),
        bookingId,
        connectedAccountId,
        applicationFeeAmount: commissionAmount + serviceFee,
      });

      await prisma.payment.create({
        data: {
          booking_id: bookingId,
          amount: amountToPay,
          currency,
          method: paymentMethod as any,
          status: "pending",
          psp_reference: paymentIntent.id,
          commission_amount: commissionAmount,
          commission_currency: currency,
        },
      });

      await enqueue("track-event", {
        event_type: "payment_started",
        user_id: userId,
        venue_id: booking.venue_id,
        booking_id: bookingId,
        properties: { method: paymentMethod, currency, amount: amountToPay },
      });

      return NextResponse.json({
        provider: "stripe",
        clientSecret: paymentIntent.client_secret,
        amount: amountToPay,
        currency,
      });
    } else {
      // ── PayDunya (Côte d'Ivoire) — Paiement Avec Redirection ─────
      const amountXOF =
        currency === "XOF"
          ? depositAmount
          : convertCurrency(depositAmount, currency ?? "EUR", "XOF");

      const totalAmountXOF = Math.round(amountXOF + serviceFee);

      // Vérifier le plafond opérateur avant d'initier
      checkPaydunyaLimit(totalAmountXOF, paymentMethod);

      const invoiceId = `${bookingId}-${Date.now()}`;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      const paydunya = await initiatePaydunyaPayment({
        invoiceId,
        amount: totalAmountXOF,
        description: `Acompte réservation ${booking.venue.name}`,
        customerName: user?.email ?? userId,
        customerEmail: user?.email ?? undefined,
        customerPhone: customerPhone!,
        returnUrl: `${APP_URL}/client/bookings?payment=success`,
        cancelUrl:  `${APP_URL}/client/bookings?payment=cancelled`,
        ipnUrl:     IPN_URL,
        operator:   paymentMethod,
      });

      await prisma.payment.create({
        data: {
          booking_id: bookingId,
          amount: totalAmountXOF,
          currency: "XOF",
          exchange_rate: currency !== "XOF" ? 655.957 : 1,
          amount_converted: currency !== "XOF" ? totalAmountXOF : undefined,
          method: paymentMethod as any,
          status: "pending",
          psp_reference: invoiceId, // clé de réconciliation
          commission_amount: Math.round(totalPrice * commissionRate * (currency !== "XOF" ? 655.957 : 1)),
          commission_currency: "XOF",
        },
      });

      await enqueue("track-event", {
        event_type: "payment_started",
        user_id: userId,
        venue_id: booking.venue_id,
        booking_id: bookingId,
        properties: { method: paymentMethod, currency: "XOF", amount: totalAmountXOF },
      });

      return NextResponse.json({
        provider: "paydunya",
        checkoutUrl: paydunya.checkout_url,
        token:       paydunya.token,
        invoiceId,
        amount:      totalAmountXOF,
        currency:    "XOF",
      });
    }
  } catch (err: any) {
    console.error("[payments] Erreur initiation paiement:", err);
    return NextResponse.json(
      createError(ErrorCode.PAYMENT_FAILED, err.message ?? "Erreur lors de l'initiation du paiement"),
      { status: 500 }
    );
  }
}
