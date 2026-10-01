import React, { useRef } from 'react';
import { Puzzle, Download, Trash2, Bookmark, Sparkles } from 'lucide-react';
import html2canvas from 'html2canvas';
import { soundFx } from '../utils/audio';

export default function PolaroidStrip({
  shots = [],
  theme = 'theme-white',
  onConvertToPuzzle,
  onResetStrip,
  onSaveToGallery,
  maxShots = 3
}) {
  const stripRef = useRef(null);
  const [title, setTitle] = React.useState('✨ AI Puzzleoid Strip');
  const todayDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const handleExportPNG = async () => {
    if (!stripRef.current) return;
    soundFx.playSnapSound();
    try {
      const canvas = await html2canvas(stripRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `polaroid-strip-${Date.now()}.png`;
      link.href = image;
      link.click();
    } catch (err) {
      console.error('Failed to export PNG:', err);
    }
  };

  const handleCreateFullPuzzle = async () => {
    if (!stripRef.current || shots.length === 0) return;
    soundFx.playSnapSound();
    try {
      const canvas = await html2canvas(stripRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true
      });
      onConvertToPuzzle(canvas, -1); // -1 means Full Strip
    } catch (err) {
      console.error('Failed to slice puzzle:', err);
    }
  };

  const handleCreateShotPuzzle = (shotIdx) => {
    soundFx.playSnapSound();
    if (onConvertToPuzzle && stripRef.current) {
      html2canvas(stripRef.current, { scale: 2, backgroundColor: null, useCORS: true }).then(canvas => {
        onConvertToPuzzle(canvas, shotIdx);
      });
    }
  };

  return (
    <div className="polaroid-strip-wrapper">
      {/* Polaroid Container */}
      <div ref={stripRef} className={`polaroid-strip ${theme}`}>
        <div className="metallic-tape" />

        {/* Multi-Shot Frames */}
        {Array.from({ length: maxShots }).map((_, idx) => {
          const shot = shots[idx];
          return (
            <div key={idx} className="polaroid-shot" style={{ position: 'relative' }}>
              {shot ? (
                <>
                  <img src={shot.dataUrl} alt={`Shot ${idx + 1}`} className="polaroid-img" />
                  <div className="shot-badge">{shot.caption || `Shot #${idx + 1}`}</div>

                  {/* Individual Shot Puzzle Button */}
                  <button
                    className="btn-secondary"
                    onClick={() => handleCreateShotPuzzle(idx)}
                    title={`Puzzle Shot #${idx + 1} Individually`}
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      padding: '3px 8px',
                      fontSize: '0.7rem',
                      background: 'rgba(9, 13, 22, 0.85)',
                      backdropFilter: 'blur(4px)',
                      color: 'var(--accent-cyan)',
                      border: '1px solid var(--accent-cyan)'
                    }}
                  >
                    <Puzzle size={12} />
                    <span>Puzzle #{idx + 1}</span>
                  </button>
                </>
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                    gap: '0.5rem',
                    background: 'rgba(0, 0, 0, 0.04)'
                  }}
                >
                  <Sparkles size={24} style={{ opacity: 0.5 }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    {`Shot #${idx + 1} Waiting...`}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Polaroid Footer */}
        <div className="polaroid-footer">
          <input
            type="text"
            className="polaroid-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Handwritten Title..."
          />
          <div className="polaroid-date">{todayDate} • AI PHOTOBOOTH</div>
          <div className="polaroid-stamp">AI APPROVED • ✌️</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          className="btn-primary"
          onClick={handleCreateFullPuzzle}
          disabled={shots.length === 0}
          style={{ opacity: shots.length === 0 ? 0.5 : 1 }}
        >
          <Puzzle size={18} />
          <span>Turn into Puzzle</span>
        </button>

        <button
          className="btn-secondary"
          onClick={handleExportPNG}
          disabled={shots.length === 0}
          title="Download PNG"
        >
          <Download size={18} />
        </button>

        <button
          className="btn-secondary"
          onClick={() => shots.length > 0 && onSaveToGallery(stripRef.current, title)}
          disabled={shots.length === 0}
          title="Save to Gallery"
        >
          <Bookmark size={18} />
        </button>

        <button
          className="btn-secondary"
          onClick={onResetStrip}
          disabled={shots.length === 0}
          title="Clear Strip"
        >
          <Trash2 size={18} color="#ef4444" />
        </button>
      </div>
    </div>
  );
}
