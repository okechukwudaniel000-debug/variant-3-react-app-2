import { NextResponse } from 'next/server';

// POST /api/contact -> placeholder relay, mirrors the original Express endpoint.
export async function POST(request) {
  try {
    const { name, email, message } = await request.json();
    console.log(`Received message from ${name} (${email}): ${message}`);
    return NextResponse.json({
      success: true,
      message: 'Message received by futuristic relay system.',
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
