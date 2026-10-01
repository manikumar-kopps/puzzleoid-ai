import React from 'react';
import { Camera, Volume2, VolumeX, HelpCircle, Image } from 'lucide-react';
import { soundFx } from '../utils/audio';

export default function Header({
  soundMuted,
  onToggleSound,
  onOpenGuide,
  onOpenGallery,
  savedCount
}) {
  return (
    <header className="app-header">
      <div className="logo-container">
        <div className="logo-icon">
          <Camera size={22} />
        </div>
        <div>
          <span className="logo-text">Puzzleoid</span>
          <span className="badge-ai">AI Photobooth</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <button className="btn-secondary" onClick={onOpenGuide} title="Gesture Guide">
          <HelpCircle size={18} />
          <span>Gestures</span>
        </button>

        <button
          className="btn-secondary"
          onClick={onOpenGallery}
          title="Saved Polaroid Gallery"
          style={{ position: 'relative' }}
        >
          <Image size={18} />
          <span>Gallery</span>
          {savedCount > 0 && (
            <span
              style={{
                background: 'var(--accent-secondary)',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: '800',
                padding: '2px 6px',
                borderRadius: '10px',
                marginLeft: '4px'
              }}
            >
              {savedCount}
            </span>
          )}
        </button>

        <button
          className="btn-secondary"
          onClick={() => {
            soundFx.initContext();
            onToggleSound();
          }}
          title={soundMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {soundMuted ? <VolumeX size={18} color="#ef4444" /> : <Volume2 size={18} color="#10b981" />}
        </button>
      </div>
    </header>
  );
}
