import { NextRequest, NextResponse } from "next/server";
import { qstashReceiver } from "@/lib/qstash";
import { prisma } from "@/lib/prisma";
import { cleanupExpiredLocks } from "@/lib/services/availability.service";
import { sendBookingConfirmed, sendPaymentReceived, sendLockExpired } from "@/lib/resend";

interface QStashJob {
  job: string;
  payload: Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  const body = await req.text();

  // Verify Upstash signature
  const signature = req.headers.get("upstash-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  const isValid = await qstashReceiver.verify({
    signature,
    body,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/qstash`,
  });

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let jobData: QStashJob;
  try {
    jobData = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { job, payload } = jobData;

  switch (job) {
    case "cleanup-expired-locks":
      return handleCleanupLocks();

    case "send-notification":
      return handleNotification(payload);

    case "confirm-payment":
      return handleConfirmPayment(payload);

    case "track-event":
      return handleTrackEvent(payload);

    default:
      return NextResponse.json({ error: `Unknown job: ${job}` }, { status: 400 });
  }
}

async function handleCleanupLocks() {
  const count = await cleanupExpiredLocks();
  return NextResponse.json({ success: true, cleaned: count });
}

async function handleConfirmPayment(payload: Record<string, unknown>) {
  const { psp_reference, amount, currency, provider } = payload as {
    psp_reference: string;
    amount: number;
    currency: string;
    provider: "stripe" | "paydunya";
  };

  const payment = await prisma.payment.findFirst({
    where: { psp_reference },
    include: {
      booking: {
        include: {
          user: true,
          venue: { include: { owner: true } },
        },
      },
    },
  });

  if (!payment) {
    console.error("[confirm-payment] Payment introuvable:", psp_reference);
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  // Idempotence
  if (payment.status === "succeeded") {
    return NextResponse.json({ success: true, idempotent: true });
  }

  const booking = payment.booking;

  // 1. Mettre à jour Payment
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "succeeded" },
  });

  // 2. Mettre à jour Booking
  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "confirmed" },
  });

  // 3. Créditer le wallet propriétaire (CI uniquement)
  if (provider === "paydunya") {
    const commissionAmount = Number(payment.commission_amount ?? 0);
    const netAmount = amount - commissionAmount;

    const wallet = await prisma.wallet.findFirst({
      where: { user_id: booking.venue.owner_id },
    });

    if (wallet) {
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: netAmount } },
      });
    } else {
      await prisma.wallet.create({
        data: {
          user_id: booking.venue.owner_id,
          balance: netAmount,
          currency: "XOF",
        },
      });
    }
  }

  // 4. AuditLog
  await prisma.auditLog.create({
    data: {
      action: "payment_confirmed",
      target_type: "Booking",
      target_id: booking.id,
      metadata: { psp_reference, amount, currency, provider },
    },
  });

  // 5. Emails
  if (booking.user.email) {
    await sendBookingConfirmed(booking.user.email, {
      clientName: booking.user.email,
      venueName: booking.venue.name,
      eventDate: booking.created_at.toLocaleDateString("fr-FR"),
      totalPrice: Number(booking.total_price),
      currency: booking.client_currency ?? currency,
      bookingId: booking.id,
    }).catch(console.error);
  }

  if (booking.venue.owner.email) {
    await sendPaymentReceived(booking.venue.owner.email, {
      name: booking.venue.owner.email,
      amount,
      currency,
      bookingId: booking.id,
    }).catch(console.error);
  }

  // 6. Notifications in-app
  await prisma.notification.create({
    data: {
      user_id: booking.user_id,
      type: "booking_confirmed",
      title: "Réservation confirmée",
      body: `Votre réservation pour ${booking.venue.name} est confirmée.`,
    },
  });

  await prisma.notification.create({
    data: {
      user_id: booking.venue.owner_id,
      type: "payment_received",
      title: "Paiement reçu",
      body: `Acompte reçu — Réservation #${booking.id.slice(0, 8)}`,
    },
  });

  return NextResponse.json({ success: true });
}

async function handleNotification(payload: Record<string, unknown>) {
  const { userId, type, title, body, email, emailData } = payload as {
    userId: string;
    type: string;
    title: string;
    body?: string;
    email?: string;
    emailData?: Record<string, unknown>;
  };

  await prisma.notification.create({
    data: { user_id: userId, type, title, body },
  });

  // Email optionnel
  if (email && emailData) {
    if (type === "lock_expired") {
      await sendLockExpired(email, {
        clientName: (emailData.clientName as string) ?? email,
        venueName: (emailData.venueName as string) ?? "l'espace",
      }).catch(console.error);
    }
  }

  return NextResponse.json({ success: true });
}

async function handleTrackEvent(payload: Record<string, unknown>) {
  const { event_type, user_id, venue_id, booking_id, properties } = payload as {
    event_type: string;
    user_id?: string;
    venue_id?: string;
    booking_id?: string;
    properties?: Record<string, unknown>;
  };

  await prisma.event.create({
    data: {
      event_type,
      user_id: user_id ?? null,
      venue_id: venue_id ?? null,
      booking_id: booking_id ?? null,
      properties: (properties ?? {}) as object,
    },
  });

  return NextResponse.json({ success: true });
}
