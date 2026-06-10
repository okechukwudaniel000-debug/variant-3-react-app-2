import { NextResponse } from 'next/server';
import { getProductsByCategory, isValidCategory } from '@/lib/products';

// GET /api/products            -> all products
// GET /api/products?category=  -> products filtered by a whitelisted category
export function GET(request) {
  const category = request.nextUrl.searchParams.get('category');

  // Reject unknown category values rather than silently returning everything.
  if (category && !isValidCategory(category)) {
    return NextResponse.json({ error: 'Unknown category' }, { status: 400 });
  }

  return NextResponse.json(getProductsByCategory(category ?? 'all'));
}
