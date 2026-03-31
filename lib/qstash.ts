import { Client, Receiver } from "@upstash/qstash";

// Clients lazy — instanciés uniquement au premier appel
let _qstash: Client | null = null;
let _receiver: Receiver | null = null;

function getQstash(): Client {
  if (_qstash) return _qstash;
  const token = process.env.QSTASH_TOKEN;
  if (!token) throw new Error("QSTASH_TOKEN est requis");
  _qstash = new Client({ token });
  return _qstash;
}

export function getQstashReceiver(): Receiver {
  if (_receiver) return _receiver;
  const current = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const next    = process.env.QSTASH_NEXT_SIGNING_KEY;
  if (!current || !next) throw new Error("QSTASH_CURRENT_SIGNING_KEY et QSTASH_NEXT_SIGNING_KEY sont requis");
  _receiver = new Receiver({ currentSigningKey: current, nextSigningKey: next });
  return _receiver;
}

// Export de compatibilité pour les imports existants
export const qstashReceiver = new Proxy({} as Receiver, {
  get(_target, prop) {
    return (getQstashReceiver() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export async function enqueue(
  job: string,
  payload: Record<string, unknown>,
  delaySeconds = 0
) {
  const appUrl     = process.env.NEXT_PUBLIC_APP_URL ?? "https://noscoins.app";
  const webhookUrl = `${appUrl}/api/webhooks/qstash` as never;
  await getQstash().publishJSON({
    url: webhookUrl,
    body: { job, payload },
    ...(delaySeconds > 0 ? { delay: delaySeconds } : {}),
  });
}
