'use client';

import { useEffect, useRef, useState } from 'react';
import fallbackReviews from '@/data/reviews.json';

function ReviewCard({ rv }) {
  const openTelegram = () => window.open('https://t.me/DanielClothings000', '_blank');
  return (
    <div className="rv-card">
      <div className="rv-inner" style={{ cursor: 'pointer' }} onClick={openTelegram}>
        <div className="stars">
          {'★'.repeat(rv.stars)}
          {'☆'.repeat(5 - rv.stars)}
        </div>
        <p className="rv-txt">&quot;{rv.text}&quot;</p>
        <div className="rv-author">
          <div className="rv-av" style={{ background: rv.color }}>
            {rv.initials}
          </div>
          <div>
            <div className="rv-name">{rv.name}</div>
            <div className="rv-loc">{rv.location}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [cur, setCur] = useState(0);
  const [maxS, setMaxS] = useState(0);
  const trackRef = useRef(null);
  const curRef = useRef(0);
  const apiRef = useRef({ go() {}, next() {}, prev() {} });

  // Load reviews from the API, falling back to bundled data offline.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/reviews');
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        const data = await res.json();
        if (!cancelled) setReviews(data && data.length ? data : fallbackReviews);
      } catch (err) {
        console.warn(`Could not load reviews from API: ${err.message}. Using offline data.`);
        if (!cancelled) setReviews(fallbackReviews);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Carousel controller — rebuilt whenever the review set changes.
  useEffect(() => {
    if (!reviews.length) return;
    const getSPV = () =>
      window.innerWidth <= 580 ? 1 : window.innerWidth <= 900 ? 2 : 3;

    let spv = getSPV();
    let max = Math.max(0, reviews.length - spv);
    let cursor = Math.min(curRef.current, max);
    let auto;

    const applyTransform = () => {
      if (trackRef.current)
        trackRef.current.style.transform = `translateX(-${cursor * (100 / spv)}%)`;
    };
    const sync = () => {
      curRef.current = cursor;
      setCur(cursor);
      applyTransform();
    };
    const go = (i) => {
      cursor = Math.max(0, Math.min(i, max));
      sync();
    };
    const next = () => go(cursor >= max ? 0 : cursor + 1);
    const prev = () => go(cursor <= 0 ? max : cursor - 1);
    const start = () => {
      if (auto) clearInterval(auto);
      auto = setInterval(next, 4200);
    };
    const resetAuto = () => start();

    setMaxS(max);
    sync();
    start();

    apiRef.current = {
      go: (i) => {
        go(i);
        resetAuto();
      },
      next: () => {
        next();
        resetAuto();
      },
      prev: () => {
        prev();
        resetAuto();
      },
    };

    const onResize = () => {
      spv = getSPV();
      max = Math.max(0, reviews.length - spv);
      setMaxS(max);
      cursor = Math.min(cursor, max);
      sync();
    };
    window.addEventListener('resize', onResize);
    return () => {
      clearInterval(auto);
      window.removeEventListener('resize', onResize);
    };
  }, [reviews]);

  return (
    <section className="sec reviews" id="reviews">
      <div className="sec-c fu">
        <div className="label">Testimonials</div>
        <h2 className="sec-title">What Tech Lovers Say</h2>
      </div>
      <div className="reviews-wrap">
        <div className="rv-container">
          <div className="rv-track" id="rvTrack" ref={trackRef}>
            {reviews.map((rv) => (
              <ReviewCard key={rv.id} rv={rv} />
            ))}
          </div>
        </div>
        <div className="cc">
          <button
            className="cbtn"
            aria-label="Previous review"
            onClick={() => apiRef.current.prev()}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="cc" style={{ marginTop: 0 }}>
            {Array.from({ length: maxS + 1 }, (_, i) => (
              <button
                key={i}
                className={`cdot${i === cur ? ' a' : ''}`}
                aria-label={`Slide ${i + 1}`}
                onClick={() => apiRef.current.go(i)}
              ></button>
            ))}
          </div>
          <button
            className="cbtn"
            aria-label="Next review"
            onClick={() => apiRef.current.next()}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
