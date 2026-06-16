'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/components/StoreProvider';
import Chrome from '@/components/Chrome';
import Footer from '@/components/Footer';

function ConnectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const { login, hydrated } = useStore();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('request'); // 'request' | 'connecting' | 'success'

  const provider = email.endsWith('@gmail.com') ? 'Google' : 
                   email.endsWith('@outlook.com') || email.endsWith('@hotmail.com') ? 'Microsoft' : 
                   'Email Provider';

  const handleAllow = () => {
    setLoading(true);
    setStep('connecting');
    
    // Simulate API delay for "extracting data"
    setTimeout(() => {
      login(email);
      setStep('success');
      
      setTimeout(() => {
        router.push('/');
      }, 1500);
    }, 2500);
  };

  if (!hydrated) return null;

  return (
    <main className="sec connect-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg2)' }}>
      <div className="hud-corner hud-tl"></div>
      <div className="hud-corner hud-tr"></div>
      <div className="hud-corner hud-bl"></div>
      <div className="hud-corner hud-br"></div>

      <div className="auth-modal" style={{ position: 'relative', opacity: 1, transform: 'none', maxWidth: '450px', width: '90%' }}>
        {step === 'request' && (
          <>
            <div className="auth-header" style={{ textAlign: 'center' }}>
              <div className="provider-icon" style={{ 
                width: '60px', 
                height: '60px', 
                background: 'var(--glass2)', 
                borderRadius: '50%', 
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border2)'
              }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
              <h2 className="auth-title">Connect {provider}</h2>
              <p className="auth-sub" style={{ fontSize: '0.95rem' }}>
                Daniel Gadgets wants to access your <strong>{email}</strong> profile to personalize your experience.
              </p>
            </div>

            <div className="permissions-list" style={{ margin: '30px 0', background: 'var(--glass)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--txt3)', marginBottom: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>This will allow us to:</p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--accent-cyan)' }}>✓</span> View your basic profile (Name & Initial)
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--accent-cyan)' }}>✓</span> Verify your email address
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--accent-cyan)' }}>✓</span> Securely sign you in to your account
                </li>
              </ul>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <button 
                className="btn-v ghost" 
                style={{ width: '100%', padding: '12px' }}
                onClick={() => router.back()}
              >
                Cancel
              </button>
              <button 
                className="auth-btn" 
                style={{ width: '100%', margin: 0 }}
                onClick={handleAllow}
              >
                Allow Access
              </button>
            </div>
          </>
        )}

        {step === 'connecting' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div className="loader-container" style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 30px' }}>
              <div className="pulse-ring" style={{ 
                position: 'absolute', 
                inset: 0, 
                border: '2px solid var(--accent-cyan)', 
                borderRadius: '50%',
                animation: 'pulse 2s infinite' 
              }}></div>
              <div style={{ 
                position: 'absolute', 
                inset: '10px', 
                border: '2px solid var(--accent-violet)', 
                borderRadius: '50%',
                animation: 'pulse 2s infinite 0.5s' 
              }}></div>
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--txt)">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                </svg>
              </div>
            </div>
            <h2 className="auth-title">Extracting Data...</h2>
            <p className="auth-sub">Securely connecting to {provider} to retrieve your profile information.</p>
            <div style={{ marginTop: '20px', width: '100%', height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
              <div className="progress-bar" style={{ 
                width: '60%', 
                height: '100%', 
                background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-violet))',
                animation: 'slide 2.5s infinite linear'
              }}></div>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              background: 'rgba(0, 242, 255, 0.1)', 
              borderRadius: '50%', 
              margin: '0 auto 30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)',
              border: '2px solid var(--accent-cyan)'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2 className="auth-title">Account Connected</h2>
            <p className="auth-sub">Profile extracted successfully. Redirecting you to the dashboard...</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </main>
  );
}

export default function AuthConnectPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConnectContent />
    </Suspense>
  );
}
