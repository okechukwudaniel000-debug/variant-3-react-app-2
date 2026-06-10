import { describe, it, expect } from 'vitest';
import { rateLimit, clientIp } from '@/lib/rate-limit';

describe('rate limiter', () => {
  it('allows up to the limit then blocks within the window', () => {
    const key = `test-${Math.floor(performance.now())}-${Math.round(Math.sin(Date.now()) * 1e6)}`;
    const limit = 3;
    for (let i = 0; i < limit; i++) {
      expect(rateLimit(key, limit, 60_000).allowed).toBe(true);
    }
    const blocked = rateLimit(key, limit, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect(blocked.remaining).toBe(0);
  });

  it('resets after the window elapses', async () => {
    const key = 'short-window';
    expect(rateLimit(key, 1, 10).allowed).toBe(true);
    expect(rateLimit(key, 1, 10).allowed).toBe(false);
    await new Promise((r) => setTimeout(r, 20));
    expect(rateLimit(key, 1, 10).allowed).toBe(true);
  });

  it('derives client ip from x-forwarded-for', () => {
    const req = new Request('http://x', { headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' } });
    expect(clientIp(req)).toBe('1.2.3.4');
    expect(clientIp(new Request('http://x'))).toBe('unknown');
  });
});
