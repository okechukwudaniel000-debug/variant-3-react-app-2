import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as contactPOST } from '@/app/api/contact/route';
import { POST as newsletterPOST } from '@/app/api/newsletter/route';
import { GET as productsGET } from '@/app/api/products/route';

function jsonReq(url: string, body: unknown, ip: string) {
  return new NextRequest(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  });
}

describe('POST /api/contact', () => {
  it('rejects malformed input with 400', async () => {
    const res = await contactPOST(
      jsonReq('http://x/api/contact', { name: 'x', email: 'bad', message: '' }, '10.0.0.1')
    );
    expect(res.status).toBe(400);
  });

  it('accepts valid input with 200 and does not echo the payload', async () => {
    const res = await contactPOST(
      jsonReq(
        'http://x/api/contact',
        { name: 'Ada Lovelace', email: 'ada@example.com', message: 'Hello there' },
        '10.0.0.2'
      )
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(JSON.stringify(data)).not.toContain('ada@example.com');
  });
});

describe('POST /api/newsletter', () => {
  it('rejects an invalid email with 400', async () => {
    const res = await newsletterPOST(
      jsonReq('http://x/api/newsletter', { email: 'nope' }, '10.0.1.1')
    );
    expect(res.status).toBe(400);
  });

  it('accepts a valid email with 201', async () => {
    const email = `sub-${Math.random().toString(36).slice(2)}@example.com`;
    const res = await newsletterPOST(
      jsonReq('http://x/api/newsletter', { email }, '10.0.1.2')
    );
    expect(res.status).toBe(201);
  });
});

describe('GET /api/products', () => {
  it('rejects an unknown category with 400', async () => {
    const res = await productsGET(new NextRequest('http://x/api/products?category=hax'));
    expect(res.status).toBe(400);
  });

  it('returns a filtered list for a valid category', async () => {
    const res = await productsGET(new NextRequest('http://x/api/products?category=phones'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.every((p: { category: string }) => p.category === 'phones')).toBe(true);
  });
});
