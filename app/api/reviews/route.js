import { NextResponse } from 'next/server';
import reviews from '@/data/reviews.json';
import { withCors } from '@/lib/cors';

// GET /api/reviews -> all customer reviews
function getHandler() {
  return NextResponse.json(reviews);
}

export const GET = withCors(getHandler);
export const OPTIONS = withCors(async () => new NextResponse(null, { status: 204 }));
