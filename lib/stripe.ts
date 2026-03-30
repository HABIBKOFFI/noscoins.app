import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-03-25.dahlia",
      typescript: true,
    })
  : null;

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

/**
 * Crée une session de paiement Stripe Connect.
 * La commission est prélevée automatiquement via application_fee_amount.
 */
export async function createPaymentIntent({
  amount,
  currency,
  bookingId,
  connectedAccountId,
  applicationFeeAmount,
}: {
  amount: number;
  currency: string;
  bookingId: string;
  connectedAccountId: string;
  applicationFeeAmount: number;
}) {
  if (!stripe) throw new Error("STRIPE_SECRET_KEY manquant");
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: currency.toLowerCase(),
    application_fee_amount: Math.round(applicationFeeAmount * 100),
    transfer_data: { destination: connectedAccountId },
    metadata: { booking_id: bookingId },
  });
}

/**
 * Vérifie la signature d'un webhook Stripe.
 */
export function constructStripeEvent(payload: string, sig: string) {
  if (!stripe) throw new Error("STRIPE_SECRET_KEY manquant");
  return stripe.webhooks.constructEvent(payload, sig, STRIPE_WEBHOOK_SECRET);
}