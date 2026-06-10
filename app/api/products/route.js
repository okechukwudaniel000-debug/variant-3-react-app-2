import { NextResponse } from 'next/server';
import products from '@/data/products.json';

// GET /api/products            -> all products
// GET /api/products?category=  -> products filtered by category
// Mirrors the original Express endpoint contract.
export function GET(request) {
  const category = request.nextUrl.searchParams.get('category');

  let filtered = products;
  if (category && category !== 'all') {
    filtered = products.filter((p) => p.category === category);
  }

  return NextResponse.json(filtered);
}
