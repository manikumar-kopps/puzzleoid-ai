import React from 'react';
import { X, Trash2, Download, Image as ImageIcon } from 'lucide-react';

export default function GalleryModal({
  isOpen,
  onClose,
  savedStrips = [],
  onDeleteStrip
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ImageIcon size={22} color="#ec4899" />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Saved Polaroid Gallery</h3>
          </div>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '0.4rem' }}>
            <X size={20} />
          </button>
        </div>

        {savedStrips.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No polaroid strips saved yet!</p>
            <p style={{ fontSize: '0.85rem' }}>Take photos with ✌️ Peace gesture and click "Save to Gallery".</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem' }}>
            {savedStrips.map((strip) => (
              <div
                key={strip.id}
                className="glass-panel"
                style={{
                  padding: '0.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                  alignItems: 'center'
                }}
              >
                <img
                  src={strip.dataUrl}
                  alt={strip.title}
                  style={{
                    width: '100%',
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                  }}
                />

                <span style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'var(--font-hand)' }}>
                  {strip.title}
                </span>

                <div style={{ display: 'flex', gap: '0.4rem', width: '100%' }}>
                  <a
                    href={strip.dataUrl}
                    download={`${strip.title || 'polaroid'}.png`}
                    className="btn-secondary"
                    style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}
                  >
                    <Download size={16} />
                  </a>
                  <button
                    className="btn-secondary"
                    onClick={() => onDeleteStrip(strip.id)}
                    style={{ padding: '0.5rem' }}
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
