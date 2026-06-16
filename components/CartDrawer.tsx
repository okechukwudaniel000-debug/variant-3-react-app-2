'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from './StoreProvider';
import { getProductById, formatNaira } from '@/lib/products';
import { useFocusTrap } from '@/lib/focus-trap';

const WHATSAPP = 'https://wa.me/2349132715125';

/* ============================================================
   Slide-in drawer with Cart and Wishlist tabs. Checkout is a
   WhatsApp handoff (no payment backend in this pass) — the order
   summary is pre-filled into the message.
============================================================ */
export default function CartDrawer() {
  const store = useStore();
  const {
    drawerOpen,
    drawerTab,
    openDrawer,
    closeDrawer,
    cart,
    setQty,
    removeFromCart,
    clearCart,
    wishlist,
    toggleWishlist,
    addToCart,
  } = store;

  const panelRef = useFocusTrap<HTMLDivElement>(drawerOpen);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen, closeDrawer]);

  const cartLines = cart
    .map((item) => ({ item, product: getProductById(item.id) }))
    .filter((l): l is { item: typeof l.item; product: NonNullable<typeof l.product> } =>
      Boolean(l.product)
    );
  const subtotal = cartLines.reduce((sum, l) => sum + l.product.price * l.item.qty, 0);

  const wishlistProducts = wishlist.map(getProductById).filter(Boolean);

  function checkoutViaWhatsApp() {
    const lines = cartLines
      .map(
        (l) => `• ${l.product.name} x${l.item.qty} — ${formatNaira(l.product.price * l.item.qty)}`
      )
      .join('\n');
    const msg = `Hello Daniel Gadgets! I'd like to order:\n\n${lines}\n\nSubtotal: ${formatNaira(subtotal)}`;
    window.open(`${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  }

  return (
    <>
      <div
        className={`drawer-overlay${drawerOpen ? ' on' : ''}`}
        role="presentation"
        onClick={closeDrawer}
      />
      <aside
        className={`cart-drawer${drawerOpen ? ' on' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Cart and wishlist"
        ref={panelRef}
        tabIndex={-1}
      >
        <div className="drawer-head">
          <div className="drawer-tabs" role="tablist" aria-label="Cart or wishlist">
            <button
              role="tab"
              aria-selected={drawerTab === 'cart'}
              className={`drawer-tab${drawerTab === 'cart' ? ' active' : ''}`}
              onClick={() => openDrawer('cart')}
            >
              Cart ({cart.length})
            </button>
            <button
              role="tab"
              aria-selected={drawerTab === 'wishlist'}
              className={`drawer-tab${drawerTab === 'wishlist' ? ' active' : ''}`}
              onClick={() => openDrawer('wishlist')}
            >
              Wishlist ({wishlist.length})
            </button>
          </div>
          <button className="drawer-close" aria-label="Close" onClick={closeDrawer}>
            &times;
          </button>
        </div>

        {drawerTab === 'cart' ? (
          <div className="drawer-body">
            {cartLines.length === 0 ? (
              <p className="drawer-empty">Your cart is empty.</p>
            ) : (
              cartLines.map(({ item, product }) => (
                <div className="drawer-line" key={item.id}>
                  <div className="drawer-thumb" style={{ background: product.gradient }}>
                    {product.image && (
                      <Image src={product.image} alt={product.name} width={56} height={56} />
                    )}
                  </div>
                  <div className="drawer-line-info">
                    <Link
                      href={`/products/${product.id}`}
                      className="drawer-line-name"
                      onClick={closeDrawer}
                    >
                      {product.name}
                    </Link>
                    <div className="drawer-line-price">{formatNaira(product.price)}</div>
                    <div className="qty-ctl">
                      <button
                        aria-label="Decrease quantity"
                        onClick={() => setQty(item.id, item.qty - 1)}
                      >
                        −
                      </button>
                      <span aria-live="polite">{item.qty}</span>
                      <button
                        aria-label="Increase quantity"
                        onClick={() => setQty(item.id, item.qty + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    className="drawer-remove"
                    aria-label={`Remove ${product.name}`}
                    onClick={() => removeFromCart(item.id)}
                  >
                    &times;
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="drawer-body">
            {wishlistProducts.length === 0 ? (
              <p className="drawer-empty">Your wishlist is empty.</p>
            ) : (
              wishlistProducts.map((product) => (
                <div className="drawer-line" key={product!.id}>
                  <div className="drawer-thumb" style={{ background: product!.gradient }}>
                    {product!.image && (
                      <Image src={product!.image} alt={product!.name} width={56} height={56} />
                    )}
                  </div>
                  <div className="drawer-line-info">
                    <Link
                      href={`/products/${product!.id}`}
                      className="drawer-line-name"
                      onClick={closeDrawer}
                    >
                      {product!.name}
                    </Link>
                    <div className="drawer-line-price">{formatNaira(product!.price)}</div>
                    <button
                      className="drawer-move"
                      disabled={!product!.stock}
                      onClick={() => addToCart(product!.id)}
                    >
                      Add to cart
                    </button>
                  </div>
                  <button
                    className="drawer-remove"
                    aria-label={`Remove ${product!.name} from wishlist`}
                    onClick={() => toggleWishlist(product!.id)}
                  >
                    &times;
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {drawerTab === 'cart' && cartLines.length > 0 && (
          <div className="drawer-foot">
            <div className="drawer-subtotal">
              <span>Subtotal</span>
              <strong>{formatNaira(subtotal)}</strong>
            </div>
            <button className="btn-p drawer-checkout" onClick={checkoutViaWhatsApp}>
              Checkout via WhatsApp
            </button>
            <button className="drawer-clear" onClick={clearCart}>
              Clear cart
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
