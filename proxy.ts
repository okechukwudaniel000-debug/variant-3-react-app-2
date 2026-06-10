import { NextResponse, type NextRequest } from 'next/server';

/* ============================================================
   Content-Security-Policy with a per-request nonce.

   The App Router emits inline hydration scripts, so a strict
   script-src cannot use hashes alone — it needs a nonce that
   Next.js propagates to its own scripts. We generate one per
   request here, expose it via the `x-nonce` request header (read
   by app/layout.js for the inline theme script), and set the CSP
   on both the request and response as Next.js requires.

   (Next 16 renamed the `middleware` convention to `proxy`.)
============================================================ */
export function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const isDev = process.env.NODE_ENV !== 'production';

  const csp = [
    `default-src 'self'`,
    // 'strict-dynamic' lets nonce'd scripts load their own dependencies;
    // 'unsafe-eval' is dev-only (React Fast Refresh / HMR).
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    // Inline styles (React style props / Google Fonts) — low XSS risk.
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `img-src 'self' data: blob: https://images.unsplash.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `connect-src 'self'`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  // Run on page routes; skip API routes, static assets, and the image optimizer.
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
