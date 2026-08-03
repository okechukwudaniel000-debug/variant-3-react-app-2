import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define the mapping of subdomains to internal paths
const SUBDOMAIN_MAP: { [key: string]: string | null } = {
    'featured': '/products', // 'featured.yourdomain.com' -> '/products'
    'reviews': '/reviews',     // 'reviews.yourdomain.com'  -> '/reviews'
    'contact': '/contact',   // 'contact.yourdomain.com'  -> '/contact'
    'api': '/api',             // Let 'api.yourdomain.com' pass through to API routes
};

export function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();
    const hostname = request.headers.get('host') || '';

    // NOTE: Replace 'yourdomain.com' with your actual domain.
    const subdomain = hostname.replace('.yourdomain.com', '').split('.')[0];

    const internalPath = SUBDOMAIN_MAP[subdomain];

    if (internalPath) {
        // Rewrite the URL to the internal path
        // e.g., 'featured.yourdomain.com/some-product' becomes a request for '/products/some-product'
        url.pathname = `${internalPath}${url.pathname}`;
        return NextResponse.rewrite(url);
    }

    // Allow all other requests (e.g., for the main domain) to proceed as normal
    return NextResponse.next();
}

export const config = {
  // Matcher to ensure the middleware runs on all requests
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
