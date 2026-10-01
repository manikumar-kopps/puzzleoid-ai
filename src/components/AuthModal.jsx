import React, { useState } from 'react';
import { X, ShieldCheck, LogOut, Plus, UserPlus, Users, Check, Trash2, Eye, Mail } from 'lucide-react';
import { soundFx } from '../utils/audio';

export default function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
  accountsList = [],
  onAddNewAccount,
  onRemoveAccount,
  onOpenEmailPreview
}) {
  const [viewMode, setViewMode] = useState('LIST'); // 'LIST', 'ADD_GOOGLE', 'CREATE_ACCOUNT', 'ALL_USERS'
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  if (!isOpen) return null;

  const handleSelectAccount = (acc) => {
    setIsProcessing(true);
    soundFx.playSnapSound();

    setTimeout(() => {
      onLoginSuccess(acc);
      setIsProcessing(false);
      setViewMode('LIST');
      onClose();
    }, 500);
  };

  const handleAddCustomGoogleId = (e) => {
    e.preventDefault();
    if (!customEmail) return;

    setIsProcessing(true);
    soundFx.playSnapSound();

    const nameToUse = customName || customEmail.split('@')[0] || 'Google User';
    const newAcc = {
      id: Date.now(),
      googleId: `10482${Date.now()}`,
      name: nameToUse,
      email: customEmail.includes('@') ? customEmail : `${customEmail}@gmail.com`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(nameToUse)}`
    };

    setTimeout(() => {
      onAddNewAccount(newAcc);
      onLoginSuccess(newAcc);
      setIsProcessing(false);
      setViewMode('LIST');
      onClose();
    }, 600);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="22" height="22" viewBox="0 0 24 24">
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
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              {viewMode === 'LIST'
                ? 'Google Account Profile'
                : viewMode === 'ALL_USERS'
                ? 'Registered User Accounts'
                : 'Add Google Account'}
            </h3>
          </div>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '0.4rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
          <button
            className="btn-secondary"
            onClick={() => setViewMode('LIST')}
            style={{
              flex: 1,
              justifyContent: 'center',
              fontSize: '0.8rem',
              borderColor: viewMode === 'LIST' ? 'var(--accent-cyan)' : 'var(--border-color)',
              background: viewMode === 'LIST' ? 'rgba(6, 182, 212, 0.2)' : 'transparent'
            }}
          >
            My Profile
          </button>
          <button
            className="btn-secondary"
            onClick={() => setViewMode('ALL_USERS')}
            style={{
              flex: 1,
              justifyContent: 'center',
              fontSize: '0.8rem',
              borderColor: viewMode === 'ALL_USERS' ? 'var(--accent-primary)' : 'var(--border-color)',
              background: viewMode === 'ALL_USERS' ? 'rgba(139, 92, 246, 0.2)' : 'transparent'
            }}
          >
            <Users size={14} />
            <span>All Users ({accountsList.length})</span>
          </button>
        </div>

        {viewMode === 'ALL_USERS' ? (
          /* All Registered Users List */
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.8rem' }}>
              Select an account to switch profile:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '280px', overflowY: 'auto' }}>
              {accountsList.map((acc, idx) => {
                const isActive = currentUser && currentUser.email === acc.email;
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 0.9rem',
                      borderRadius: 'var(--radius-md)',
                      border: isActive ? '2px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                      background: isActive ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.04)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={acc.avatar}
                        alt={acc.name}
                        style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>
                          {acc.name} {isActive && <span style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem' }}>(Active)</span>}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{acc.email}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {!isActive && (
                        <button
                          className="btn-secondary"
                          onClick={() => handleSelectAccount(acc)}
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                        >
                          Switch
                        </button>
                      )}
                      {accountsList.length > 1 && (
                        <button
                          className="btn-secondary"
                          onClick={() => onRemoveAccount(acc.email)}
                          style={{ padding: '0.4rem', borderColor: '#ef4444' }}
                          title="Remove Account"
                        >
                          <Trash2 size={14} color="#ef4444" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                className="btn-secondary"
                onClick={() => setViewMode('ADD_GOOGLE')}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <Plus size={16} color="var(--accent-cyan)" />
                <span>Add Google ID / Account</span>
              </button>
            </div>
          </div>
        ) : currentUser && viewMode === 'LIST' ? (
          /* Logged In User Profile Card */
          <div style={{ textAlign: 'center', padding: '0.6rem 0' }}>
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                border: '3px solid var(--accent-primary)',
                marginBottom: '0.6rem',
                objectFit: 'cover'
              }}
            />
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{currentUser.name}</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.8rem' }}>{currentUser.email}</p>

            <div
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                borderRadius: 'var(--radius-md)',
                padding: '0.6rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                color: '#34d399',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              <ShieldCheck size={18} />
              <span>Google OAuth 2.0 Connected</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {onOpenEmailPreview && (
                <button
                  className="btn-secondary"
                  onClick={onOpenEmailPreview}
                  style={{ width: '100%', justifyContent: 'center', borderColor: 'var(--accent-secondary)' }}
                >
                  <Eye size={16} color="#ec4899" />
                  <span>📩 Inspect 11 HTML Email Sandbox</span>
                </button>
              )}

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn-secondary"
                  onClick={() => setViewMode('ALL_USERS')}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <Users size={16} />
                  <span>Switch Account</span>
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => onLogout()}
                  style={{ borderColor: '#ef4444', color: '#fca5a5' }}
                >
                  <LogOut size={16} color="#ef4444" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        ) : viewMode === 'LIST' ? (
          /* Account Selector List */
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Select a Google account to sign in:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.2rem' }}>
              {accountsList.map((acc, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectAccount(acc)}
                  disabled={isProcessing}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <img
                    src={acc.avatar}
                    alt={acc.name}
                    style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{acc.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{acc.email}</span>
                  </div>
                </button>
              ))}
            </div>

            <button
              className="btn-secondary"
              onClick={() => setViewMode('ADD_GOOGLE')}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Plus size={16} color="var(--accent-cyan)" />
              <span>Add Google ID / Account</span>
            </button>
          </div>
        ) : (
          /* Add Custom Google ID Form */
          <form onSubmit={handleAddCustomGoogleId} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                Full Name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Mani Kumar"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'rgba(0, 0, 0, 0.4)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                Google Email / Google ID *
              </label>
              <input
                type="email"
                required
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'rgba(0, 0, 0, 0.4)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setViewMode('LIST')}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isProcessing}
                style={{ flex: 1.2, justifyContent: 'center' }}
              >
                <Check size={18} />
                <span>{isProcessing ? 'Connecting...' : 'Connect Account'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
