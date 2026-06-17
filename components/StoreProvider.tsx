'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import type { CartItem, DrawerTab, Product, User } from '@/lib/types';

interface StoreValue {
  hydrated: boolean;
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  cart: CartItem[];
  cartCount: number;
  addToCart: (id: string, qty?: number) => void;
  removeFromCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clearCart: () => void;
  wishlist: string[];
  wishlistCount: number;
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (id: string) => void;
  recentlyViewed: string[];
  addRecentlyViewed: (id: string) => void;
  drawerOpen: boolean;
  drawerTab: DrawerTab;
  openDrawer: (tab?: DrawerTab) => void;
  closeDrawer: () => void;
  quickViewId: string | null;
  openQuickView: (id: string) => void;
  closeQuickView: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const LS = {
  user: 'dg_user',
  cart: 'dg_cart',
  wishlist: 'dg_wishlist',
  recent: 'dg_recent',
};

const RECENT_MAX = 8;

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>('cart');
  const [quickViewId, setQuickViewId] = useState<string | null>(null);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    const user = readLS<User | null>(LS.user, null);
    const cart = readLS<CartItem[]>(LS.cart, []);
    const wishlist = readLS<string[]>(LS.wishlist, []);
    const recent = readLS<string[]>(LS.recent, []);

    queueMicrotask(() => {
      setUser(user);
      setCart(cart);
      setWishlist(wishlist);
      setRecentlyViewed(recent);
      setHydrated(true);
    });
  }, []);

  // Persist after hydration (never overwrite stored data before we've read it).
  useEffect(() => {
    if (hydrated) {
      if (user) localStorage.setItem(LS.user, JSON.stringify(user));
      else localStorage.removeItem(LS.user);
    }
  }, [user, hydrated]);
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

  const login = useCallback((email: string) => {
    // Extract name from email: e.g. "john.doe@example.com" -> "John Doe"
    const namePart = email.split('@')[0];
    const formattedName = namePart
      .split(/[._-]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const newUser: User = {
      name: formattedName,
      email,
      initial: formattedName.charAt(0).toUpperCase(),
    };
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

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
    user,
    login,
    logout,
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
