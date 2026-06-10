'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from './StoreProvider';
import {
  getAllProducts,
  deriveCategories,
  searchProducts,
  sortProducts,
  formatNaira,
} from '@/lib/products';
import { goWA, revealObserve, setupMagnetic } from '@/lib/effects';

const SORTS = [
  { key: 'featured', label: 'Featured' },
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' },
  { key: 'name', label: 'Name (A–Z)' },
];

const ALL_PRODUCTS = getAllProducts();
const FILTERS = deriveCategories(ALL_PRODUCTS);

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}

function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isWishlisted, openQuickView } = useStore();
  const wished = isWishlisted(product.id);
  const cardRef = useRef(null);

  // Subtle 3D tilt that follows the pointer (disabled for reduced motion).
  function onMove(e) {
    const el = cardRef.current;
    if (!el || prefersReducedMotion()) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--rx', `${(-py * 6).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(px * 8).toFixed(2)}deg`);
  }
  function onLeave() {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  }

  return (
    <article
      className="pcard fu"
      data-category={product.category}
      data-product-id={product.id}
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="pcard-badges">
        {product.featured && <span className="pbadge pbadge-feat">Featured</span>}
        {!product.stock && <span className="pbadge pbadge-out">Out of Stock</span>}
      </div>

      <button
        className={`wish-btn${wished ? ' on' : ''}`}
        aria-pressed={wished}
        aria-label={
          wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`
        }
        onClick={() => toggleWishlist(product.id)}
      >
        {wished ? '♥' : '♡'}
      </button>

      <div className="pspecs">
        {Object.entries(product.specs || {}).map(([key, value]) => (
          <div className="pspec-row" key={key}>
            <span className="pspec-lbl">{key}</span>
            <span className="pspec-val">{value}</span>
          </div>
        ))}
        <div className="pspec-actions">
          <button className="btn-v" disabled={!product.stock} onClick={() => addToCart(product.id)}>
            Add to Cart
          </button>
          <button className="btn-v ghost" onClick={() => goWA()}>
            Order via WhatsApp
          </button>
        </div>
      </div>

      <div className="pimg">
        <div className="pimg-bg" style={{ background: product.gradient }} />
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            width={240}
            height={200}
            className="pimg-real"
            sizes="(max-width: 700px) 50vw, 240px"
          />
        ) : (
          <div className="pdevice" aria-hidden="true">
            <div className="ph" style={{ background: product.deviceGradient }}>
              <div className="ph-hole" />
              <div className="ph-screen" style={{ background: product.screenGradient }} />
            </div>
          </div>
        )}
        <button className="pimg-quick" onClick={() => openQuickView(product.id)}>
          Quick View
        </button>
      </div>

      <div className="pinfo">
        <div className="pcat">{product.brand}</div>
        <h3 className="pname">
          <Link href={`/products/${product.id}`}>{product.name}</Link>
        </h3>
        <p className="pdesc">{product.description}</p>
        <div className="pfooter">
          <div>
            <div className="pprice-lbl">Price</div>
            <div className="pprice">{formatNaira(product.price)}</div>
          </div>
          <button className="btn-v" onClick={() => openQuickView(product.id)}>
            Quick View
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Products() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('featured');
  const gridRef = useRef(null);

  const visible = useMemo(() => {
    const byCat =
      activeFilter === 'all'
        ? ALL_PRODUCTS
        : ALL_PRODUCTS.filter((p) => p.category === activeFilter);
    return sortProducts(searchProducts(byCat, query), sort);
  }, [activeFilter, query, sort]);

  // Re-arm reveal + magnetic whenever the visible set changes.
  useEffect(() => {
    if (!gridRef.current) return;
    revealObserve(gridRef.current);
    setupMagnetic(gridRef.current);
  }, [visible]);

  return (
    <>
      <div className="p-controls fu">
        <div className="p-filters" role="group" aria-label="Filter products by category">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`f-btn${activeFilter === f.key ? ' active' : ''}`}
              aria-pressed={activeFilter === f.key}
              onClick={() => setActiveFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="p-tools">
          <label className="p-search">
            <span className="visually-hidden">Search products</span>
            <input
              type="search"
              placeholder="Search products…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label className="p-sort">
            <span className="visually-hidden">Sort products</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <p className="p-count" aria-live="polite">
        {visible.length} {visible.length === 1 ? 'product' : 'products'}
      </p>

      <div className="pgrid" ref={gridRef}>
        {visible.length === 0 ? (
          <div className="p-empty">
            <p>No products match your search.</p>
            <button
              className="btn-s"
              onClick={() => {
                setQuery('');
                setActiveFilter('all');
              }}
            >
              Reset filters
            </button>
          </div>
        ) : (
          visible.map((p) => <ProductCard key={p.id} product={p} />)
        )}
      </div>
    </>
  );
}
