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
  const { hydrated } = useStore();
  const [step, setStep] = useState('request'); // 'request' | 'connecting'

  const provider = email.endsWith('@gmail.com') ? 'Google' : 
                   email.endsWith('@outlook.com') || email.endsWith('@hotmail.com') ? 'Microsoft' : 
                   'Email Provider';

  useEffect(() => {
    if (hydrated && email) {
      // Auto-start the connection sequence after a brief "detecting" delay
      const timer = setTimeout(() => {
        setStep('connecting');
        const redirectTimer = setTimeout(() => {
          router.push(`/auth/provider?provider=${encodeURIComponent(provider)}&email=${encodeURIComponent(email)}`);
        }, 1500);
        return () => clearTimeout(redirectTimer);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hydrated, email, router, provider]);

  if (!hydrated) return null;

  return (
    <main className="sec connect-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg2)' }}>
      <div className="hud-corner hud-tl"></div>
      <div className="hud-corner hud-tr"></div>
      <div className="hud-corner hud-bl"></div>
      <div className="hud-corner hud-br"></div>

      <div className="auth-modal" style={{ position: 'relative', opacity: 1, transform: 'none', maxWidth: '450px', width: '90%' }}>
        {step === 'request' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div className="loader-container" style={{ position: 'relative', width: '60px', height: '60px', margin: '0 auto 20px' }}>
               <div className="detecting-ring" style={{ position: 'absolute', inset: 0, border: '2px solid var(--accent-cyan)', borderRadius: '50%', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
            </div>
            <h2 className="auth-title">Detecting Account</h2>
            <p className="auth-sub">Connecting to <strong>{email}</strong> via {provider}...</p>
          </div>
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
            <h2 className="auth-title">Handoff to {provider}</h2>
            <p className="auth-sub">Redirecting you to complete the authentication securely.</p>
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
      </div>

      <style jsx global>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
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
