import { NextResponse } from 'next/server';
import { validateStrings } from '@/lib/validation';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { withCors } from '@/lib/cors';

const MAX_BODY_BYTES = 2 * 1024;
const DATA_DIR = join(process.cwd(), 'data');
const SUBSCRIBERS_FILE = join(DATA_DIR, 'subscribers.json');

// POST /api/newsletter -> validated, rate-limited email capture (footer signup).
async function postHandler(request: Request): Promise<NextResponse> {
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

  const validatedEmail = result.value!.email.toLowerCase();

  try {
    // Ensure data directory exists
    try {
      await mkdir(DATA_DIR, { recursive: true });
    } catch (err) {
      // Ignore if directory already exists
    }

    let subscribers: { email: string; timestamp: string }[] = [];
    try {
      const content = await readFile(SUBSCRIBERS_FILE, 'utf-8');
      subscribers = JSON.parse(content);
    } catch (err: any) {
      if (err.code !== 'ENOENT') {
        console.error('[newsletter] error reading subscribers:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      }
    }

    // Check for existing subscription
    if (subscribers.some((s) => s.email.toLowerCase() === validatedEmail)) {
      return NextResponse.json({ error: 'This email is already subscribed.' }, { status: 400 });
    }

    // Add new subscriber
    subscribers.push({
      email: validatedEmail,
      timestamp: new Date().toISOString(),
    });

    // Write back to file
    await writeFile(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));

    console.log(`[newsletter] subscribe success: ${validatedEmail}`);
    return NextResponse.json(
      { success: true, message: 'You are subscribed. Welcome aboard!' },
      { status: 201 }
    );
  } catch (err) {
    console.error('[newsletter] error saving subscriber:', err);
    return NextResponse.json({ error: 'Failed to save subscription. Please try again.' }, { status: 500 });
  }
}

export const POST = withCors(postHandler);
export const OPTIONS = withCors(async () => new NextResponse(null, { status: 204 }));
