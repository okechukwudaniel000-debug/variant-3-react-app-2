'use client';

import { useEffect, useRef, useState } from 'react';
import fallbackProducts from '@/data/products.json';
import { goWA, revealObserve, setupMagnetic } from '@/lib/effects';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'phones', label: 'Phones' },
  { key: 'laptops', label: 'Laptops' },
  { key: 'accessories', label: 'Accessories' },
];

function ProductCard({ product }) {
  const stockStatus = product.stock ? 'In Stock' : 'Out of Stock';
  const badgeColor = product.stock ? 'var(--accent-cyan)' : 'rgba(255, 100, 100, 0.5)';

  const cardClick = (event) => {
    if (event.target.closest('.btn-v')) return;
    goWA();
  };

  return (
    <article
      className="pcard fu"
      data-category={product.category || 'all'}
      data-product-id={product.id || ''}
      onClick={cardClick}
    >
      <div
        className="stock-badge"
        style={{ background: `${badgeColor}20`, borderColor: badgeColor }}
      >
        <span className="stock-dot" style={{ background: badgeColor }}></span>
        {stockStatus}
      </div>

      <div className="pspecs">
        {Object.entries(product.specs || {}).map(([key, value]) => (
          <div className="pspec-row" key={key}>
            <span className="pspec-lbl">{key}</span>
            <span className="pspec-val">{value}</span>
          </div>
        ))}
        <button className="btn-v" style={{ marginTop: 15 }} onClick={goWA}>
          Order Now
        </button>
      </div>

      <div className="pimg">
        <div
          className="pimg-bg"
          style={{
            background:
              product.gradient ||
              'linear-gradient(135deg,rgba(20,40,160,.2),rgba(5,15,70,.3))',
          }}
        ></div>
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image} alt={product.name} className="pimg-real" />
        ) : (
          <div className="pdevice">
            <div
              className="ph"
              style={{
                background:
                  product.deviceGradient ||
                  'linear-gradient(150deg,#0d1b55 0%,#08123a 55%,#040b22 100%)',
              }}
            >
              <div className="ph-hole"></div>
              <div
                className="ph-screen"
                style={{
                  background:
                    product.screenGradient ||
                    'linear-gradient(160deg,rgba(20,45,180,.55),rgba(5,15,70,.7))',
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div className="pinfo">
        <div className="pcat">{product.brand}</div>
        <h3 className="pname">{product.name}</h3>
        <p className="pdesc">{product.description}</p>
        <div className="pfooter">
          <div>
            <div className="pprice-lbl">Price</div>
            <div className="pprice">₦{product.price.toLocaleString()}</div>
          </div>
          <button className="btn-v" onClick={goWA}>
            View Details
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Products({ withLoadingPlaceholder = false }) {
  const [products, setProducts] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const gridRef = useRef(null);

  // Load products from the API, falling back to bundled data offline.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        const data = await res.json();
        if (!cancelled) setProducts(data);
      } catch (err) {
        console.warn(`Could not load from API: ${err.message}. Using offline data.`);
        if (!cancelled) setProducts(fallbackProducts);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Wire up reveal animation + magnetic buttons once cards exist.
  useEffect(() => {
    if (!products || !gridRef.current) return;
    revealObserve(gridRef.current);
    setupMagnetic(gridRef.current);
  }, [products]);

  function applyFilter(filter) {
    setActiveFilter(filter);
    const grid = gridRef.current;
    if (!grid) return;
    grid.querySelectorAll('.pcard').forEach((card) => {
      if (filter === 'all' || card.dataset.category === filter) {
        card.style.display = 'block';
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0) scale(1)';
        }, 10);
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px) scale(0.95)';
        setTimeout(() => {
          card.style.display = 'none';
        }, 400);
      }
    });
  }

  return (
    <>
      <div className="p-filters fu">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`f-btn${activeFilter === f.key ? ' active' : ''}`}
            data-filter={f.key}
            onClick={() => applyFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="pgrid" ref={gridRef}>
        {products === null && withLoadingPlaceholder && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px 0' }}>
            <div
              className="status-dot"
              style={{ display: 'inline-block', marginBottom: 20 }}
            ></div>
            <p style={{ color: 'var(--txt3)' }}>Initializing secure data link...</p>
          </div>
        )}
        {products?.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </>
  );
}
