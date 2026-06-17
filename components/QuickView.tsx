'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from './StoreProvider';
import { getProductById, formatNaira } from '@/lib/products';
import { useFocusTrap } from '@/lib/focus-trap';

/* ============================================================
   Accessible quick-view modal. Driven by the shared store's
   quickViewId; renders nothing when closed.
============================================================ */
export default function QuickView() {
  const { quickViewId, closeQuickView, addToCart, toggleWishlist, isWishlisted } = useStore();
  const product = quickViewId ? getProductById(quickViewId) : undefined;
  const open = Boolean(product);
  const dialogRef = useFocusTrap<HTMLDivElement>(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeQuickView();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, closeQuickView]);

  if (!product) return null;

  const wished = isWishlisted(product.id);

  return (
    <div
      className="qv-overlay on"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeQuickView();
      }}
    >
      <div
        className="qv-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${product.name} quick view`}
        ref={dialogRef}
        tabIndex={-1}
      >
        <button className="qv-close" aria-label="Close quick view" onClick={closeQuickView}>
          &times;
        </button>

        <div className="qv-media" style={{ background: product.gradient }}>
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              width={420}
              height={420}
              className="qv-img"
              sizes="(max-width: 720px) 90vw, 420px"
            />
          ) : (
            <div className="qv-img qv-img-fallback" aria-hidden="true" />
          )}
        </div>

        <div className="qv-body">
          <div className="qv-brand">{product.brand}</div>
          <h2 className="qv-name">{product.name}</h2>
          <p className="qv-desc">{product.description}</p>

          <div className="qv-specs">
            {Object.entries(product.specs).map(([k, v]) => (
              <div className="qv-spec" key={k}>
                <span>{k}</span>
                <strong>{v}</strong>
              </div>
            ))}
          </div>

          <div className="qv-footer">
            <div className="qv-price">{formatNaira(product.price)}</div>
            <span
              className="qv-stock"
              style={{ color: 'var(--accent-cyan)' }}
            >
              {product.remaining} remaining
            </span>
          </div>

          <div className="qv-actions">
            <button
              className="btn-p qv-add"
              onClick={() => {
                addToCart(product.id);
                closeQuickView();
              }}
            >
              Add to Cart
            </button>
            <button
              className={`qv-wish${wished ? ' on' : ''}`}
              aria-pressed={wished}
              aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
              onClick={() => toggleWishlist(product.id)}
            >
              {wished ? '♥' : '♡'}
            </button>
            <Link
              href={`/products/${product.id}`}
              className="btn-s qv-details"
              onClick={closeQuickView}
            >
              Full Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
