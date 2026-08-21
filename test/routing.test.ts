import { describe, it, expect, beforeEach } from 'vitest';

const DOMAIN = 'daniel-gadgets.com';

const SUBDOMAIN_MAP: Record<string, string> = {
  featured: '/products',
  reviews: '/reviews',
  contact: '/contact',
};

function getSubdomain(host: string): string | null {
  const normalized = host.replace(/\.$/, '');
  if (normalized.endsWith(`.${DOMAIN}`)) {
    return normalized.slice(0, normalized.length - DOMAIN.length - 1);
  }
  if (normalized === DOMAIN) {
    return null;
  }
  return null;
}

function getMappedPath(subdomain: string): string | null {
  return SUBDOMAIN_MAP[subdomain] ?? null;
}

describe('getSubdomain', () => {
  it('extracts featured subdomain', () => {
    expect(getSubdomain('featured.daniel-gadgets.com')).toBe('featured');
  });

  it('extracts reviews subdomain', () => {
    expect(getSubdomain('reviews.daniel-gadgets.com')).toBe('reviews');
  });

  it('extracts contact subdomain', () => {
    expect(getSubdomain('contact.daniel-gadgets.com')).toBe('contact');
  });

  it('returns null for root domain', () => {
    expect(getSubdomain('daniel-gadgets.com')).toBeNull();
  });

  it('returns null for root domain with trailing dot', () => {
    expect(getSubdomain('daniel-gadgets.com.')).toBeNull();
  });

  it('extracts api subdomain', () => {
    expect(getSubdomain('api.daniel-gadgets.com')).toBe('api');
  });

  it('extracts www subdomain', () => {
    expect(getSubdomain('www.daniel-gadgets.com')).toBe('www');
  });

  it('extracts unknown subdomain', () => {
    expect(getSubdomain('unknown.daniel-gadgets.com')).toBe('unknown');
  });

  it('returns null for non-matching domain', () => {
    expect(getSubdomain('example.com')).toBeNull();
  });

  it('handles Vercel preview URLs', () => {
    expect(getSubdomain('my-project.vercel.app')).toBeNull();
  });
});

describe('getMappedPath', () => {
  it('maps featured to /products', () => {
    expect(getMappedPath('featured')).toBe('/products');
  });

  it('maps reviews to /reviews', () => {
    expect(getMappedPath('reviews')).toBe('/reviews');
  });

  it('maps contact to /contact', () => {
    expect(getMappedPath('contact')).toBe('/contact');
  });

  it('returns null for unmapped subdomains', () => {
    expect(getMappedPath('api')).toBeNull();
  });

  it('returns null for unknown subdomains', () => {
    expect(getMappedPath('unknown')).toBeNull();
  });
});

describe('subdomain rewrite logic', () => {
  it('rewrites featured subdomain with path to /products path', () => {
    const subdomain = getSubdomain('featured.daniel-gadgets.com');
    const mapped = getMappedPath(subdomain!);
    expect(mapped).toBe('/products');
  });

  it('rewrites featured subdomain with path suffix preserved', () => {
    const subdomain = getSubdomain('featured.daniel-gadgets.com');
    const mapped = getMappedPath(subdomain!);
    const path = '/iphone-16';
    expect(`${mapped}${path}`).toBe('/products/iphone-16');
  });

  it('rewrites reviews subdomain with path to /reviews path', () => {
    const subdomain = getSubdomain('reviews.daniel-gadgets.com');
    const mapped = getMappedPath(subdomain!);
    expect(mapped).toBe('/reviews');
  });

  it('rewrites contact subdomain with path to /contact path', () => {
    const subdomain = getSubdomain('contact.daniel-gadgets.com');
    const mapped = getMappedPath(subdomain!);
    expect(mapped).toBe('/contact');
  });

  it('passes through root domain without rewrite', () => {
    const subdomain = getSubdomain('daniel-gadgets.com');
    expect(subdomain).toBeNull();
  });

  it('passes through api subdomain without rewrite', () => {
    const subdomain = getSubdomain('api.daniel-gadgets.com');
    expect(subdomain).toBe('api');
  });
});