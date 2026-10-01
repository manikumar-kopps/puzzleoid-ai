import React from 'react';
import { X, Sparkles, Hand } from 'lucide-react';

export default function GestureGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const GESTURES = [
    { emoji: '✌️', name: 'Peace / V-Sign', action: '3-2-1 Countdown & Photo Snap' },
    { emoji: '🖐️', name: 'Open Palm', action: 'Cycle Next AI Artistic Filter' },
    { emoji: '👍', name: 'Thumbs Up', action: 'Shuffle Puzzle Pieces' },
    { emoji: '🫰', name: 'Finger Heart', action: 'Auto-Solve Puzzle' },
    { emoji: '✊', name: 'Fist Hand', action: 'Clear Current Strip' }
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Hand size={22} color="#8b5cf6" />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Hand Gesture Guide</h3>
          </div>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '0.4rem' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
          Point your hand at the camera feed! Our AI real-time landmark detector recognizes these gestures automatically.
        </p>

        <div className="gesture-grid">
          {GESTURES.map((g, idx) => (
            <div key={idx} className="gesture-card">
              <span className="gesture-emoji">{g.emoji}</span>
              <span className="gesture-card-title">{g.name}</span>
              <span className="gesture-card-action">{g.action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
