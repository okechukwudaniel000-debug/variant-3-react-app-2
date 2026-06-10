'use client';

import { useEffect, useRef } from 'react';
import { openTikTok } from '@/lib/effects';

/* ============================================================
   Hero section with the floating-devices canvas animation and
   cursor glow. Ported from the inline script in gadgets.html.
   CSS custom properties are resolved to concrete colours so the
   canvas renders the intended cyan/violet glow (the original
   passed `var(--…)` straight to the 2D context, which is invalid).
============================================================ */
export default function Hero() {
  const canvasRef = useRef(null);
  const followRef = useRef(null);
  const heroRef = useRef(null);

  useEffect(() => {
    const cvs = canvasRef.current;
    const hFollow = followRef.current;
    const heroSec = heroRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');

    let scrollTop = 0;
    let devs = [];
    let raf;
    let resizeTimer;

    // Resolve theme colours from CSS variables for the canvas context.
    const css = getComputedStyle(document.documentElement);
    let COL = { cyan: '#00f2ff', violet: '#bc00ff', hud: 'rgba(0,242,255,0.15)' };
    function readColors() {
      COL = {
        cyan: css.getPropertyValue('--accent-cyan').trim() || '#00f2ff',
        violet: css.getPropertyValue('--accent-violet').trim() || '#bc00ff',
        hud: css.getPropertyValue('--hud-line').trim() || 'rgba(0,242,255,0.15)',
      };
    }

    function rrect(c, x, y, w, h, r) {
      r = Math.min(r, w / 2, h / 2);
      c.beginPath();
      c.moveTo(x + r, y);
      c.lineTo(x + w - r, y);
      c.arcTo(x + w, y, x + w, y + r, r);
      c.lineTo(x + w, y + h - r);
      c.arcTo(x + w, y + h, x + w - r, y + h, r);
      c.lineTo(x + r, y + h);
      c.arcTo(x, y + h, x, y + h - r, r);
      c.lineTo(x, y + r);
      c.arcTo(x, y, x + r, y, r);
      c.closePath();
    }

    function drawDevice(c, x, y, w, h, rot, alpha, isSam) {
      c.save();
      c.globalAlpha = alpha;
      c.translate(x, y);
      c.rotate(rot);

      c.shadowColor = isSam ? COL.cyan : COL.violet;
      c.shadowBlur = 20;

      const g = c.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
      if (isSam) {
        g.addColorStop(0, 'rgba(0,242,255,0.3)');
        g.addColorStop(1, 'rgba(0,100,255,0.1)');
      } else {
        g.addColorStop(0, 'rgba(188,0,255,0.3)');
        g.addColorStop(1, 'rgba(100,0,255,0.1)');
      }
      rrect(c, -w / 2, -h / 2, w, h, w * 0.12);
      c.fillStyle = g;
      c.fill();

      c.shadowBlur = 0;
      c.strokeStyle = isSam ? COL.cyan : COL.violet;
      c.lineWidth = 1;
      c.stroke();

      rrect(c, -w / 2 + w * 0.07, -h / 2 + h * 0.1, w * 0.86, h * 0.72, w * 0.09);
      c.fillStyle = 'rgba(255,255,255,0.05)';
      c.fill();
      c.restore();
    }

    function initDevs() {
      const W = cvs.offsetWidth || window.innerWidth;
      const H = cvs.offsetHeight || window.innerHeight;
      const cx = W / 2;
      const cy = H / 2;
      devs = [];
      const cnt = Math.min(20, Math.floor(W / 50));
      for (let i = 0; i < cnt; i++) {
        const p = i / cnt;
        const th = p * Math.PI * 6;
        const r = 80 + p * Math.min(W, H) * 0.45;
        devs.push({
          bx: cx + Math.cos(th) * r,
          by: cy + Math.sin(th) * r * 0.6,
          w: 30 + Math.random() * 20,
          rot: Math.random() * Math.PI * 2,
          sam: Math.random() > 0.5,
          sp: 0.15 + Math.random() * 0.2,
          px: Math.random() * Math.PI * 2,
          py: Math.random() * Math.PI * 2,
          pf: (0.05 + Math.random() * 0.1) * (Math.random() > 0.5 ? 1 : -1),
          a: 0.2 + Math.random() * 0.4,
          fx: 10 + Math.random() * 15,
          fy: 12 + Math.random() * 18,
        });
      }
    }

    function draw(ts) {
      const t = ts * 0.001;
      const W = cvs.offsetWidth;
      const H = cvs.offsetHeight;
      ctx.clearRect(0, 0, W, H);

      // Network lines
      ctx.beginPath();
      ctx.strokeStyle = COL.hud;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < devs.length; i++) {
        for (let j = i + 1; j < devs.length; j++) {
          const d1 = devs[i];
          const d2 = devs[j];
          const x1 = d1.bx + Math.sin(t * d1.sp + d1.px) * d1.fx;
          const y1 = d1.by + Math.cos(t * d1.sp * 0.7 + d1.py) * d1.fy + scrollTop * d1.pf * 0.2;
          const x2 = d2.bx + Math.sin(t * d2.sp + d2.px) * d2.fx;
          const y2 = d2.by + Math.cos(t * d2.sp * 0.7 + d2.py) * d2.fy + scrollTop * d2.pf * 0.2;
          const dist = Math.hypot(x1 - x2, y1 - y2);
          if (dist < 200) {
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
          }
        }
      }
      ctx.stroke();

      devs.forEach((d) => {
        const fx = Math.sin(t * d.sp + d.px) * d.fx;
        const fy = Math.cos(t * d.sp * 0.7 + d.py) * d.fy;
        const po = scrollTop * d.pf * 0.28;
        const dw = d.w;
        const dh = dw * 2.1;
        drawDevice(ctx, d.bx + fx, d.by + fy + po, dw, dh, d.rot + t * 0.2, d.a, d.sam);
      });
      raf = requestAnimationFrame(draw);
    }

    function resize() {
      const rect = cvs.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      cvs.width = rect.width * dpr;
      cvs.height = rect.height * dpr;
      cvs.style.width = rect.width + 'px';
      cvs.style.height = rect.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      readColors();
      initDevs();
    }

    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    };
    const onScroll = () => {
      scrollTop = window.scrollY;
    };
    const onMouseMove = (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      hFollow.style.left = e.clientX - r.left + 'px';
      hFollow.style.top = e.clientY - r.top + 'px';
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });
    if (heroSec && hFollow) heroSec.addEventListener('mousemove', onMouseMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      if (heroSec) heroSec.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  function scrollToProducts() {
    document.getElementById('products')?.scrollIntoView();
  }

  return (
    <section className="hero" ref={heroRef}>
      <canvas id="hcvs" ref={canvasRef}></canvas>
      <div className="hero-grad"></div>
      <div className="hero-grid"></div>
      <div className="hero-follow" ref={followRef}></div>

      <div className="hero-con">
        <div className="hero-badge">
          <span className="badge-dot"></span> New 2026 Collection Live
        </div>
        <h1 className="hero-h1">
          <span className="h1-main">DANIEL</span>
          <span className="h1-accent">GADGETS</span>
        </h1>
        <p className="hero-sub">Where Innovation Meets Authentic Craftsmanship.</p>
        <p className="hero-p">
          Experience the next generation of smartphones and premium accessories from the world&apos;s
          most trusted brands.
        </p>

        <div className="hero-btns">
          <button className="btn-p" onClick={scrollToProducts}>
            Shop Collection
          </button>
          <button className="btn-s" onClick={openTikTok}>
            Watch Tech Reviews
          </button>
        </div>
      </div>

      <div className="scroll-ind">
        <div className="scroll-t">Scroll</div>
      </div>
    </section>
  );
}
