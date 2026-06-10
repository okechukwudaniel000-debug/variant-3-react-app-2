/* ============================================================
   Shared domain types for the Daniel Gadgets storefront.
   Single source of truth consumed by the data layer, API
   routes, and React components.
============================================================ */

export type CategoryKey = 'phones' | 'laptops' | 'tablets' | 'audio' | 'gaming' | 'accessories';

export interface Product {
  id: string;
  brand: string;
  category: CategoryKey;
  name: string;
  description: string;
  price: number;
  stock: boolean;
  specs: Record<string, string>;
  image?: string;
  gradient?: string;
  deviceGradient?: string;
  screenGradient?: string;
  /** Curated flag surfaced as a "Featured" rail/badge. */
  featured?: boolean;
}

export interface Review {
  id: number;
  initials: string;
  name: string;
  location: string;
  text: string;
  stars: number;
  color: string;
}

export interface CategoryFilter {
  key: 'all' | CategoryKey;
  label: string;
}

export interface CartItem {
  id: string;
  qty: number;
}

export type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'name';
