import React from 'react';
import { ShieldCheck, LogOut, CheckCircle2, Camera } from 'lucide-react';
import { soundFx } from '../../utils/audio';

export default function DashboardPage({ user, onLogout, onLaunchPhotobooth }) {
  const u = user || {
    name: 'Mani Kumar',
    email: 'mani.kumar@gmail.com',
    googleId: '104829302910293840192',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString()
  };

  return (
    <div style={{ maxWidth: '640px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      {/* Clean User Profile Card */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)' }}>
        <img
          src={u.avatar || u.picture}
          alt={u.name}
          style={{
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            border: '4px solid var(--accent-primary)',
            objectFit: 'cover',
            marginBottom: '1rem'
          }}
        />

        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.3rem 0', color: '#ffffff' }}>
          {u.name}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0 0 1rem 0' }}>
          {u.email}
        </p>

        {/* Security Verified Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10b981',
            color: '#34d399',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '1.5rem'
          }}
        >
          <ShieldCheck size={18} />
          <span>Signed in with Google OAuth 2.0</span>
        </div>

        {/* User Account Info */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '10px',
            padding: '1rem',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
            marginBottom: '1.8rem',
            fontSize: '0.85rem',
            color: 'var(--text-muted)'
          }}
        >
          <div>🆔 <strong>Google Account ID (sub):</strong> <span style={{ color: '#fff' }}>{u.googleId || u.google_id || '104829302910293840192'}</span></div>
          <div>📅 <strong>Account Created:</strong> <span style={{ color: '#fff' }}>{new Date(u.createdAt || Date.now()).toLocaleDateString()}</span></div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button
            className="btn-primary"
            onClick={onLaunchPhotobooth}
            style={{ flex: 1, justifyContent: 'center', padding: '0.85rem' }}
          >
            <Camera size={18} />
            <span>Launch AI Photobooth</span>
          </button>

          <button
            className="btn-secondary"
            onClick={() => {
              soundFx.playSnapSound();
              onLogout();
            }}
            style={{ flex: 0.8, justifyContent: 'center', borderColor: '#ef4444', color: '#fca5a5' }}
          >
            <LogOut size={18} color="#ef4444" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
