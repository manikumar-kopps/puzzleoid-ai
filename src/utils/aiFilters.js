// Canvas Procedural AI Filters & AI Photobooth Annotations

export const FILTER_LIST = [
  { id: 'normal', name: 'Original Film', icon: '📸' },
  { id: 'golden', name: 'Golden Hour', icon: '🌅' },
  { id: 'matrix', name: 'Cyber Matrix', icon: '💚' },
  { id: 'noir', name: 'Noir Cinema', icon: '🎬' },
  { id: 'sakura', name: 'Sakura Dream', icon: '🌸' },
  { id: 'hologram', name: 'Neon Hologram', icon: '⚡' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', icon: '🎆' },
  { id: 'vintage', name: 'Vintage Polaroid', icon: '🎞️' },
  { id: 'popart', name: 'Pop Art Comic', icon: '🎨' },
  { id: 'vaporwave', name: 'Vaporwave Dream', icon: '🔮' },
  { id: 'sketch', name: 'AI Pencil Sketch', icon: '✏️' }
];

export function getCSSFilter(filterId = 'normal') {
  switch (filterId) {
    case 'golden':
      return 'sepia(0.35) contrast(1.15) saturate(1.4) brightness(1.05) hue-rotate(-15deg)';
    case 'matrix':
      return 'contrast(1.4) saturate(1.6) hue-rotate(90deg) brightness(0.95)';
    case 'noir':
      return 'grayscale(1) contrast(1.4) brightness(0.95)';
    case 'sakura':
      return 'hue-rotate(310deg) saturate(1.3) brightness(1.1) contrast(1.05)';
    case 'hologram':
      return 'contrast(1.3) saturate(2.0) hue-rotate(180deg) brightness(1.1)';
    case 'cyberpunk':
      return 'contrast(1.3) saturate(1.8) hue-rotate(280deg) brightness(1.05)';
    case 'vintage':
      return 'sepia(0.65) contrast(1.15) brightness(0.92) saturate(1.2) hue-rotate(-15deg)';
    case 'popart':
      return 'contrast(2.2) saturate(2.5) brightness(1.05)';
    case 'vaporwave':
      return 'hue-rotate(220deg) saturate(1.7) brightness(1.15)';
    case 'sketch':
      return 'grayscale(1) contrast(3.0) brightness(1.1)';
    case 'normal':
    default:
      return 'none';
  }
}

export function applyAIFilter(canvas, filterId = 'normal') {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  // IMPORTANT: For 'normal' (Original Film), DO NOT touch pixels at all to preserve 100% natural camera colors!
  if (filterId === 'normal') return;

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    switch (filterId) {
      case 'golden':
        // Warm sunset amber glow
        data[i] = Math.min(255, r * 1.2 + 25);
        data[i + 1] = Math.min(255, g * 1.05 + 10);
        data[i + 2] = Math.max(0, b * 0.85);
        break;

      case 'matrix':
        // Cyber matrix neon green tint
        data[i] = Math.max(0, r * 0.7);
        data[i + 1] = Math.min(255, g * 1.35 + 40);
        data[i + 2] = Math.max(0, b * 0.8);
        break;

      case 'noir':
        // High contrast dramatic monochrome
        const gray = r * 0.299 + g * 0.587 + b * 0.114;
        const contrastVal = (gray - 128) * 1.3 + 128;
        const finalVal = Math.min(255, Math.max(0, contrastVal));
        data[i] = finalVal;
        data[i + 1] = finalVal;
        data[i + 2] = finalVal;
        break;

      case 'sakura':
        // Soft pastel pink anime blossom
        data[i] = Math.min(255, r * 1.15 + 35);
        data[i + 1] = Math.min(255, g * 0.95 + 15);
        data[i + 2] = Math.min(255, b * 1.1 + 25);
        break;

      case 'hologram':
        // Trippy chromatic rainbow cyan
        data[i] = Math.max(0, r * 0.8);
        data[i + 1] = Math.min(255, g * 1.2 + 30);
        data[i + 2] = Math.min(255, b * 1.5 + 50);
        break;

      case 'cyberpunk':
        data[i] = Math.min(255, r * 1.25 + 30);
        data[i + 1] = Math.max(0, g * 0.85);
        data[i + 2] = Math.min(255, b * 1.4 + 45);
        break;

      case 'vintage':
        data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189) + 25);
        data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168) + 15);
        data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
        break;

      case 'popart':
        data[i] = r > 120 ? 245 : 35;
        data[i + 1] = g > 120 ? 220 : 25;
        data[i + 2] = b > 120 ? 255 : 45;
        break;

      case 'vaporwave':
        data[i] = Math.min(255, r * 1.15 + 45);
        data[i + 1] = Math.min(255, g * 0.9 + 25);
        data[i + 2] = Math.min(255, b * 1.45 + 55);
        break;

      case 'sketch': {
        const avg = (r + g + b) / 3;
        const v = avg > 110 ? 240 : (avg < 50 ? 25 : 125);
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v + 15;
        break;
      }

      default:
        break;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  ctx.save();
  ctx.font = '10px sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fillText('AI POLAROID • STYLED', 12, height - 12);
  ctx.restore();
}

export function generateAICaption(gestureName = 'PEACE', index = 1) {
  const captionsByGesture = {
    PEACE: [
      "✌️ Peace & Pure Vibes",
      "⚡ Electric V-Sign Energy",
      "✨ Iconic Victory Pose",
      "🌟 Photobooth Star"
    ],
    OPEN_PALM: [
      "🖐️ High Five Energy",
      "✨ Magic Palm Magic",
      "🔮 Wave of Wonder"
    ],
    THUMBS_UP: [
      "👍 Approved by AI",
      "🔥 100% Perfection",
      "⭐ Masterpiece Snap"
    ],
    PINCH_HEART: [
      "🫰 Finger Heart Love",
      "💖 Sweet AI Magic",
      "✨ Pure Charm"
    ],
    DEFAULT: [
      "📸 Polaroid Moment",
      "⚡ AI Puzzle Capture",
      "✨ Photobooth Magic"
    ]
  };

  const pool = captionsByGesture[gestureName] || captionsByGesture.DEFAULT;
  return pool[(index - 1) % pool.length];
}
