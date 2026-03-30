import { NextRequest, NextResponse } from "next/server";
import { qstashReceiver } from "@/lib/qstash";
import { prisma } from "@/lib/prisma";
import { cleanupExpiredLocks } from "@/lib/services/availability.service";

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

async function handleNotification(payload: Record<string, unknown>) {
  const { user_id, type, title, body } = payload as {
    user_id: string;
    type: string;
    title: string;
    body?: string;
  };

  await prisma.notification.create({
    data: { user_id, type, title, body },
  });

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
