// Interactive Puzzle Engine for Polaroid Strips & Individual Photos

export function createPuzzlePieces(imageSource, gridRows = 3, gridCols = 3, callback) {
  if (!imageSource) {
    if (callback) callback([]);
    return [];
  }

  const processSource = (imgObj) => {
    const pieces = [];
    const width = imgObj.width || imgObj.naturalWidth || 600;
    const height = imgObj.height || imgObj.naturalHeight || 600;

    const pieceWidth = width / gridCols;
    const pieceHeight = height / gridRows;

    let id = 0;
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const pieceCanvas = document.createElement('canvas');
        pieceCanvas.width = pieceWidth;
        pieceCanvas.height = pieceHeight;
        const ctx = pieceCanvas.getContext('2d');

        ctx.drawImage(
          imgObj,
          c * pieceWidth, r * pieceHeight, pieceWidth, pieceHeight,
          0, 0, pieceWidth, pieceHeight
        );

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, pieceWidth, pieceHeight);

        pieces.push({
          id,
          targetRow: r,
          targetCol: c,
          currentSlot: null,
          dataUrl: pieceCanvas.toDataURL(),
          width: pieceWidth,
          height: pieceHeight
        });
        id++;
      }
    }

    if (callback) callback(pieces);
    return pieces;
  };

  if (typeof imageSource === 'string') {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => processSource(img);
    img.src = imageSource;
    return [];
  } else {
    return processSource(imageSource);
  }
}

export function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function isPuzzleSolved(placedPieces, totalPieces) {
  if (placedPieces.length !== totalPieces) return false;
  return placedPieces.every((piece, slotIdx) => piece.id === slotIdx);
}
