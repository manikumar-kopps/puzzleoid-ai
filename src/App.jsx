import React, { useState } from 'react';
import Header from './components/Header';
import CameraView from './components/CameraView';
import PolaroidStrip from './components/PolaroidStrip';
import PuzzleBoard from './components/PuzzleBoard';
import ControlPanel from './components/ControlPanel';
import GalleryModal from './components/GalleryModal';
import GestureGuideModal from './components/GestureGuideModal';
import { FILTER_LIST } from './utils/aiFilters';
import { soundFx } from './utils/audio';
import html2canvas from 'html2canvas';

export default function App() {
  // Screen View State: 'BOOTH' (Default photobooth studio), 'PUZZLE' (Interactive photo puzzle)
  const [viewState, setViewState] = useState('BOOTH');

  // Photobooth state
  const [capturedShots, setCapturedShots] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('normal');
  const [selectedTheme, setSelectedTheme] = useState('theme-white');
  const [gridSize, setGridSize] = useState(3);
  const [maxShots, setMaxShots] = useState(3);

  const [polaroidCanvas, setPolaroidCanvas] = useState(null);
  const [puzzleTargetShotIdx, setPuzzleTargetShotIdx] = useState(-1);
  const [savedStrips, setSavedStrips] = useState([]);
  const [soundMuted, setSoundMuted] = useState(false);

  // Modals state
  const [guideOpen, setGuideOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const handleShotCaptured = (shot) => {
    setCapturedShots((prev) => {
      if (prev.length >= maxShots) return prev;
      return [...prev, shot];
    });
  };

  const handleGestureAction = (action) => {
    if (action === 'NEXT_FILTER') {
      setSelectedFilter((prevFilter) => {
        const idx = FILTER_LIST.findIndex((f) => f.id === prevFilter);
        const nextIdx = (idx + 1) % FILTER_LIST.length;
        soundFx.playGestureSound();
        return FILTER_LIST[nextIdx].id;
      });
    } else if (action === 'RESET_STRIP') {
      setCapturedShots([]);
    }
  };

  const handleConvertToPuzzle = (renderedCanvas, shotIdx = -1) => {
    setPolaroidCanvas(renderedCanvas);
    setPuzzleTargetShotIdx(shotIdx);
    setViewState('PUZZLE');
  };

  const handleBackToBooth = () => {
    setViewState('BOOTH');
  };

  const handleResetAndNewPhotos = () => {
    setCapturedShots([]);
    setPolaroidCanvas(null);
    setPuzzleTargetShotIdx(-1);
    setViewState('BOOTH');
  };

  const handleSaveToGallery = async (stripElement, title) => {
    if (!stripElement) return;
    try {
      const canvas = await html2canvas(stripElement, { scale: 2, useCORS: true });
      const dataUrl = canvas.toDataURL('image/png');
      setSavedStrips((prev) => [
        { id: Date.now(), title, dataUrl },
        ...prev
      ]);
      setGalleryOpen(true);
    } catch (err) {
      console.error('Failed to save to gallery:', err);
    }
  };

  return (
    <div className="app-root">
      {/* Navigation Header */}
      <Header
        soundMuted={soundMuted}
        onToggleSound={() => setSoundMuted(soundFx.toggleMute())}
        onOpenGuide={() => setGuideOpen(true)}
        onOpenGallery={() => setGalleryOpen(true)}
        savedCount={savedStrips.length}
      />

      {/* Main App Workspace */}
      <main className="photobooth-container">
        {viewState === 'BOOTH' ? (
          <>
            {/* Left: Camera & Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <CameraView
                selectedFilter={selectedFilter}
                onShotCaptured={handleShotCaptured}
                maxShots={maxShots}
                capturedShots={capturedShots}
                onGestureAction={handleGestureAction}
              />

              <ControlPanel
                selectedFilter={selectedFilter}
                onSelectFilter={setSelectedFilter}
                selectedTheme={selectedTheme}
                onSelectTheme={setSelectedTheme}
                gridSize={gridSize}
                onChangeGridSize={setGridSize}
                maxShots={maxShots}
                onChangeMaxShots={setMaxShots}
              />
            </div>

            {/* Right: Live Polaroid Strip */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <PolaroidStrip
                shots={capturedShots}
                theme={selectedTheme}
                onConvertToPuzzle={handleConvertToPuzzle}
                onResetStrip={() => setCapturedShots([])}
                onSaveToGallery={handleSaveToGallery}
                maxShots={maxShots}
              />
            </div>
          </>
        ) : (
          /* Interactive Puzzle Mode */
          <div style={{ gridColumn: '1 / -1', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            <PuzzleBoard
              polaroidCanvas={polaroidCanvas}
              shots={capturedShots}
              initialShotIdx={puzzleTargetShotIdx}
              gridSize={gridSize}
              onBackToBooth={handleBackToBooth}
              onResetAndNewPhotos={handleResetAndNewPhotos}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <GalleryModal
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        savedStrips={savedStrips}
        onDeleteStrip={(id) => setSavedStrips((prev) => prev.filter((s) => s.id !== id))}
      />

      <GestureGuideModal
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
      />
    </div>
  );
}
