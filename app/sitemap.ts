import type { MetadataRoute } from 'next';
import { getAllProducts } from '@/lib/products';

const SITE_URL = 'https://daniel-gadgets.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const products = getAllProducts().map((p) => ({
    url: `${SITE_URL}/products/${p.id}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/products`, changeFrequency: 'daily', priority: 0.9 },
    ...products,
  ];
}
