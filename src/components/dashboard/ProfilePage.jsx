import React, { useState, useEffect } from 'react';
import { ShieldCheck, Mail, Calendar, Key, AlertTriangle, Send, LogOut, CheckCircle2, User, Globe, Laptop, Clock, Trash2, Eye } from 'lucide-react';
import { authApi } from '../../services/api';
import { soundFx } from '../../utils/audio';

export default function ProfilePage({ user, onLogout, onOpenEmailPreview }) {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState(null);

  useEffect(() => {
    fetchFullProfile();
  }, [user]);

  const fetchFullProfile = async () => {
    setLoading(true);
    const data = await authApi.getProfile();
    if (data.success) {
      setProfileData(data);
    }
    setLoading(false);
  };

  const handleSendVerification = async () => {
    soundFx.playSnapSound();
    setActionMsg('Sending Verification Email via Nodemailer...');
    const res = await authApi.sendVerificationEmail();
    setActionMsg(res.message || 'Verification Email Dispatched!');
    setTimeout(() => setActionMsg(null), 3000);
  };

  const handleTriggerEmailAlert = async (type) => {
    soundFx.playSnapSound();
    setActionMsg(`Sending ${type} Email Notification...`);
    const res = await authApi.triggerEmail(type, user?.email);
    setActionMsg(res.message || `Dispatched ${type} Email!`);
    setTimeout(() => setActionMsg(null), 3000);
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading Google Authentication Profile & Database Schema...
      </div>
    );
  }

  const u = profileData?.user || user;
  const history = profileData?.loginHistory || [];
  const sessions = profileData?.activeSessions || [];
  const logs = profileData?.emailLogs || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', width: '100%' }}>
      {/* Action Toast Message */}
      {actionMsg && (
        <div
          style={{
            background: 'linear-gradient(135deg, #10b981, #047857)',
            color: '#fff',
            padding: '0.75rem 1.2rem',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.4)'
          }}
        >
          <CheckCircle2 size={18} />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <img
          src={u.avatar || u.picture}
          alt={u.name}
          style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            border: '4px solid var(--accent-primary)',
            objectFit: 'cover'
          }}
        />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#fff' }}>{u.name}</h2>
            <span
              style={{
                background: 'rgba(6, 182, 212, 0.2)',
                border: '1px solid var(--accent-cyan)',
                color: 'var(--accent-cyan)',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <ShieldCheck size={14} /> Google OAuth 2.0
            </span>
          </div>

          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{u.email}</span>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>🆔 <strong>Google ID:</strong> {u.googleId || u.google_id || '104829302910293840192'}</span>
            <span>📅 <strong>Joined:</strong> {new Date(u.createdAt || Date.now()).toLocaleDateString()}</span>
          </div>
        </div>

        <button className="btn-secondary" onClick={onLogout} style={{ borderColor: '#ef4444', color: '#fca5a5' }}>
          <LogOut size={16} color="#ef4444" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Grid: Email Trigger Actions & Email Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
        {/* Email Triggers */}
        <div className="glass-panel" style={{ padding: '1.2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail size={18} color="var(--accent-cyan)" />
            <span>Nodemailer HTML Email Service</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <button className="btn-secondary" onClick={() => handleTriggerEmailAlert('WELCOME')} style={{ justifyContent: 'flex-start' }}>
              <Send size={16} color="#10b981" />
              <span>📩 Dispatch Welcome Email</span>
            </button>

            <button className="btn-secondary" onClick={() => handleTriggerEmailAlert('LOGIN_ALERT')} style={{ justifyContent: 'flex-start' }}>
              <Send size={16} color="#3b82f6" />
              <span>🔔 Trigger Login Security Alert</span>
            </button>

            <button className="btn-secondary" onClick={() => handleTriggerEmailAlert('SUSPICIOUS_LOGIN')} style={{ justifyContent: 'flex-start' }}>
              <AlertTriangle size={16} color="#ef4444" />
              <span>⚠️ Trigger Suspicious Login Warning</span>
            </button>

            <button className="btn-secondary" onClick={handleSendVerification} style={{ justifyContent: 'flex-start' }}>
              <CheckCircle2 size={16} color="#8b5cf6" />
              <span>✉️ Send Verification Token Email</span>
            </button>
          </div>
        </div>

        {/* Email Templates Inspector Button */}
        <div className="glass-panel" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Eye size={18} color="#ec4899" />
              <span>11 HTML Email Templates Sandbox</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Preview responsive HTML email templates for Welcome, Account Created, Login Alert, Password Changed, Suspicious Login, and Deletion.
            </p>
          </div>

          <button className="btn-primary" onClick={onOpenEmailPreview} style={{ width: '100%', justifyContent: 'center' }}>
            <Eye size={18} />
            <span>Inspect All 11 HTML Templates</span>
          </button>
        </div>
      </div>

      {/* Audit Log Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.2rem' }}>
        {/* Email Delivery Audit Log */}
        <div className="glass-panel" style={{ padding: '1.2rem' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.8rem', color: 'var(--text-muted)' }}>
            📬 Email Delivery Audit Logs
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
            {logs.map((log, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '6px',
                  fontSize: '0.75rem'
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: '#fff' }}>[{log.email_type}]</span> {log.subject}
                </div>
                <span style={{ color: log.status === 'SENT' ? '#34d399' : '#fca5a5', fontWeight: 700 }}>{log.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Sessions */}
        <div className="glass-panel" style={{ padding: '1.2rem' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.8rem', color: 'var(--text-muted)' }}>
            💻 Active JWT Cookie Sessions
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
            {sessions.map((sess, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '6px',
                  fontSize: '0.75rem'
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: '#fff' }}>IP: {sess.ip_address}</span> ({sess.user_agent})
                </div>
                <span style={{ color: '#60a5fa', fontWeight: 700 }}>Active</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
