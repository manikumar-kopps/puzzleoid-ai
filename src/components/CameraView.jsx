import React, { useEffect, useRef, useState } from 'react';
import { Camera, Zap, Video, Wand2 } from 'lucide-react';
import { classifyGesture, drawHandSkeleton } from '../utils/gestureDetector';
import { applyAIFilter, generateAICaption, getCSSFilter, FILTER_LIST } from '../utils/aiFilters';
import { soundFx } from '../utils/audio';

export default function CameraView({
  selectedFilter,
  onShotCaptured,
  maxShots = 3,
  capturedShots = [],
  onGestureAction
}) {
  const videoRef = useRef(null);
  const overlayCanvasRef = useRef(null);

  const [hasCamera, setHasCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [currentGesture, setCurrentGesture] = useState({ name: 'NO_HAND', icon: '🖐️', label: 'Wave Hand (✌️ Fist/Peace = Photo | 🖐️ Open Palm = Filter)' });
  const [gestureProgress, setGestureProgress] = useState(0);

  const [countdown, setCountdown] = useState(null);
  const [flashActive, setFlashActive] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [filterToast, setFilterToast] = useState(null);

  const capturedCountRef = useRef(capturedShots.length);
  capturedCountRef.current = capturedShots.length;

  const isCountingDownRef = useRef(isCountingDown);
  isCountingDownRef.current = isCountingDown;

  const selectedFilterRef = useRef(selectedFilter);
  selectedFilterRef.current = selectedFilter;

  const gestureHoldCountRef = useRef(0);
  const activeGestureNameRef = useRef(null);
  const cooldownRef = useRef(false);

  // Load MediaPipe scripts dynamically if missing
  const ensureMediaPipeLoaded = () => {
    return new Promise((resolve) => {
      if (window.Hands && window.Camera) {
        return resolve(true);
      }

      const loadScript = (src) => {
        return new Promise((res) => {
          const s = document.createElement('script');
          s.src = src;
          s.crossOrigin = 'anonymous';
          s.onload = () => res(true);
          s.onerror = () => res(false);
          document.head.appendChild(s);
        });
      };

      Promise.all([
        loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js'),
        loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js')
      ]).then(() => resolve(!!(window.Hands && window.Camera)));
    });
  };

  const startWebcam = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch((e) => console.warn('Play notice:', e));
        setHasCamera(true);
      }

      await ensureMediaPipeLoaded();

      if (window.Hands) {
        let handsInstance = new window.Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        handsInstance.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        window.__mpHandsInstance = handsInstance;
        handsInstance.onResults(onHandsResults);

        if (window.Camera && videoRef.current) {
          const camera = new window.Camera(videoRef.current, {
            onFrame: async () => {
              if (videoRef.current && window.__mpHandsInstance) {
                await window.__mpHandsInstance.send({ image: videoRef.current });
              }
            },
            width: 1280,
            height: 720
          });
          camera.start();
        }
      }
    } catch (err) {
      console.warn('Webcam initialization notice:', err);
      setHasCamera(false);
      setCameraError('Camera blocked or denied. Click "Enable Camera" or tap Snap Photo below.');
    }
  };

  useEffect(() => {
    startWebcam();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const onHandsResults = (results) => {
    if (!overlayCanvasRef.current || !videoRef.current) return;

    const canvas = overlayCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const w = (canvas.width = videoRef.current.videoWidth || videoRef.current.clientWidth || 640);
    const h = (canvas.height = videoRef.current.videoHeight || videoRef.current.clientHeight || 480);

    ctx.clearRect(0, 0, w, h);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      drawHandSkeleton(ctx, landmarks, w, h);

      const gesture = classifyGesture(landmarks);
      setCurrentGesture(gesture);

      if (gesture.action !== 'NONE' && !cooldownRef.current && !isCountingDownRef.current) {
        if (activeGestureNameRef.current === gesture.name) {
          gestureHoldCountRef.current += 1;
        } else {
          activeGestureNameRef.current = gesture.name;
          gestureHoldCountRef.current = 1;
        }

        const requiredFrames = gesture.name === 'PEACE' ? 4 : gesture.name === 'OPEN_PALM' ? 3 : 5;
        const progress = Math.min(100, Math.round((gestureHoldCountRef.current / requiredFrames) * 100));
        setGestureProgress(progress);

        if (gestureHoldCountRef.current >= requiredFrames) {
          cooldownRef.current = true;
          setGestureProgress(0);
          handleTriggerAction(gesture);

          const cooldownMs = gesture.name === 'OPEN_PALM' ? 800 : 2000;
          setTimeout(() => {
            cooldownRef.current = false;
            gestureHoldCountRef.current = 0;
            activeGestureNameRef.current = null;
          }, cooldownMs);
        }
      } else if (!cooldownRef.current) {
        gestureHoldCountRef.current = 0;
        activeGestureNameRef.current = null;
        setGestureProgress(0);
      }
    } else {
      setCurrentGesture({ name: 'NO_HAND', icon: '🖐️', label: 'Wave Hand or Tap Snap', action: 'NONE' });
      setGestureProgress(0);
    }
  };

  const handleTriggerAction = (gesture) => {
    soundFx.playGestureSound();

    if (gesture.action === 'SNAP_PHOTO') {
      triggerPhotoSequence(gesture.name);
    } else if (gesture.action === 'NEXT_FILTER') {
      if (onGestureAction) onGestureAction('NEXT_FILTER');

      const currentIdx = FILTER_LIST.findIndex((f) => f.id === selectedFilterRef.current);
      const nextFilterObj = FILTER_LIST[(currentIdx + 1) % FILTER_LIST.length];
      if (nextFilterObj) {
        setFilterToast(`${nextFilterObj.icon} ${nextFilterObj.name}`);
        setTimeout(() => setFilterToast(null), 1500);
      }
    } else if (onGestureAction) {
      onGestureAction(gesture.action);
    }
  };

  const triggerPhotoSequence = (gestureName = 'PEACE') => {
    if (isCountingDownRef.current || capturedCountRef.current >= maxShots) return;
    setIsCountingDown(true);

    let count = 3;
    setCountdown(count);
    soundFx.playCountdownBeep(false);

    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        soundFx.playCountdownBeep(false);
      } else {
        clearInterval(interval);
        setCountdown('📸');
        soundFx.playCountdownBeep(true);
        executeSnapshot(gestureName);

        setTimeout(() => {
          setCountdown(null);
          setIsCountingDown(false);
        }, 500);
      }
    }, 850);
  };

  const executeSnapshot = (gestureName = 'PEACE') => {
    soundFx.playShutterSound();
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 200);

    const canvas = document.createElement('canvas');
    const width = 600;
    const height = 600;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const video = videoRef.current;
    const hasLiveStream = video && video.srcObject && video.srcObject.active;
    const vw = video && video.videoWidth > 0 ? video.videoWidth : video ? video.clientWidth : 0;
    const vh = video && video.videoHeight > 0 ? video.videoHeight : video ? video.clientHeight : 0;

    const activeFilter = selectedFilterRef.current;
    const currentCssFilter = getCSSFilter(activeFilter);

    if (hasLiveStream || (video && (vw > 0 || video.readyState >= 2))) {
      const minDim = Math.min(vw || 640, vh || 480);
      const sx = ((vw || 640) - minDim) / 2;
      const sy = ((vh || 480) - minDim) / 2;

      ctx.save();
      ctx.translate(width, 0);
      ctx.scale(-1, 1);

      if (currentCssFilter && currentCssFilter !== 'none') {
        ctx.filter = currentCssFilter;
      }

      ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, width, height);
      ctx.restore();
    } else {
      drawProceduralPhoto(ctx, width, height, capturedCountRef.current + 1);
      applyAIFilter(canvas, activeFilter);
    }

    const dataUrl = canvas.toDataURL('image/png');
    const caption = generateAICaption(gestureName, capturedCountRef.current + 1);

    onShotCaptured({
      id: Date.now(),
      dataUrl,
      caption,
      gestureName
    });
  };

  const drawProceduralPhoto = (ctx, width, height, shotIndex) => {
    const colorPairs = [
      ['#8b5cf6', '#ec4899'],
      ['#06b6d4', '#3b82f6'],
      ['#f59e0b', '#ef4444'],
      ['#10b981', '#6366f1']
    ];
    const pair = colorPairs[(shotIndex - 1) % colorPairs.length];

    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, pair[0]);
    grad.addColorStop(1, pair[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 170, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = '110px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const emojis = ['✌️', '🖐️', '🫰', '👍'];
    ctx.fillText(emojis[(shotIndex - 1) % emojis.length], width / 2, height / 2);
  };

  const liveCssFilter = getCSSFilter(selectedFilter);

  return (
    <div className="camera-section">
      <div className="camera-preview-box">
        {/* Flash Effect */}
        <div className={`camera-flash ${flashActive ? 'active' : ''}`} />

        {/* Gesture Indicator Tag with Progress Ring */}
        <div className="gesture-indicator-tag">
          <div className="gesture-icon-bubble" style={{ position: 'relative' }}>
            <span>{currentGesture.icon}</span>
            {gestureProgress > 0 && (
              <div
                style={{
                  position: 'absolute',
                  inset: -2,
                  borderRadius: '50%',
                  border: '3px solid var(--accent-cyan)',
                  clipPath: `inset(0 0 ${100 - gestureProgress}% 0)`
                }}
              />
            )}
          </div>
          <div className="gesture-text-box">
            <span className="gesture-label">Gesture Detector</span>
            <span className="gesture-name">{currentGesture.label}</span>
          </div>
        </div>

        {/* Toast Alert for Filter Switch */}
        {filterToast && (
          <div
            style={{
              position: 'absolute',
              bottom: '1rem',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(139, 92, 246, 0.9)',
              color: '#fff',
              padding: '0.5rem 1.2rem',
              borderRadius: '20px',
              fontWeight: 800,
              fontSize: '0.9rem',
              backdropFilter: 'blur(8px)',
              zIndex: 35,
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Wand2 size={16} />
            <span>{`Filter: ${filterToast}`}</span>
          </div>
        )}

        {/* Countdown Overlay */}
        {countdown !== null && (
          <div className="countdown-overlay">
            <div className="countdown-num">{countdown}</div>
          </div>
        )}

        {/* Live Video Element */}
        <video
          ref={videoRef}
          className="camera-video mirrored"
          playsInline
          autoPlay
          muted
          style={{
            display: 'block',
            filter: liveCssFilter,
            transition: 'filter 0.3s ease'
          }}
        />

        {/* Overlay Canvas for Hand Skeleton */}
        <canvas
          ref={overlayCanvasRef}
          className="camera-canvas mirrored"
          style={{ display: 'block' }}
        />

        {/* Camera Permission Request Banner */}
        {!hasCamera && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
              textAlign: 'center',
              background: 'rgba(9, 13, 22, 0.85)',
              backdropFilter: 'blur(8px)',
              zIndex: 35
            }}
          >
            <Camera size={44} color="#8b5cf6" style={{ marginBottom: '0.8rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              Allow Camera Access
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '320px', marginBottom: '1rem' }}>
              Click below to grant camera access and capture real selfie photos with hand gestures!
            </p>
            <button className="btn-primary" onClick={() => window.location.reload()}>
              <Video size={18} />
              <span>Enable Camera</span>
            </button>
          </div>
        )}
      </div>

      {/* Snap Action Button */}
      <div className="camera-controls glass-panel">
        <button
          className="btn-primary"
          onClick={() => triggerPhotoSequence('PEACE')}
          disabled={isCountingDown || capturedShots.length >= maxShots}
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '1rem 1.5rem',
            fontSize: '1.1rem',
            opacity: capturedShots.length >= maxShots ? 0.5 : 1
          }}
        >
          <Zap size={22} />
          <span>
            {capturedShots.length >= maxShots
              ? 'Strip Completed! (Click Turn into Puzzle)'
              : '📸 SNAP PHOTO (Or Hold ✌️)'}
          </span>
        </button>
      </div>
    </div>
  );
}
