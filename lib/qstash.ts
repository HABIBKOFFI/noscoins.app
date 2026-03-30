import { Client, Receiver } from "@upstash/qstash";

export const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
});

export const qstashReceiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

export async function enqueue(
  job: string,
  payload: Record<string, unknown>,
  delaySeconds = 0
) {
  await qstash.publishJSON({
    url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/qstash`,
    body: { job, payload },
    ...(delaySeconds > 0 ? { delay: delaySeconds } : {}),
  });
}
