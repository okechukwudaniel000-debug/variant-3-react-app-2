/* ============================================================
   Best-effort in-memory rate limiter (fixed-window) keyed by a
   caller identifier (usually client IP).

   NOTE: state lives in a single process, so this protects a
   single instance only. For multi-instance/serverless deployments
   a shared store (Redis/Upstash) should back this — the interface
   is kept intentionally swappable.
============================================================ */

interface Counter {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Counter>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  retryAfterSeconds: number;
}

/**
 * @param key      caller identity (e.g. ip + route)
 * @param limit    max requests allowed per window
 * @param windowMs window length in milliseconds
 */
export function rateLimit(key: string, limit = 5, windowMs = 60_000): RateLimitResult {
  pruneBuckets();
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, limit, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      limit,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: limit - existing.count,
    limit,
    retryAfterSeconds: 0,
  };
}

/** Derive a best-effort client identifier from request headers. */
export function clientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

/** Periodically evict stale buckets to bound memory (call lazily). */
export function pruneBuckets(): void {
  const now = Date.now();
  for (const [key, counter] of buckets) {
    if (counter.resetAt <= now) buckets.delete(key);
  }
}
