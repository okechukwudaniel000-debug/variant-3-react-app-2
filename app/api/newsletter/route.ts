import { NextResponse } from 'next/server';
import { validateStrings } from '@/lib/validation';
import { rateLimit, clientIp } from '@/lib/rate-limit';

const MAX_BODY_BYTES = 2 * 1024;

// POST /api/newsletter -> validated, rate-limited email capture (footer signup).
export async function POST(request: Request): Promise<NextResponse> {
  const ip = clientIp(request);
  const limit = rateLimit(`newsletter:${ip}`, 5, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    );
  }

  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const email = (body as { email?: unknown })?.email;
  const result = validateStrings([{ field: 'email', value: email, max: 254, email: true }]);
  if (!result.ok) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  console.log(`[newsletter] subscribe: ${result.value!.email}`);
  return NextResponse.json({ success: true, message: 'You are subscribed. Welcome aboard!' });
}
