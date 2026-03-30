import { NextRequest, NextResponse } from "next/server";
import { constructStripeEvent } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { enqueue } from "@/lib/qstash";
import type Stripe from "stripe";

/**
 * POST /api/webhooks/stripe
 * Reçoit les événements Stripe. Ne jamais confirmer une réservation sans ce webhook.
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = constructStripeEvent(body, sig);
  } catch (err: any) {
    console.error("[stripe-webhook] Signature invalide:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case "charge.refunded":
        await handleRefund(event.data.object as Stripe.Charge);
        break;

      default:
        // Ignorer les événements non gérés
        break;
    }
  } catch (err) {
    console.error("[stripe-webhook] Erreur traitement:", err);
    // Retourner 200 pour éviter les retries Stripe inutiles — log suffisant
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSucceeded(intent: Stripe.PaymentIntent) {
  const bookingId = intent.metadata?.booking_id;
  if (!bookingId) return;

  // Idempotence : vérifier si déjà traité
  const existing = await prisma.payment.findFirst({
    where: { psp_reference: intent.id, status: "succeeded" },
  });
  if (existing) return;

  // Mise à jour Payment
  await prisma.payment.updateMany({
    where: { psp_reference: intent.id },
    data: { status: "succeeded" },
  });

  // Mise à jour Booking
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "confirmed" },
    include: {
      user: true,
      venue: { include: { owner: true } },
    },
  });

  // AuditLog
  await prisma.auditLog.create({
    data: {
      action: "payment_succeeded",
      target_type: "Booking",
      target_id: bookingId,
      metadata: { psp_reference: intent.id, amount: intent.amount },
    },
  });

  // Notifications async
  await enqueue("send-notification", {
    userId: booking.user_id,
    type: "booking_confirmed",
    title: "Réservation confirmée",
    body: `Votre réservation pour ${booking.venue.name} est confirmée.`,
    email: booking.user.email,
    emailData: {
      clientName: booking.user.email,
      venueName: booking.venue.name,
      bookingId,
    },
  });

  await enqueue("send-notification", {
    userId: booking.venue.owner_id,
    type: "payment_received",
    title: "Paiement reçu",
    body: `Acompte reçu pour la réservation #${bookingId.slice(0, 8)}.`,
  });

  await enqueue("track-event", {
    event_type: "payment_success",
    user_id: booking.user_id,
    venue_id: booking.venue_id,
    booking_id: bookingId,
    properties: { amount: intent.amount / 100, currency: intent.currency.toUpperCase() },
  });
}

async function handlePaymentFailed(intent: Stripe.PaymentIntent) {
  const bookingId = intent.metadata?.booking_id;
  if (!bookingId) return;

  await prisma.payment.updateMany({
    where: { psp_reference: intent.id },
    data: { status: "failed" },
  });

  await enqueue("track-event", {
    event_type: "payment_failed",
    booking_id: bookingId,
    properties: { error: intent.last_payment_error?.message },
  });
}

async function handleRefund(charge: Stripe.Charge) {
  if (!charge.payment_intent) return;
  const intentId = typeof charge.payment_intent === "string"
    ? charge.payment_intent
    : charge.payment_intent.id;

  const refundAmount = charge.amount_refunded / 100;
  const refundReason = charge.refunds?.data?.[0]?.reason ?? "requested_by_customer";

  await prisma.payment.updateMany({
    where: { psp_reference: intentId },
    data: {
      status: "refunded",
      refund_amount: refundAmount,
      refund_reason: refundReason,
      refunded_at: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "payment_refunded",
      target_type: "Payment",
      metadata: { psp_reference: intentId, refund_amount: refundAmount, reason: refundReason },
    },
  });
}
