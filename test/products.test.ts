import { describe, it, expect } from 'vitest';
import {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  deriveCategories,
  isValidCategory,
  formatNaira,
  sortProducts,
  searchProducts,
  getFeaturedProducts,
  getRelatedProducts,
} from '@/lib/products';

describe('products data layer', () => {
  it('loads products', () => {
    expect(getAllProducts().length).toBeGreaterThan(0);
  });

  it('derives the filter list from categories actually present (fixes drift)', () => {
    const keys = deriveCategories().map((c) => c.key);
    expect(keys[0]).toBe('all');
    const present = new Set(getAllProducts().map((p) => p.category));
    for (const c of present) expect(keys).toContain(c);
    // tablets/audio/gaming exist in the data and must appear as filters.
    expect(keys).toEqual(expect.arrayContaining(['phones', 'audio', 'gaming', 'tablets']));
  });

  it('looks up by id and returns undefined for unknown', () => {
    const first = getAllProducts()[0];
    expect(getProductById(first.id)?.id).toBe(first.id);
    expect(getProductById('does-not-exist')).toBeUndefined();
  });

  it('whitelists categories', () => {
    expect(isValidCategory('phones')).toBe(true);
    expect(isValidCategory('all')).toBe(true);
    expect(isValidCategory('hax')).toBe(false);
  });

  it('filters by category', () => {
    const phones = getProductsByCategory('phones');
    expect(phones.every((p) => p.category === 'phones')).toBe(true);
    expect(getProductsByCategory('all').length).toBe(getAllProducts().length);
  });

  it('formats Naira', () => {
    expect(formatNaira(1850000)).toBe('₦1,850,000');
    expect(formatNaira(0)).toBe('₦0');
  });

  it('sorts by price and name', () => {
    const asc = sortProducts(getAllProducts(), 'price-asc');
    expect(asc[0].price).toBeLessThanOrEqual(asc[asc.length - 1].price);
    const desc = sortProducts(getAllProducts(), 'price-desc');
    expect(desc[0].price).toBeGreaterThanOrEqual(desc[desc.length - 1].price);
    const byName = sortProducts(getAllProducts(), 'name');
    expect(byName[0].name.localeCompare(byName[1].name)).toBeLessThanOrEqual(0);
  });

  it('searches name/brand/description case-insensitively', () => {
    const res = searchProducts(getAllProducts(), 'IPHONE');
    expect(res.length).toBeGreaterThan(0);
    expect(res.every((p) => /iphone/i.test(`${p.name} ${p.brand} ${p.description}`))).toBe(true);
    expect(searchProducts(getAllProducts(), '   ').length).toBe(getAllProducts().length);
  });

  it('marks featured products and finds related', () => {
    const featured = getFeaturedProducts();
    expect(featured.length).toBeGreaterThan(0);
    const related = getRelatedProducts(featured[0]);
    expect(related.every((r) => r.id !== featured[0].id)).toBe(true);
    expect(related.every((r) => r.category === featured[0].category)).toBe(true);
  });
});
