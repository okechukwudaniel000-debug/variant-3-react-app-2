'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/components/StoreProvider';

function ProviderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const provider = searchParams.get('provider') || 'Google';
  const { login } = useStore();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate provider authentication and data handoff
    setTimeout(() => {
      login(email);
      router.push('/');
    }, 2000);
  };

  const brandColor = provider === 'Google' ? '#4285F4' : provider === 'Microsoft' ? '#00A4EF' : '#333';

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#fff', 
      color: '#3c4043',
      fontFamily: 'Roboto, Arial, sans-serif'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '450px', 
        padding: '40px', 
        border: '1px solid #dadce0', 
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        {/* Mock Provider Logo */}
        <div style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold', color: brandColor }}>
          {provider === 'Google' ? (
            <span style={{ display: 'flex', justifyContent: 'center', gap: '2px' }}>
              <span style={{ color: '#4285F4' }}>G</span>
              <span style={{ color: '#EA4335' }}>o</span>
              <span style={{ color: '#FBBC05' }}>o</span>
              <span style={{ color: '#4285F4' }}>g</span>
              <span style={{ color: '#34A853' }}>l</span>
              <span style={{ color: '#EA4335' }}>e</span>
            </span>
          ) : provider}
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: '400', marginBottom: '8px' }}>Sign in</h1>
        <p style={{ fontSize: '16px', marginBottom: '30px' }}>to continue to Daniel Gadgets</p>

        <form onSubmit={handleSignIn} style={{ textAlign: 'left' }}>
          <div style={{ 
            padding: '13px 15px', 
            border: '1px solid #dadce0', 
            borderRadius: '4px', 
            marginBottom: '20px',
            background: '#f8f9fa'
          }}>
            <div style={{ fontSize: '12px', color: '#70757a' }}>Email address</div>
            <div style={{ fontSize: '16px', color: '#202124' }}>{email}</div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <input 
              type="password" 
              placeholder="Enter your password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '13px 15px', 
                border: '1px solid #dadce0', 
                borderRadius: '4px',
                fontSize: '16px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button type="button" style={{ 
              background: 'none', 
              border: 'none', 
              color: brandColor, 
              fontWeight: '500', 
              cursor: 'pointer' 
            }}>
              Forgot password?
            </button>
            <button type="submit" disabled={loading} style={{ 
              background: brandColor, 
              color: '#fff', 
              border: 'none', 
              borderRadius: '4px', 
              padding: '10px 24px', 
              fontWeight: '500', 
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1
            }}>
              {loading ? 'Verifying...' : 'Next'}
            </button>
          </div>
        </form>
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#70757a', display: 'flex', gap: '20px' }}>
        <span>English (United States)</span>
        <span>Help</span>
        <span>Privacy</span>
        <span>Terms</span>
      </div>
    </div>
  );
}

export default function AuthProviderPage() {
  return (
    <Suspense fallback={<div>Redirecting to provider...</div>}>
      <ProviderContent />
    </Suspense>
  );
}
