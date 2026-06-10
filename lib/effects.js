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

// ---- Text scramble effect --------------------------------------------------
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.update = this.update.bind(this);
  }
  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => (this.resolve = resolve));
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  update() {
    let output = '';
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="d-char">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

let scrambleObs = null;
export function scrambleObserve(root) {
  if (typeof window === 'undefined') return;
  // Titles are already their final text in the DOM; skip the scramble animation.
  if (prefersReducedMotion()) return;
  if (!scrambleObs) {
    scrambleObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const fx = new TextScramble(entry.target);
            fx.setText(entry.target.getAttribute('data-text') || entry.target.innerText);
            scrambleObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
  }
  (root || document).querySelectorAll('.sec-title, .h1-main, .h1-accent').forEach((el) => {
    if (el.dataset.scrambleBound) return;
    el.dataset.scrambleBound = '1';
    el.setAttribute('data-text', el.innerText);
    scrambleObs.observe(el);
  });
}

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
