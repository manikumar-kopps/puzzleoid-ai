import React, { useEffect, useState, useRef } from 'react';
import { RefreshCw, Sparkles, Wand2, ArrowLeft, Trophy, Image, Camera, RotateCcw, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { createPuzzlePieces, shuffleArray, isPuzzleSolved } from '../utils/puzzleEngine';
import { soundFx } from '../utils/audio';

export default function PuzzleBoard({
  polaroidCanvas,
  shots = [],
  initialShotIdx = -1,
  gridSize = 3,
  onBackToBooth,
  onResetAndNewPhotos
}) {
  const [selectedTargetIdx, setSelectedTargetIdx] = useState(initialShotIdx);
  const [pieces, setPieces] = useState([]);
  const [boardSlots, setBoardSlots] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [isSolved, setIsSolved] = useState(false);

  const [touchDraggingPiece, setTouchDraggingPiece] = useState(null);
  const [touchPos, setTouchPos] = useState({ x: 0, y: 0 });
  const gridRef = useRef(null);

  useEffect(() => {
    loadPuzzleForTarget(selectedTargetIdx);
  }, [polaroidCanvas, shots, gridSize, selectedTargetIdx]);

  const loadPuzzleForTarget = (targetIdx) => {
    let source = polaroidCanvas;

    if (targetIdx >= 0 && shots[targetIdx]) {
      source = shots[targetIdx].dataUrl;
    }

    if (!source) return;

    createPuzzlePieces(source, gridSize, gridSize, (generatedPieces) => {
      const totalSlots = gridSize * gridSize;
      setBoardSlots(new Array(totalSlots).fill(null));
      setPieces(shuffleArray(generatedPieces));
      setIsSolved(false);
      setSelectedPiece(null);
    });
  };

  const handleDragStart = (e, piece) => {
    if (isSolved) return; // Stay solved!
    e.dataTransfer.setData('text/plain', piece.id.toString());
    setSelectedPiece(piece);
  };

  const handleDropSlot = (e, slotIdx) => {
    e.preventDefault();
    if (!selectedPiece || isSolved) return;
    placePieceInSlot(selectedPiece, slotIdx);
    setSelectedPiece(null);
  };

  const handleBankPieceClick = (piece) => {
    if (isSolved) return;
    if (selectedPiece && selectedPiece.id === piece.id) {
      setSelectedPiece(null);
    } else {
      setSelectedPiece(piece);
      soundFx.playSnapSound();
    }
  };

  const handleSlotClick = (slotIdx) => {
    if (isSolved) return; // Stay solved!
    const existing = boardSlots[slotIdx];

    if (selectedPiece) {
      placePieceInSlot(selectedPiece, slotIdx);
      setSelectedPiece(null);
    } else if (existing) {
      const newSlots = [...boardSlots];
      newSlots[slotIdx] = null;
      setBoardSlots(newSlots);
      setPieces(prev => [...prev, existing]);
      soundFx.playSnapSound();
    }
  };

  const placePieceInSlot = (pieceToPlace, slotIdx) => {
    const newSlots = [...boardSlots];
    const existingPiece = newSlots[slotIdx];

    newSlots[slotIdx] = pieceToPlace;
    setPieces(prev => prev.filter(p => p.id !== pieceToPlace.id));

    if (existingPiece && existingPiece.id !== pieceToPlace.id) {
      setPieces(prev => [...prev, existingPiece]);
    }

    setBoardSlots(newSlots);
    soundFx.playSnapSound();

    const filledCount = newSlots.filter(Boolean).length;
    if (filledCount === gridSize * gridSize) {
      if (isPuzzleSolved(newSlots, gridSize * gridSize)) {
        triggerVictory();
      }
    }
  };

  const handleTouchStart = (e, piece) => {
    if (isSolved) return;
    const touch = e.touches[0];
    setTouchDraggingPiece(piece);
    setTouchPos({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e) => {
    if (!touchDraggingPiece) return;
    const touch = e.touches[0];
    setTouchPos({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e) => {
    if (!touchDraggingPiece || !gridRef.current) {
      setTouchDraggingPiece(null);
      return;
    }

    const gridRect = gridRef.current.getBoundingClientRect();
    const touchX = touchPos.x;
    const touchY = touchPos.y;

    if (
      touchX >= gridRect.left &&
      touchX <= gridRect.right &&
      touchY >= gridRect.top &&
      touchY <= gridRect.bottom
    ) {
      const col = Math.floor(((touchX - gridRect.left) / gridRect.width) * gridSize);
      const row = Math.floor(((touchY - gridRect.top) / gridRect.height) * gridSize);
      const slotIdx = row * gridSize + col;

      if (slotIdx >= 0 && slotIdx < gridSize * gridSize) {
        placePieceInSlot(touchDraggingPiece, slotIdx);
      }
    }

    setTouchDraggingPiece(null);
  };

  const handleShuffle = () => {
    soundFx.playSnapSound();
    const allPieces = [...pieces, ...boardSlots.filter(Boolean)];
    setBoardSlots(new Array(gridSize * gridSize).fill(null));
    setPieces(shuffleArray(allPieces));
    setSelectedPiece(null);
    setIsSolved(false);
  };

  const handleAutoSolve = () => {
    soundFx.playVictoryFanfare();
    const allPieces = [...pieces, ...boardSlots.filter(Boolean)].sort((a, b) => a.id - b.id);
    setBoardSlots(allPieces);
    setPieces([]);
    setSelectedPiece(null);
    triggerVictory();
  };

  const triggerVictory = () => {
    setIsSolved(true);
    soundFx.playVictoryFanfare();
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.55 }
    });
  };

  return (
    <div
      className="puzzle-board-container glass-panel"
      style={{ padding: '1rem', width: '100%' }}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button className="btn-secondary" onClick={onBackToBooth}>
          <ArrowLeft size={18} />
          <span>Photobooth</span>
        </button>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sparkles size={18} color="#ec4899" />
          <span>
            {selectedTargetIdx === -1
              ? `Full Polaroid Strip (${gridSize}x${gridSize})`
              : `Shot #${selectedTargetIdx + 1} Individual Puzzle (${gridSize}x${gridSize})`}
          </span>
        </h3>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button className="btn-secondary" onClick={handleShuffle} title="Shuffle Pieces">
            <RefreshCw size={16} />
            <span style={{ fontSize: '0.8rem' }}>Shuffle</span>
          </button>
          <button className="btn-secondary" onClick={handleAutoSolve} title="Auto Solve">
            <Wand2 size={16} color="#8b5cf6" />
            <span style={{ fontSize: '0.8rem' }}>Solve</span>
          </button>
        </div>
      </div>

      {/* Target Selector Tabs: Full Strip vs Shot #1 / #2 / #3 */}
      <div
        style={{
          display: 'flex',
          gap: '0.4rem',
          overflowX: 'auto',
          maxWidth: '100%',
          padding: '0.4rem',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '30px'
        }}
      >
        <button
          onClick={() => setSelectedTargetIdx(-1)}
          style={{
            padding: '0.4rem 0.85rem',
            borderRadius: '20px',
            border: selectedTargetIdx === -1 ? '2px solid var(--accent-cyan)' : '1px solid var(--border-color)',
            background: selectedTargetIdx === -1 ? 'rgba(6, 182, 212, 0.25)' : 'transparent',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            whiteSpace: 'nowrap'
          }}
        >
          <Image size={14} />
          <span>Full Strip</span>
        </button>

        {shots.map((shot, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedTargetIdx(idx)}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '20px',
              border: selectedTargetIdx === idx ? '2px solid var(--accent-secondary)' : '1px solid var(--border-color)',
              background: selectedTargetIdx === idx ? 'rgba(236, 72, 153, 0.25)' : 'transparent',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              whiteSpace: 'nowrap'
            }}
          >
            <Camera size={14} />
            <span>Shot #{idx + 1}</span>
          </button>
        ))}
      </div>

      {/* Victory Banner (Stays Solved) */}
      {isSolved && (
        <div
          className="victory-banner"
          style={{
            width: '100%',
            flexDirection: 'column',
            gap: '0.6rem',
            alignItems: 'center',
            textAlign: 'center',
            padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, #10b981, #047857)',
            border: '2px solid #34d399'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 800 }}>
            <Trophy size={22} />
            <span>PUZZLE SOLVED & REASSEMBLED! 🎉</span>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.3rem' }}>
            <button
              className="btn-secondary"
              onClick={onBackToBooth}
              style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
            >
              <ArrowLeft size={16} />
              <span>Back to Photobooth</span>
            </button>

            <button
              className="btn-secondary"
              onClick={handleShuffle}
              style={{ background: 'rgba(0,0,0,0.3)', color: '#fff' }}
            >
              <RotateCcw size={16} />
              <span>Reshuffle Puzzle</span>
            </button>

            <button
              className="btn-secondary"
              onClick={onResetAndNewPhotos}
              style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', borderColor: '#ef4444' }}
            >
              <Sparkles size={16} />
              <span>Snap New Photos</span>
            </button>
          </div>
        </div>
      )}

      {/* Interactive Mobile Touch Hint */}
      {!isSolved && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          💡 <strong>Tip:</strong> Tap a piece in the bank below, then tap a grid slot to place it!
        </div>
      )}

      {/* Puzzle Drop Zone */}
      <div className="puzzle-area" style={{ width: '100%', maxWidth: '340px' }}>
        <div
          ref={gridRef}
          className="puzzle-grid"
          style={{
            width: '100%',
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`
          }}
        >
          {boardSlots.map((slotPiece, idx) => (
            <div
              key={idx}
              className={`puzzle-piece-slot ${slotPiece && slotPiece.id === idx ? 'correct-slot' : ''}`}
              style={{
                aspectRatio: '1 / 1',
                background: slotPiece ? 'none' : 'rgba(255, 255, 255, 0.06)',
                border: selectedPiece ? '2px dashed var(--accent-cyan)' : (isSolved ? '2px solid #10b981' : '1px dashed rgba(255, 255, 255, 0.25)'),
                borderRadius: '4px',
                position: 'relative',
                overflow: 'hidden',
                cursor: isSolved ? 'default' : 'pointer'
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDropSlot(e, idx)}
              onClick={() => handleSlotClick(idx)}
            >
              {slotPiece ? (
                <img
                  src={slotPiece.dataUrl}
                  alt={`Slot ${idx}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    color: 'rgba(255, 255, 255, 0.3)',
                    fontWeight: 700
                  }}
                >
                  {idx + 1}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Touch Dragging Floating Element */}
      {touchDraggingPiece && (
        <div
          style={{
            position: 'fixed',
            left: touchPos.x - 40,
            top: touchPos.y - 40,
            width: '80px',
            height: '80px',
            pointerEvents: 'none',
            zIndex: 999,
            borderRadius: '6px',
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0,0,0,0.8)',
            border: '2px solid var(--accent-secondary)'
          }}
        >
          <img src={touchDraggingPiece.dataUrl} alt="Dragging" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      {/* Piece Bank */}
      {pieces.length > 0 && (
        <div style={{ width: '100%', marginTop: '0.8rem' }}>
          <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', textAlign: 'center' }}>
            {`Puzzle Pieces Bank (${pieces.length} left)`}
          </h4>
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              padding: '0.6rem',
              background: 'rgba(0, 0, 0, 0.35)',
              borderRadius: 'var(--radius-md)',
              justifyContent: pieces.length < 5 ? 'center' : 'flex-start'
            }}
          >
            {pieces.map((piece) => {
              const isSelected = selectedPiece && selectedPiece.id === piece.id;
              return (
                <div
                  key={piece.id}
                  draggable={!isSolved}
                  onDragStart={(e) => handleDragStart(e, piece)}
                  onTouchStart={(e) => handleTouchStart(e, piece)}
                  onClick={() => handleBankPieceClick(piece)}
                  className={`puzzle-piece ${isSelected ? 'dragging' : ''}`}
                  style={{
                    width: '68px',
                    height: '68px',
                    flexShrink: 0,
                    border: isSelected ? '3px solid var(--accent-cyan)' : '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  <img src={piece.dataUrl} alt="Piece" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
