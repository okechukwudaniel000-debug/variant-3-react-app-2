import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// It's a best practice to get the root domain from environment variables
// for easier configuration across staging and production environments.
// In development, this can be 'localhost:3000'.
// Create a .env.local file in your project root and add:
// NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'yourdomain.com';

// Define the mapping of subdomains to internal application paths
const SUBDOMAIN_MAP: { [key: string]: string } = {
    'featured': '/products', // 'featured.yourdomain.com' -> '/products'
    'reviews': '/reviews',     // 'reviews.yourdomain.com'  -> '/reviews'
    'contact': '/contact',   // 'contact.yourdomain.com'  -> '/contact'
    'api': '/api',             // 'api.yourdomain.com' -> '/api'
};

export function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();
    const hostname = request.headers.get('host') || '';

    // Clean the hostname to extract the subdomain
    // Handles 'yourdomain.com', 'sub.yourdomain.com', 'localhost:3000', 'sub.localhost:3000'
    const subdomain = hostname.replace(ROOT_DOMAIN, '').split('.')[0];

    // Handle requests to the main domain (e.g., 'yourdomain.com' or 'www.yourdomain.com')
    if (!subdomain || subdomain === 'www') {
        // This is a request to the main site, so we let it proceed without rewriting.
        return NextResponse.next();
    }

    const internalPath = SUBDOMAIN_MAP[subdomain];

    if (internalPath) {
        // Rewrite the URL to the internal path
        // e.g., 'featured.yourdomain.com/some-product' becomes a request for '/products/some-product'
        url.pathname = `${internalPath}${url.pathname}`;
        return NextResponse.rewrite(url);
    }

    // Allow all other requests to proceed as normal
    return NextResponse.next();
}

export const config = {
  // Matcher to ensure the middleware runs on all requests except for static assets.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};