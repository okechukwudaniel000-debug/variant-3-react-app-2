import { NextResponse } from 'next/server';
import reviews from '@/data/reviews.json';

// GET /api/reviews -> all customer reviews
export function GET() {
  return NextResponse.json(reviews);
}
