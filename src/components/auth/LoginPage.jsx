import React, { useState } from 'react';
import { Lock, Mail, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import GoogleGISButton from './GoogleGISButton';
import { soundFx } from '../../utils/audio';

export default function LoginPage({ onGoogleLogin, onSwitchToRegister, onEmailLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    soundFx.playSnapSound();

    setTimeout(() => {
      onEmailLogin({ email, password });
      setIsProcessing(false);
    }, 600);
  };

  const handleGoogleSubmit = async (credentialData) => {
    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg('Verifying ID Token with Google OAuth 2.0...');

    try {
      await onGoogleLogin(credentialData);
    } catch (err) {
      setErrorMsg(err.message || 'Google Authentication Failed');
      setIsProcessing(false);
      setSuccessMsg(null);
    }
  };

  return (
    <div style={{ maxWidth: '440px', width: '100%', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '2.2rem 1.8rem', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)' }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.8rem auto',
              boxShadow: '0 8px 20px rgba(139, 92, 246, 0.4)'
            }}
          >
            <ShieldCheck size={28} color="#ffffff" />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.3rem 0' }}>
            Welcome Back
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
            Sign in to access your account & cloud storage
          </p>
        </div>

        {/* Feedback Banners */}
        {errorMsg && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.2rem'
            }}
          >
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              color: '#34d399',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.2rem'
            }}
          >
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Official Google Identity Services GIS Button */}
        <div style={{ marginBottom: '1.5rem' }}>
          <GoogleGISButton onLoginSuccess={handleGoogleSubmit} isProcessing={isProcessing} />
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            OR EMAIL LOGIN
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        </div>

        {/* Standard Email/Password Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.9rem 0.75rem 2.4rem',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Password</label>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset email requested'); }} style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', textDecoration: 'none' }}>
                Forgot Password?
              </a>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.9rem 0.75rem 2.4rem',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
            <label htmlFor="remember" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
              Remember me for 30 days
            </label>
          </div>

          <button type="submit" className="btn-primary" disabled={isProcessing} style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', marginTop: '0.4rem' }}>
            <span>{isProcessing ? 'Signing In...' : 'Sign In with Email'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Switch to Register */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <button onClick={onSwitchToRegister} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
