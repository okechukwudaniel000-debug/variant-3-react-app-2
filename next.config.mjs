/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Product imagery is served from external CDNs via plain <img> tags to preserve
  // the original design exactly, so the next/image optimizer is not required here.
};

export default nextConfig;
