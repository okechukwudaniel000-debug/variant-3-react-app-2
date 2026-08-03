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

const LS = { cart: 'dg_cart', wishlist: 'dg_wishlist', recent: 'dg_recent', user: 'dg_user', auth: 'dg_auth' } as const;
const RECENT_MAX = 8;
const AUTH_COOKIE_DOMAIN = '.daniel-gadgets.com';

type DrawerTab = 'cart' | 'wishlist';

interface User {
  name: string;
  email: string;
  initial: string;
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 86_400_000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; domain=${AUTH_COOKIE_DOMAIN}; Secure; SameSite=Lax`;
}

function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${AUTH_COOKIE_DOMAIN}; Secure; SameSite=Lax`;
}

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
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>('cart');
  const [quickViewId, setQuickViewId] = useState<string | null>(null);

  // Hydrate from localStorage on mount. State intentionally starts empty so the
  // server render and the client's first render match; we then read the external
  // store (localStorage) once and sync it in. This is the legitimate "subscribe
  // to an external system" case the rule allows — not a cascading render — and a
  // lazy useState initializer can't be used here because it runs during SSR
  // (no localStorage) and would reintroduce a hydration mismatch.
  useEffect(() => {
    const storedUser = readLS<User | null>(LS.user, null);
    const storedCart = readLS<CartItem[]>(LS.cart, []);
    const storedWishlist = readLS<string[]>(LS.wishlist, []);
    const storedRecent = readLS<string[]>(LS.recent, []);
    const cookieAuth = readCookie(LS.auth);

    let resolvedUser = storedUser;
    if (!resolvedUser && cookieAuth) {
      try {
        resolvedUser = JSON.parse(cookieAuth) as User;
      } catch {
        // Ignore malformed cookie
      }
    }

    /* eslint-disable react-hooks/set-state-in-effect -- one-time external-store hydration, see above */
    setUser(resolvedUser);
    setCart(storedCart);
    setWishlist(storedWishlist);
    setRecentlyViewed(storedRecent);
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
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
    setCookie(LS.auth, JSON.stringify(newUser), 30);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    deleteCookie(LS.auth);
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
