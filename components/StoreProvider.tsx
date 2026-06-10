'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CartItem } from '@/lib/types';

/* ============================================================
   Client-side store for cart, wishlist and recently-viewed,
   persisted to localStorage. Also holds the shared UI state for
   the cart drawer and quick-view modal so the nav, product grid
   and drawer stay in sync. SSR-safe: state starts empty and
   hydrates on mount (`hydrated` gates count rendering to avoid
   hydration mismatches).
============================================================ */

const LS = { cart: 'dg_cart', wishlist: 'dg_wishlist', recent: 'dg_recent' } as const;
const RECENT_MAX = 8;

type DrawerTab = 'cart' | 'wishlist';

interface StoreValue {
  hydrated: boolean;
  // cart
  cart: CartItem[];
  cartCount: number;
  addToCart: (id: string, qty?: number) => void;
  removeFromCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clearCart: () => void;
  // wishlist
  wishlist: string[];
  wishlistCount: number;
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (id: string) => void;
  // recently viewed
  recentlyViewed: string[];
  addRecentlyViewed: (id: string) => void;
  // drawer
  drawerOpen: boolean;
  drawerTab: DrawerTab;
  openDrawer: (tab?: DrawerTab) => void;
  closeDrawer: () => void;
  // quick view
  quickViewId: string | null;
  openQuickView: (id: string) => void;
  closeQuickView: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>('cart');
  const [quickViewId, setQuickViewId] = useState<string | null>(null);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    setCart(readLS<CartItem[]>(LS.cart, []));
    setWishlist(readLS<string[]>(LS.wishlist, []));
    setRecentlyViewed(readLS<string[]>(LS.recent, []));
    setHydrated(true);
  }, []);

  // Persist after hydration (never overwrite stored data before we've read it).
  useEffect(() => {
    if (hydrated) localStorage.setItem(LS.cart, JSON.stringify(cart));
  }, [cart, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem(LS.wishlist, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem(LS.recent, JSON.stringify(recentlyViewed));
  }, [recentlyViewed, hydrated]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = drawerOpen || quickViewId ? 'hidden' : '';
  }, [drawerOpen, quickViewId]);

  const addToCart = useCallback((id: string, qty = 1) => {
    setCart((prev) => {
      const found = prev.find((i) => i.id === id);
      if (found) return prev.map((i) => (i.id === id ? { ...i, qty: i.qty + qty } : i));
      return [...prev, { id, qty }];
    });
    setDrawerTab('cart');
    setDrawerOpen(true);
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, qty } : i))
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]));
  }, []);

  const isWishlisted = useCallback((id: string) => wishlist.includes(id), [wishlist]);

  const addRecentlyViewed = useCallback((id: string) => {
    setRecentlyViewed((prev) => [id, ...prev.filter((r) => r !== id)].slice(0, RECENT_MAX));
  }, []);

  const openDrawer = useCallback((tab: DrawerTab = 'cart') => {
    setDrawerTab(tab);
    setDrawerOpen(true);
  }, []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const openQuickView = useCallback((id: string) => setQuickViewId(id), []);
  const closeQuickView = useCallback(() => setQuickViewId(null), []);

  const cartCount = useMemo(() => cart.reduce((n, i) => n + i.qty, 0), [cart]);

  const value: StoreValue = {
    hydrated,
    cart,
    cartCount,
    addToCart,
    removeFromCart,
    setQty,
    clearCart,
    wishlist,
    wishlistCount: wishlist.length,
    isWishlisted,
    toggleWishlist,
    recentlyViewed,
    addRecentlyViewed,
    drawerOpen,
    drawerTab,
    openDrawer,
    closeDrawer,
    quickViewId,
    openQuickView,
    closeQuickView,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within <StoreProvider>');
  return ctx;
}
