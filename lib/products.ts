/* ============================================================
   Product data-access layer. The bundled data/products.json is
   the single canonical store; every consumer (API routes, the
   product grid, detail pages) goes through these helpers so the
   category list can never drift out of sync again.
============================================================ */
import rawProducts from '@/data/products.json';
import type { CategoryFilter, CategoryKey, Product, SortKey } from './types';

// Curated set surfaced as "Featured" on the home page.
const FEATURED_IDS = new Set(['i16pm', 'zfold6', 's24fe', 'watchultra', 'ps5slim', 'quest3']);

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  phones: 'Phones',
  laptops: 'Laptops',
  tablets: 'Tablets',
  audio: 'Audio',
  gaming: 'Gaming',
  accessories: 'Accessories',
};

// Order categories appear in the filter bar (only those present in data are shown).
const CATEGORY_ORDER: CategoryKey[] = [
  'phones',
  'laptops',
  'tablets',
  'audio',
  'gaming',
  'accessories',
];

const ALL_PRODUCTS: Product[] = (rawProducts as unknown as Product[]).map((p) => ({
  ...p,
  featured: FEATURED_IDS.has(p.id),
}));

export function getAllProducts(): Product[] {
  return ALL_PRODUCTS;
}

export function getProductById(id: string): Product | undefined {
  return ALL_PRODUCTS.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  if (!category || category === 'all') return ALL_PRODUCTS;
  return ALL_PRODUCTS.filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return ALL_PRODUCTS.filter((p) => p.featured);
}

/** Related products in the same category, excluding the current one. */
export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return ALL_PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(
    0,
    limit
  );
}

/** Build the filter bar from categories actually present in the data. */
export function deriveCategories(products: Product[] = ALL_PRODUCTS): CategoryFilter[] {
  const present = new Set(products.map((p) => p.category));
  const ordered = CATEGORY_ORDER.filter((c) => present.has(c));
  return [
    { key: 'all', label: 'All' },
    ...ordered.map((c) => ({ key: c, label: CATEGORY_LABELS[c] ?? labelize(c) })),
  ];
}

export function isValidCategory(category: string): boolean {
  return category === 'all' || (CATEGORY_ORDER as string[]).includes(category);
}

/** Naira currency formatting used across the UI. */
export function formatNaira(amount: number): string {
  return `₦${Math.round(amount).toLocaleString('en-NG')}`;
}

export function sortProducts(products: Product[], sort: SortKey): Product[] {
  const copy = [...products];
  switch (sort) {
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price);
    case 'name':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case 'featured':
    default:
      return copy.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
}

/** Case-insensitive search across name, brand and description. */
export function searchProducts(products: Product[], query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
  );
}

function labelize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
