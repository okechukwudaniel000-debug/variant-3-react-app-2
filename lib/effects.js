'use client';

/* ============================================================
   Shared interactive effects, ported 1:1 from the original
   main.js so the design/behaviour is preserved. Each helper is
   idempotent and safe to call after dynamic content mounts.
============================================================ */

// ---- External links --------------------------------------------------------
export function goWA() {
  window.open('https://wa.me/2349132715125', '_blank', 'noopener,noreferrer');
}
export function openTikTok() {
  window.open('https://www.tiktok.com/@danielclothings_', '_blank', 'noopener,noreferrer');
}

// ---- Scroll reveal (.fu -> .vis) ------------------------------------------
let revealObs = null;
export function revealObserve(root) {
  if (typeof window === 'undefined') return;
  if (!revealObs) {
    revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('vis');
            revealObs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -36px 0px' }
    );
  }
  (root || document).querySelectorAll('.fu:not(.vis)').forEach((el) => revealObs.observe(el));
}

// ---- Heading colour-flow effect --------------------------------------------
// The old JS text-scramble has been replaced by a pure-CSS animated gradient
// (see `.h1-main`, `.h1-accent`, `.sec-title` in globals.css). CSS gradient
// animation is GPU-composited and runs smoothly on mobile browsers without the
// per-frame DOM writes the scramble required, so no JS hook is needed here.

// ---- Reduced-motion helper -------------------------------------------------
function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}

// ---- Animated counters (.tnum) --------------------------------------------
function animNum(el) {
  const to = parseFloat(el.dataset.to);
  const sfx = el.dataset.sfx || '';
  const dec = el.dataset.dec === '1';
  // Skip the count-up animation; show the final value immediately.
  if (prefersReducedMotion()) {
    el.textContent = (dec ? to.toFixed(1) : Math.floor(to).toLocaleString()) + sfx;
    return;
  }
  const dur = 2000;
  const t0 = performance.now();
  (function tick(now) {
    const prog = Math.min((now - t0) / dur, 1);
    const ease = 1 - Math.pow(1 - prog, 3);
    el.textContent = (dec ? (to * ease).toFixed(1) : Math.floor(to * ease).toLocaleString()) + sfx;
    if (prog < 1) requestAnimationFrame(tick);
  })(t0);
}

let counterObs = null;
export function counterObserve(root) {
  if (typeof window === 'undefined') return;
  if (!counterObs) {
    counterObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animNum(e.target);
            counterObs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.5 }
    );
  }
  (root || document).querySelectorAll('.tnum').forEach((el) => counterObs.observe(el));
}

// ---- Magnetic buttons ------------------------------------------------------
export function setupMagnetic(root) {
  if (typeof window === 'undefined') return;
  if (prefersReducedMotion()) return; // no magnetic pull when reduced motion is requested
  (root || document).querySelectorAll('.btn-p, .btn-s, .btn-v').forEach((btn) => {
    if (btn.dataset.magnetic) return;
    btn.dataset.magnetic = '1';
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px) scale(1.02)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

// ---- Nav scroll shadow -----------------------------------------------------
export function setupNavShadow() {
  if (typeof window === 'undefined') return;
  const topnav = document.querySelector('.topnav');
  const onScroll = () => {
    if (topnav)
      topnav.style.boxShadow = window.scrollY > 40 ? '0 4px 28px rgba(0,0,0,.35)' : 'none';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => window.removeEventListener('scroll', onScroll);
}
