import { NextResponse } from 'next/server';
import { getProductById } from '@/lib/products';
import { isSafeSlug } from '@/lib/validation';

// GET /api/products/:id -> single product, 404 if not found
export async function GET(request, { params }) {
  const { id } = await params;

  // Reject malformed ids before touching data.
  if (!isSafeSlug(id)) {
    return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });
  }

  const product = getProductById(id);
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  return NextResponse.json(product);
}
