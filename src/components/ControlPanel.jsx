import React from 'react';
import { Sparkles, Palette, Grid, Frame, Film } from 'lucide-react';
import { FILTER_LIST } from '../utils/aiFilters';

export default function ControlPanel({
  selectedFilter,
  onSelectFilter,
  selectedTheme,
  onSelectTheme,
  gridSize,
  onChangeGridSize,
  maxShots,
  onChangeMaxShots
}) {
  const FRAME_THEMES = [
    { id: 'theme-white', name: 'Classic White', color: '#ffffff' },
    { id: 'theme-vintage', name: 'Vintage Sepia', color: '#fef3c7' },
    { id: 'theme-black', name: 'Midnight Black', color: '#0f172a' },
    { id: 'theme-rose', name: 'Rose Gold', color: '#ffe4e6' },
    { id: 'theme-cyber', name: 'Cyber Neon', color: '#1e1b4b' }
  ];

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      {/* AI Photo Filters */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
          <Sparkles size={18} color="#ec4899" />
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>AI Artistic Filter</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
          {FILTER_LIST.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onSelectFilter(filter.id)}
              style={{
                padding: '0.6rem 0.4rem',
                borderRadius: 'var(--radius-sm)',
                border: selectedFilter === filter.id ? '2px solid var(--accent-secondary)' : '1px solid var(--border-color)',
                background: selectedFilter === filter.id ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                color: selectedFilter === filter.id ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                transition: 'all 0.2s'
              }}
            >
              <span>{filter.icon}</span>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{filter.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Polaroid Frame Theme */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
          <Palette size={18} color="#8b5cf6" />
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Polaroid Film Style</span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {FRAME_THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => onSelectTheme(theme.id)}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '20px',
                border: selectedTheme === theme.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                background: selectedTheme === theme.id ? 'rgba(139, 92, 246, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: theme.color,
                  border: '1px solid rgba(0,0,0,0.3)'
                }}
              />
              <span>{theme.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Puzzle Grid Difficulty & Shots Selection */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
            <Grid size={18} color="#06b6d4" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Puzzle Grid</span>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {[2, 3, 4].map((size) => (
              <button
                key={size}
                onClick={() => onChangeGridSize(size)}
                style={{
                  flex: 1,
                  padding: '0.4rem 0',
                  borderRadius: 'var(--radius-sm)',
                  border: gridSize === size ? '2px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                  background: gridSize === size ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}
              >
                {`${size}x${size}`}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
            <Film size={18} color="#f59e0b" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Shot Count</span>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {[3, 4].map((num) => (
              <button
                key={num}
                onClick={() => onChangeMaxShots(num)}
                style={{
                  flex: 1,
                  padding: '0.4rem 0',
                  borderRadius: 'var(--radius-sm)',
                  border: maxShots === num ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)',
                  background: maxShots === num ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}
              >
                {`${num} Shots`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
