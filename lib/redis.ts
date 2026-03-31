import { Redis } from "@upstash/redis";

// Client lazy — ne crashe pas si les variables d'env sont absentes au build
let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (_redis) return _redis;
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("UPSTASH_REDIS_REST_URL et UPSTASH_REDIS_REST_TOKEN sont requis");
  }
  _redis = new Redis({ url, token });
  return _redis;
}

// Export de compatibilité — utiliser getRedis() pour les nouveaux fichiers
export const redis = new Proxy({} as Redis, {
  get(_target, prop) {
    return (getRedis() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
