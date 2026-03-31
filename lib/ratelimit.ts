import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type Window = `${number} ${"s" | "m" | "h" | "d"}`;

// Lazy — instancié uniquement si Redis est configuré
function makeRatelimit(requests: number, window: Window): Ratelimit | null {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null; // dev sans Redis = pas de limite
  try {
    return new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(requests, window),
      analytics: false,
    });
  } catch {
    return null;
  }
}

// Instances créées au premier import (build-safe car makeRatelimit gère l'absence de vars)
export const authRatelimit   = makeRatelimit(5,  "15 m");
export const apiRatelimit    = makeRatelimit(60, "1 m");
export const quotesRatelimit = makeRatelimit(10, "1 h");

/**
 * Retourne true si la requête doit être bloquée (limite atteinte).
 * Retourne false si Redis non configuré (mode dégradé silencieux).
 */
export async function isRateLimited(
  limiter: Ratelimit | null,
  identifier: string
): Promise<boolean> {
  if (!limiter) return false;
  const { success } = await limiter.limit(identifier);
  return !success;
}
