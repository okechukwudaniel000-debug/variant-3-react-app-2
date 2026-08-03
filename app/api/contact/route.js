import { NextResponse } from 'next/server';
import { validateStrings } from '@/lib/validation';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { withCors } from '@/lib/cors';

// Reject oversized bodies outright (defense against payload abuse).
const MAX_BODY_BYTES = 8 * 1024;

// POST /api/contact -> validated, rate-limited contact relay.
async function postHandler(request) {
  const ip = clientIp(request);
  const limit = rateLimit(`contact:${ip}`, 5, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    );
  }

  // Guard body size before parsing.
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const result = validateStrings([
    { field: 'name', value: body?.name, min: 2, max: 80 },
    { field: 'email', value: body?.email, max: 254, email: true },
    { field: 'message', value: body?.message, min: 2, max: 2000 },
  ]);

  if (!result.ok) {
    // Generic, field-scoped errors only — never echo the raw payload back.
    return NextResponse.json(
      { error: 'Validation failed', fields: result.errors },
      { status: 400 }
    );
  }

  // Sanitized values are safe to log/forward. (No PII echoed in the response.)
  console.log(`[contact] message received from ${result.value.email}`);

  return NextResponse.json({ success: true, message: 'Message received. We will be in touch.' });
}

export const POST = withCors(postHandler);
export const OPTIONS = withCors(async () => new NextResponse(null, { status: 204 }));
