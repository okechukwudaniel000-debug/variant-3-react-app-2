import { NextResponse, type NextRequest } from 'next/server';

const DOMAIN = process.env.SITE_DOMAIN ?? 'daniel-gadgets.com';

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

/* ============================================================
    Content-Security-Policy with a per-request nonce.

    The App Router emits inline hydration scripts, so a strict
    script-src cannot use hashes alone — it needs a nonce that
    Next.js propagates to its own scripts. We generate one per
    request here, expose it via the `x-nonce` request header (read
    by app/layout.js for the inline theme script), and set the CSP
    on both the request and response as Next.js requires.

    Next 16 renamed the `middleware` convention to `proxy`.
    ============================================================ */
export function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const isDev = process.env.NODE_ENV !== 'production';

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `img-src 'self' data: blob: https://images.unsplash.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `connect-src 'self' https://api.daniel-gadgets.com`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ');

  const host = request.headers.get('host') ?? '';
  const subdomain = getSubdomain(host);

  if (subdomain && subdomain !== 'api' && subdomain !== 'www') {
    const mapped = SUBDOMAIN_MAP[subdomain];
    if (mapped) {
      const url = request.nextUrl.clone();
      url.pathname = `${mapped}${url.pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.redirect(new URL(`https://${DOMAIN}${request.nextUrl.pathname}`, request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
