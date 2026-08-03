'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStore } from './StoreProvider';

const SHOP_LINKS = [
  { href: 'https://featured.daniel-gadgets.com', label: 'All Products' },
  { href: 'https://featured.daniel-gadgets.com', label: 'Phones' },
  { href: 'https://featured.daniel-gadgets.com', label: 'Laptops' },
  { href: 'https://featured.daniel-gadgets.com', label: 'Audio' },
  { href: 'https://featured.daniel-gadgets.com', label: 'Gaming' },
];

const COMPANY_LINKS = [
  { href: '/#about', label: 'About Us' },
  { href: 'https://reviews.daniel-gadgets.com', label: 'Reviews' },
  { href: 'https://contact.daniel-gadgets.com', label: 'Contact' },
];

const SUPPORT_LINKS = [
  { href: 'https://contact.daniel-gadgets.com', label: 'Warranty' },
  { href: 'https://contact.daniel-gadgets.com', label: 'Delivery' },
  { href: 'https://contact.daniel-gadgets.com', label: 'Returns Policy' },
  { href: 'https://contact.daniel-gadgets.com', label: 'Privacy Policy' },
];

const SOCIALS = [
  {
    href: 'https://wa.me/2349132715125',
    label: 'WhatsApp',
    d: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z',
  },
  {
    href: 'https://www.tiktok.com/@danielclothings_',
    label: 'TikTok',
    d: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
  },
  {
    href: 'https://t.me/DanielClothings000',
    label: 'Telegram',
    d: 'M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.14-.26.26-.53.26l.195-2.82 5.12-4.62c.22-.19-.047-.304-.34-.11l-6.33 3.98-2.73-.85c-.594-.185-.605-.594.124-.88l10.66-4.11c.494-.18.927.115.75.96z',
  },
];

export default function Footer({ full = true }) {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState({ text: '', ok: false });
  const [busy, setBusy] = useState(false);
  const { user, logout } = useStore();

  async function subscribe(e) {
    e.preventDefault();
    setBusy(true);
    setMsg({ text: '', ok: false });
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ text: data.message || 'Subscribed!', ok: true });
        setEmail('');
      } else {
        setMsg({ text: data.error || 'Something went wrong.', ok: false });
      }
    } catch {
      setMsg({ text: 'Network error. Please try again.', ok: false });
    } finally {
      setBusy(false);
    }
  }

  return (
    <footer role="contentinfo" className="futuristic-footer">
      {full && (
        <div className="ft-cols">
          <div className="ft-col ft-about">
            <div className="ft-logo">
              Daniel<em>Gadgets</em>
            </div>
            <p>
              Nigeria&apos;s trusted destination for authentic smartphones, laptops and premium
              accessories — backed by official warranty and fast delivery.
            </p>
            <div className="ft-social">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d={s.d} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div className="ft-col">
            <h4>Shop</h4>
            {SHOP_LINKS.map((l) => (
              <Link key={l.label} href={l.href}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className="ft-col">
            <h4>Company</h4>
            {COMPANY_LINKS.map((l) => (
              <Link key={l.label} href={l.href}>
                {l.label}
              </Link>
            ))}
            <h4 style={{ marginTop: 18 }}>Support</h4>
            {SUPPORT_LINKS.map((l) => (
              <Link key={l.label} href={l.href}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className="ft-col">
            <h4>Stay in the loop</h4>
            <p style={{ color: 'var(--txt2)', fontSize: '0.88rem', marginBottom: 12 }}>
              New drops, exclusive offers and tech news — straight to your inbox.
            </p>
            <form className="ft-news-form" onSubmit={subscribe}>
              <label htmlFor="ft-email" className="visually-hidden">
                Email address
              </label>
              <input
                id="ft-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="ft-news-btn" disabled={busy}>
                {busy ? '…' : 'Subscribe'}
              </button>
            </form>
            <p
              className={`ft-news-msg${msg.text ? (msg.ok ? ' ok' : ' err') : ''}`}
              aria-live="polite"
            >
              {msg.text}
            </p>
            <a href="https://wa.me/2349132715125" className="ft-col" style={{ marginTop: 8 }}>
              ☎ +234 913 271 5125
            </a>
          </div>
        </div>
      )}

      <div className="footer-shell">
        {full && (
          <div className="footer-badges">
            <span>Official Retailer</span>
            <span>Authentic Only</span>
            <span>24-Hour Delivery</span>
          </div>
        )}
        <div className="footer-status" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="status-dot"></span> System Operational
          </div>
          {user && (
            <button 
              onClick={() => window.confirm('Logout?') && logout()} 
              className="ft-logout-btn"
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'var(--txt3)', 
                fontSize: '0.75rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.1em',
                cursor: 'pointer',
                opacity: 0.6,
                transition: 'opacity 0.2s var(--ease)',
                padding: '5px 10px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
            >
              Logout Session ({user.name})
            </button>
          )}
        </div>
      </div>
      <p className="ft-copy">© 2026 Daniel Gadgets. All Rights Reserved.</p>
    </footer>
  );
}
