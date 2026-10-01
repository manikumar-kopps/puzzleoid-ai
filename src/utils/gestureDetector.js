// Enhanced MediaPipe Hand Landmark Gesture Analyzer with Forgiving Thresholds

export function classifyGesture(landmarks) {
  if (!landmarks || landmarks.length < 21) {
    return { name: 'NO_HAND', icon: '🖐️', label: 'Point Hand at Camera', action: 'NONE', confidence: 0 };
  }

  // Extract key finger landmark points
  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const thumbMcp = landmarks[2];
  
  const indexTip = landmarks[8];
  const indexMcp = landmarks[5];
  const indexPip = landmarks[6];

  const middleTip = landmarks[12];
  const middleMcp = landmarks[9];

  const ringTip = landmarks[16];
  const ringMcp = landmarks[13];

  const pinkyTip = landmarks[20];
  const pinkyMcp = landmarks[17];

  // Helper distance check in 2D
  const dist = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

  // Vertical extension deltas (MCP y - TIP y > 0 means tip is higher than MCP on screen)
  const indexExt = indexMcp.y - indexTip.y;
  const middleExt = middleMcp.y - middleTip.y;
  const ringExt = ringMcp.y - ringTip.y;
  const pinkyExt = pinkyMcp.y - pinkyTip.y;
  const thumbExt = thumbMcp.y - thumbTip.y;

  // Pinch / Heart Finger distance
  const pinchDist = dist(thumbTip, indexTip);

  // 1. Peace / V-Sign (✌️) -> Index & Middle extended significantly, Ring & Pinky curled
  const isIndexMiddleUp = indexExt > 0.06 && middleExt > 0.06;
  const isRingPinkyDown = ringExt < 0.05 && pinkyExt < 0.05;

  if (isIndexMiddleUp && isRingPinkyDown) {
    return {
      name: 'PEACE',
      icon: '✌️',
      label: 'Peace Sign (Hold to Snap!)',
      action: 'SNAP_PHOTO',
      confidence: 1.0
    };
  }

  // 2. Thumbs Up (👍) -> Thumb pointing up, index/middle/ring/pinky curled down
  if (thumbExt > 0.08 && indexExt < 0.04 && middleExt < 0.04 && ringExt < 0.04) {
    return {
      name: 'THUMBS_UP',
      icon: '👍',
      label: 'Thumbs Up (Shuffle Puzzle)',
      action: 'SHUFFLE_PUZZLE',
      confidence: 0.9
    };
  }

  // 3. Open Palm (🖐️) -> All 5 fingers extended up
  if (indexExt > 0.06 && middleExt > 0.06 && ringExt > 0.06 && pinkyExt > 0.04) {
    return {
      name: 'OPEN_PALM',
      icon: '🖐️',
      label: 'Open Palm (Cycle AI Filter)',
      action: 'NEXT_FILTER',
      confidence: 0.95
    };
  }

  // 4. Pinch / Finger Heart (🫰) -> Thumb tip touching index tip
  if (pinchDist < 0.075 && indexExt > 0.02) {
    return {
      name: 'PINCH_HEART',
      icon: '🫰',
      label: 'Finger Heart (Auto Solve)',
      action: 'SOLVE_PUZZLE',
      confidence: 0.85
    };
  }

  // 5. Fist (✊) -> All fingers curled
  if (indexExt < 0.02 && middleExt < 0.02 && ringExt < 0.02 && pinkyExt < 0.02) {
    return {
      name: 'FIST',
      icon: '✊',
      label: 'Fist (Reset Strip)',
      action: 'RESET_STRIP',
      confidence: 0.9
    };
  }

  // Default hand tracked
  return {
    name: 'HAND_DETECTED',
    icon: '👋',
    label: 'Hand Tracked',
    action: 'NONE',
    confidence: 0.5,
    x: (1 - indexTip.x),
    y: indexTip.y
  };
}

// Function to draw hand skeleton on video canvas
export function drawHandSkeleton(ctx, landmarks, canvasWidth, canvasHeight) {
  if (!landmarks || landmarks.length < 21) return;

  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [5, 9], [9, 10], [10, 11], [11, 12],
    [9, 13], [13, 14], [14, 15], [15, 16],
    [13, 17], [0, 17], [17, 18], [18, 19], [19, 20]
  ];

  ctx.save();
  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#8b5cf6';
  ctx.shadowBlur = 10;

  connections.forEach(([i, j]) => {
    const p1 = landmarks[i];
    const p2 = landmarks[j];
    ctx.beginPath();
    ctx.moveTo(p1.x * canvasWidth, p1.y * canvasHeight);
    ctx.lineTo(p2.x * canvasWidth, p2.y * canvasHeight);
    ctx.stroke();
  });

  landmarks.forEach((p, idx) => {
    ctx.beginPath();
    ctx.arc(p.x * canvasWidth, p.y * canvasHeight, idx % 4 === 0 ? 6 : 4, 0, 2 * Math.PI);
    ctx.fillStyle = idx === 8 || idx === 12 ? '#06b6d4' : '#ffffff';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 8;
    ctx.fill();
  });

  ctx.restore();
}
