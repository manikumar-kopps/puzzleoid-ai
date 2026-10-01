import React, { useState } from 'react';
import { X, Mail, CheckCircle2, AlertTriangle, Eye, ShieldAlert, Key, UserCheck, Trash2 } from 'lucide-react';
import { getEmailTemplate } from '../../../server/emails/templates.js';

export default function EmailPreviewModal({ isOpen, onClose, user }) {
  const [selectedType, setSelectedType] = useState('WELCOME');

  if (!isOpen) return null;

  const EMAIL_TYPES = [
    { id: 'WELCOME', label: 'Welcome Email', icon: '🎉' },
    { id: 'ACCOUNT_CREATED', label: 'Account Created', icon: '✨' },
    { id: 'LOGIN_ALERT', label: 'Login Alert', icon: '🔔' },
    { id: 'SUSPICIOUS_LOGIN', label: 'Suspicious Login', icon: '⚠️' },
    { id: 'EMAIL_VERIFICATION', label: 'Verify Email', icon: '✉️' },
    { id: 'PASSWORD_CHANGED', label: 'Password Changed', icon: '🔑' },
    { id: 'EMAIL_CHANGED', label: 'Email Changed', icon: '🔄' },
    { id: 'FORGOT_PASSWORD', label: 'Forgot Password', icon: '🔐' },
    { id: 'RESET_PASSWORD_CONFIRM', label: 'Reset Password', icon: '✅' },
    { id: 'SESSION_REVOKED', label: 'Session Revoked', icon: '🛡️' },
    { id: 'ACCOUNT_DELETED', label: 'Account Deleted', icon: '🗑️' }
  ];

  const templateData = getEmailTemplate(selectedType, {
    name: user?.name || 'Mani Kumar',
    email: user?.email || 'mani.kumar@gmail.com',
    googleId: user?.googleId || '104829302910293840192',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/122.0.0.0',
    verifyUrl: 'http://localhost:5173/verify?token=demo_token_123',
    resetUrl: 'http://localhost:5173/reset?token=demo_reset_123'
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '820px', width: '92%', height: '85vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail size={22} color="#ec4899" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Nodemailer HTML Email Sandbox Inspector</h3>
          </div>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '0.4rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Template Selector Bar */}
        <div
          style={{
            display: 'flex',
            gap: '0.4rem',
            overflowX: 'auto',
            padding: '0.4rem',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '24px',
            marginBottom: '0.8rem'
          }}
        >
          {EMAIL_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '18px',
                border: selectedType === t.id ? '2px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                background: selectedType === t.id ? 'rgba(6, 182, 212, 0.25)' : 'transparent',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Template Meta Subject */}
        <div
          style={{
            padding: '0.5rem 0.85rem',
            background: 'rgba(139, 92, 246, 0.15)',
            border: '1px solid var(--accent-primary)',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '0.8rem',
            color: '#fff'
          }}
        >
          <strong>Subject Line:</strong> {templateData.subject}
        </div>

        {/* Responsive HTML Email Preview Frame */}
        <div style={{ flex: 1, borderRadius: '8px', overflow: 'hidden', border: '1px solid #334155' }}>
          <iframe
            srcDoc={templateData.html}
            title="Email Preview"
            style={{ width: '100%', height: '100%', border: 'none', background: '#0f172a' }}
          />
        </div>
      </div>
    </div>
  );
}
