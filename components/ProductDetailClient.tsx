'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from './StoreProvider';
import { getProductById, formatNaira } from '@/lib/products';
import type { Product } from '@/lib/types';

/* ============================================================
   Interactive half of the product detail page: gallery, spec
   tabs, quantity + add-to-cart/wishlist, related items and the
   recently-viewed rail. Registers this product as recently
   viewed on mount.
============================================================ */
export default function ProductDetailClient({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const { addToCart, toggleWishlist, isWishlisted, addRecentlyViewed, recentlyViewed } = useStore();
  const [tab, setTab] = useState<'overview' | 'specs'>('overview');
  const [qty, setQty] = useState(1);
  const wished = isWishlisted(product.id);

  useEffect(() => {
    addRecentlyViewed(product.id);
  }, [product.id, addRecentlyViewed]);

  const recent = recentlyViewed
    .filter((id) => id !== product.id)
    .map(getProductById)
    .filter((p): p is Product => Boolean(p))
    .slice(0, 4);

  return (
    <div className="pdp">
      <div className="pdp-grid">
        <div className="pdp-media" style={{ background: product.gradient }}>
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              width={560}
              height={560}
              priority
              className="pdp-img"
              sizes="(max-width: 900px) 92vw, 520px"
            />
          ) : (
            <div className="pdp-img pdp-img-fallback" aria-hidden="true" />
          )}
        </div>

        <div className="pdp-info">
          <div className="pdp-brand">{product.brand}</div>
          <h1 className="pdp-name">{product.name}</h1>
          <div className="pdp-pricerow">
            <span className="pdp-price">{formatNaira(product.price)}</span>
            <span
              className="pdp-stock"
              style={{ color: product.stock ? 'var(--accent-cyan)' : 'rgba(255,120,120,.9)' }}
            >
              {product.stock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <div className="pdp-tabs" role="tablist" aria-label="Product information">
            <button
              role="tab"
              aria-selected={tab === 'overview'}
              className={`pdp-tab${tab === 'overview' ? ' active' : ''}`}
              onClick={() => setTab('overview')}
            >
              Overview
            </button>
            <button
              role="tab"
              aria-selected={tab === 'specs'}
              className={`pdp-tab${tab === 'specs' ? ' active' : ''}`}
              onClick={() => setTab('specs')}
            >
              Specifications
            </button>
          </div>

          <div className="pdp-tabpanel" role="tabpanel">
            {tab === 'overview' ? (
              <p className="pdp-desc">{product.description}</p>
            ) : (
              <dl className="pdp-specs">
                {Object.entries(product.specs).map(([k, v]) => (
                  <div className="pdp-spec" key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          <div className="pdp-buy">
            <div className="qty-ctl" role="group" aria-label="Quantity">
              <button
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span aria-live="polite">{qty}</span>
              <button aria-label="Increase quantity" onClick={() => setQty((q) => q + 1)}>
                +
              </button>
            </div>
            <button
              className="btn-p"
              disabled={!product.stock}
              onClick={() => addToCart(product.id, qty)}
            >
              Add to Cart
            </button>
            <button
              className={`wish-btn pdp-wish${wished ? ' on' : ''}`}
              aria-pressed={wished}
              aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
              onClick={() => toggleWishlist(product.id)}
            >
              {wished ? '♥' : '♡'}
            </button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="pdp-related">
          <h2 className="pdp-section-title">Related Products</h2>
          <div className="pdp-rail">
            {related.map((r) => (
              <Link key={r.id} href={`/products/${r.id}`} className="pdp-rail-card">
                <div className="pdp-rail-media" style={{ background: r.gradient }}>
                  {r.image && (
                    <Image src={r.image} alt={r.name} width={180} height={180} sizes="180px" />
                  )}
                </div>
                <div className="pdp-rail-name">{r.name}</div>
                <div className="pdp-rail-price">{formatNaira(r.price)}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section className="pdp-related">
          <h2 className="pdp-section-title">Recently Viewed</h2>
          <div className="pdp-rail">
            {recent.map((r) => (
              <Link key={r.id} href={`/products/${r.id}`} className="pdp-rail-card">
                <div className="pdp-rail-media" style={{ background: r.gradient }}>
                  {r.image && (
                    <Image src={r.image} alt={r.name} width={180} height={180} sizes="180px" />
                  )}
                </div>
                <div className="pdp-rail-name">{r.name}</div>
                <div className="pdp-rail-price">{formatNaira(r.price)}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
