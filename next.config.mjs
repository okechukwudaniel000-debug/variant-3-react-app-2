/** @type {import('next').NextConfig} */

// Static security headers applied to every response. The Content-Security-Policy
// is intentionally NOT here — it needs a per-request nonce and is set in
// middleware.ts (see that file).
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.unsplash.com' },
      { protocol: 'https', hostname: '**.apple.com' },
      { protocol: 'https', hostname: '**.samsung.com' },
      { protocol: 'https', hostname: '**.gsmarena.com' },
      { protocol: 'https', hostname: '**.appmifile.com' },
      { protocol: 'https', hostname: '**.static.pub' },
      { protocol: 'https', hostname: '**.dell.com' },
      { protocol: 'https', hostname: '**.sony.co.uk' },
      { protocol: 'https', hostname: '**.sony.com' },
      { protocol: 'https', hostname: '**.tecno-mobile.com' },
      { protocol: 'https', hostname: '**.playstation.com' },
      { protocol: 'https', hostname: '**.meta.com' },
      { protocol: 'https', hostname: '**.cdn-apple.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      {
        source: '/products',
        destination: 'https://featured.daniel-gadgets.com',
        permanent: true,
      },
      {
        source: '/products/:path*',
        destination: 'https://featured.daniel-gadgets.com/:path*',
        permanent: true,
      },
      {
        source: '/reviews',
        destination: 'https://reviews.daniel-gadgets.com',
        permanent: true,
      },
      {
        source: '/reviews/:path*',
        destination: 'https://reviews.daniel-gadgets.com/:path*',
        permanent: true,
      },
      {
        source: '/contact',
        destination: 'https://contact.daniel-gadgets.com',
        permanent: true,
      },
      {
        source: '/contact/:path*',
        destination: 'https://contact.daniel-gadgets.com/:path*',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
