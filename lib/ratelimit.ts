import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Fallback no-op si Redis non configuré (dev local sans .env)
function makeRatelimit(requests: number, window: `${number} ${"s" | "m" | "h" | "d"}`) {
  try {
    const redis = Redis.fromEnv();
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(requests, window),
      analytics: false,
    });
  } catch {
    // En dev sans Upstash configuré : toujours autoriser
    return null;
  }
}

export const authRatelimit    = makeRatelimit(5,  "15 m"); // 5 tentatives / 15 min
export const apiRatelimit     = makeRatelimit(60, "1 m");  // 60 req / min
export const quotesRatelimit  = makeRatelimit(10, "1 h");  // 10 devis / heure

/**
 * Vérifie la limite de taux. Retourne true si la requête doit être bloquée.
 */
export async function isRateLimited(
  limiter: ReturnType<typeof makeRatelimit>,
  identifier: string
): Promise<boolean> {
  if (!limiter) return false; // pas de Redis = pas de limite (dev)
  const { success } = await limiter.limit(identifier);
  return !success;
}
