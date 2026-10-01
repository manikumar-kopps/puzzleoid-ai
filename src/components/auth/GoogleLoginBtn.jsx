import React, { useState } from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { soundFx } from '../../utils/audio';

export default function GoogleLoginBtn({ onLoginSuccess, isProcessing }) {
  const [showAccountSelector, setShowAccountSelector] = useState(false);

  const DEMO_GOOGLE_ACCOUNTS = [
    {
      googleId: '104829302910293840192',
      name: 'Mani Kumar',
      email: 'mani.kumar@gmail.com',
      picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    {
      googleId: '984710293847561928374',
      name: 'Alex Rivera',
      email: 'alex.rivera@gmail.com',
      picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    }
  ];

  const handleSelectAccount = (acc) => {
    soundFx.playSnapSound();
    onLoginSuccess(acc);
    setShowAccountSelector(false);
  };

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* Official Google Sign-In Button */}
      <button
        onClick={() => setShowAccountSelector(!showAccountSelector)}
        disabled={isProcessing}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          padding: '0.85rem 1.2rem',
          background: '#ffffff',
          color: '#1f2937',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          fontWeight: 700,
          fontSize: '0.95rem',
          cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.2s ease'
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>{isProcessing ? 'Verifying Google Account...' : 'Continue with Google'}</span>
      </button>

      {/* Account Chooser Popover */}
      {showAccountSelector && (
        <div
          style={{
            position: 'absolute',
            top: '110%',
            left: 0,
            right: 0,
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '0.8rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
            zIndex: 90
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.6rem', textAlign: 'center' }}>
            Choose a Google Account
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {DEMO_GOOGLE_ACCOUNTS.map((acc, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectAccount(acc)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <img src={acc.picture} alt={acc.name} style={{ width: '34px', height: '34px', borderRadius: '50%' }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{acc.name}</span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{acc.email}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
