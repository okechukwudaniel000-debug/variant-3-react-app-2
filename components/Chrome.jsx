'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/* ============================================================
   Site chrome: top nav, slide-out side menu, auth modal and
   theme toggle. Shared across pages. Ported from the original
   markup + main.js interaction logic.
============================================================ */
export default function Chrome({ menuLinks, showThemeToggle = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [userInitial, setUserInitial] = useState('');
  const [theme, setTheme] = useState('dark');

  // Restore saved user + theme on mount.
  useEffect(() => {
    const savedUser = localStorage.getItem('dg_user');
    if (savedUser) setUserInitial(savedUser.charAt(0).toUpperCase());
    const savedTheme = localStorage.getItem('dg_theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Lock body scroll while a panel is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen || authOpen ? 'hidden' : '';
  }, [menuOpen, authOpen]);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setAuthOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('dg_theme', t);
    setTheme(t);
  }

  function handleAuthSubmit(e, mode) {
    e.preventDefault();
    let name;
    if (mode === 'login') {
      const email = e.target.elements.lEmail.value;
      name = email.split('@')[0];
    } else {
      name = e.target.elements.rName.value;
    }
    if (name) {
      setUserInitial(name.charAt(0).toUpperCase());
      localStorage.setItem('dg_user', name);
    }
    setAuthOpen(false);
  }

  return (
    <>
      {/* ======== NAV ======== */}
      <nav className="topnav" role="navigation">
        <button
          className={`burger${menuOpen ? ' open' : ''}`}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <Link href="/" className="nav-brand" aria-label="Daniel Gadgets home">
          Daniel<em>Gadgets</em>
        </Link>
        <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <button
            className="nav-icon"
            aria-label="Account"
            style={{ color: 'var(--txt)' }}
            onClick={() => {
              setAuthMode('login');
              setAuthOpen(true);
            }}
          >
            {userInitial ? (
              <div className="user-avatar">{userInitial}</div>
            ) : (
              <svg
                width="22"
                height="22"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* ======== SIDE MENU OVERLAY ======== */}
      <div
        className={`overlay${menuOpen ? ' on' : ''}`}
        aria-hidden={!menuOpen}
        onClick={() => setMenuOpen(false)}
      ></div>

      {/* ======== SIDE MENU ======== */}
      <aside className={`sidemenu${menuOpen ? ' on' : ''}`} role="navigation">
        <div className="menu-head">
          <div className="menu-brand">
            Daniel<em>Gadgets</em>
          </div>
          <button className="close-btn" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
            &times;
          </button>
        </div>
        <nav className="menu-nav">
          {menuLinks.map((l) => (
            <a key={l.label} href={l.href} className="mlink" onClick={() => setMenuOpen(false)}>
              <span>{l.label}</span>
            </a>
          ))}
        </nav>
        {showThemeToggle && (
          <>
            <div className="menu-sep"></div>
            <div className="menu-foot">
              <button
                className="theme-btn"
                onClick={() => applyTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <span>{theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}</span>
                <div className="toggle-pill"></div>
              </button>
            </div>
          </>
        )}
      </aside>

      {/* ======== AUTH MODAL ======== */}
      <div
        className={`auth-overlay${authOpen ? ' on' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setAuthOpen(false);
        }}
      >
        <div className="auth-modal">
          <button className="auth-close" onClick={() => setAuthOpen(false)}>
            &times;
          </button>

          <div id="loginForm" style={{ display: authMode === 'login' ? 'block' : 'none' }}>
            <div className="auth-header">
              <h2 className="auth-title">Welcome Back</h2>
              <p className="auth-sub">Enter your details to access your account</p>
            </div>
            <form className="auth-form" onSubmit={(e) => handleAuthSubmit(e, 'login')}>
              <div className="auth-input-group">
                <label className="auth-label">Email Address</label>
                <input
                  type="email"
                  className="auth-input"
                  name="lEmail"
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div className="auth-input-group">
                <label className="auth-label">Password</label>
                <input type="password" className="auth-input" placeholder="••••••••" required />
              </div>
              <button type="submit" className="auth-btn">
                Sign In
              </button>
            </form>
            <p className="auth-switch">
              Don&apos;t have an account?{' '}
              <span className="auth-switch-btn" onClick={() => setAuthMode('register')}>
                Sign up
              </span>
            </p>
          </div>

          <div id="registerForm" style={{ display: authMode === 'register' ? 'block' : 'none' }}>
            <div className="auth-header">
              <h2 className="auth-title">Join Daniel Gadgets</h2>
              <p className="auth-sub">Create an account to start shopping</p>
            </div>
            <form className="auth-form" onSubmit={(e) => handleAuthSubmit(e, 'register')}>
              <div className="auth-input-group">
                <label className="auth-label">Full Name</label>
                <input
                  type="text"
                  className="auth-input"
                  name="rName"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="auth-input-group">
                <label className="auth-label">Email Address</label>
                <input
                  type="email"
                  className="auth-input"
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div className="auth-input-group">
                <label className="auth-label">Password</label>
                <input type="password" className="auth-input" placeholder="••••••••" required />
              </div>
              <button type="submit" className="auth-btn">
                Create Account
              </button>
            </form>
            <p className="auth-switch">
              Already have an account?{' '}
              <span className="auth-switch-btn" onClick={() => setAuthMode('login')}>
                Sign in
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
