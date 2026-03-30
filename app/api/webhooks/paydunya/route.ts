import { NextRequest, NextResponse } from "next/server";
import { verifyPaydunyaIpn, type PaydunyaIpnPayload } from "@/lib/paydunya";
import { prisma } from "@/lib/prisma";
import { enqueue } from "@/lib/qstash";

/**
 * POST /api/webhooks/paydunya
 * Reçoit les IPN (Instant Payment Notification) PayDunya.
 *
 * Flux :
 *  1. PayDunya POST le payload avec data.bill.hash
 *  2. On appelle l'API PayDunya pour confirmer le statut (source de vérité)
 *  3. On délègue le traitement à QStash (évite les timeouts Vercel)
 */
export async function POST(req: NextRequest) {
  let payload: PaydunyaIpnPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const hash = payload?.data?.bill?.hash;
  if (!hash) {
    return NextResponse.json({ error: "Missing hash" }, { status: 400 });
  }

  // 1. Confirmer le statut auprès de l'API PayDunya (ne pas faire confiance au payload seul)
  let confirmed: Awaited<ReturnType<typeof verifyPaydunyaIpn>>;
  try {
    confirmed = await verifyPaydunyaIpn(hash);
  } catch (err: any) {
    console.error("[paydunya-webhook] Échec confirm API:", err.message);
    return NextResponse.json({ error: "Verification failed" }, { status: 502 });
  }

  // Récupérer l'invoiceId depuis custom_data (clé de réconciliation)
  const invoiceId =
    confirmed.invoice_id ??
    payload?.data?.custom_data?.invoice_id;

  if (!invoiceId) {
    console.error("[paydunya-webhook] invoice_id introuvable", hash);
    return NextResponse.json({ error: "Missing invoice_id" }, { status: 400 });
  }

  // 2. Idempotence — vérifier si déjà traité
  const existingPayment = await prisma.payment.findFirst({
    where: { psp_reference: invoiceId, status: "succeeded" },
  });
  if (existingPayment) {
    return NextResponse.json({ received: true });
  }

  // 3. Paiement échoué ou annulé
  if (confirmed.status !== "completed") {
    await prisma.payment.updateMany({
      where: { psp_reference: invoiceId },
      data: { status: "failed" },
    });

    const payment = await prisma.payment.findFirst({
      where: { psp_reference: invoiceId },
      select: { booking_id: true },
    });

    if (payment) {
      await enqueue("track-event", {
        event_type: "payment_failed",
        booking_id: payment.booking_id,
        properties: { status: confirmed.status, provider: "paydunya", hash },
      });
    }

    return NextResponse.json({ received: true });
  }

  // 4. Paiement réussi — déléguer à QStash (async, évite les timeouts)
  await enqueue("confirm-payment", {
    psp_reference: invoiceId,
    amount:        confirmed.total_amount,
    currency:      confirmed.currency,
    provider:      "paydunya",
  });

  return NextResponse.json({ received: true });
}
