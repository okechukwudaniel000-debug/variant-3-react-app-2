import { NextResponse } from 'next/server';
import products from '@/data/products.json';

// GET /api/products/:id -> single product, 404 if not found
export async function GET(request, { params }) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  return NextResponse.json(product);
}
