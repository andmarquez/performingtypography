import { useCallback, useEffect, useRef, useState } from 'react';
import {
  applyBeatStyle,
  BEAT_COOLDOWN_MS,
  BEAT_STYLES,
  BASS_HISTORY_SIZE,
} from '../lib/beatStyles.js';
import { analyzeFrequencyBands, average, clamp } from '../lib/audioAnalysis.js';

export function useBeatAudio(frameRef) {
  const [hasStarted, setHasStarted] = useState(false);
  const [status, setStatus] = useState('Ready for camera, mic, and motion.');
  const [error, setError] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [styleIndex, setStyleIndex] = useState(0);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameRef = useRef(null);
  const smoothedAudioRef = useRef(0);
  const smoothedBassRef = useRef(0);
  const smoothedMidRef = useRef(0);
  const smoothedHighRef = useRef(0);
  const beatFlashRef = useRef(0);
  const bassHistoryRef = useRef([]);
  const lastBeatTimeRef = useRef(0);
  const styleIndexRef = useRef(0);
  const lastUiAudioUpdateRef = useRef(0);
  const onBeatRef = useRef(null);

  const currentStyle = BEAT_STYLES[styleIndex];

  const updateFrameVariable = useCallback((name, value) => {
    if (frameRef.current) {
      frameRef.current.style.setProperty(name, value);
    }
  }, [frameRef]);

  const analyzeAudio = useCallback(() => {
    const analyser = analyserRef.current;
    const audioContext = audioContextRef.current;

    if (analyser && audioContext) {
      const frequencyData = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(frequencyData);

      const { bass, mid, high } = analyzeFrequencyBands(
        frequencyData,
        audioContext.sampleRate,
        analyser.fftSize,
      );

      const boostedBass = clamp(bass * 2.4, 0, 1);
      const boostedMid = clamp(mid * 2.1, 0, 1);
      const boostedHigh = clamp(high * 2.5, 0, 1);
      const combined = clamp(boostedBass * 0.55 + boostedMid * 0.3 + boostedHigh * 0.15, 0, 1);

      smoothedBassRef.current = smoothedBassRef.current * 0.48 + boostedBass * 0.52;
      smoothedMidRef.current = smoothedMidRef.current * 0.58 + boostedMid * 0.42;
      smoothedHighRef.current = smoothedHighRef.current * 0.64 + boostedHigh * 0.36;
      smoothedAudioRef.current = smoothedAudioRef.current * 0.55 + combined * 0.45;

      const bassHistory = bassHistoryRef.current;
      bassHistory.push(smoothedBassRef.current);
      if (bassHistory.length > BASS_HISTORY_SIZE) {
        bassHistory.shift();
      }

      const bassAverage = average(bassHistory);
      const now = performance.now();
      const beatThreshold = bassAverage * 1.16 + 0.055;
      const snareHit = smoothedMidRef.current > bassAverage * 1.35 + 0.12 && smoothedMidRef.current > 0.18;
      const isBeat =
        bassHistory.length > 8 &&
        now - lastBeatTimeRef.current > BEAT_COOLDOWN_MS &&
        ((smoothedBassRef.current > beatThreshold && smoothedBassRef.current > 0.1) ||
          (snareHit && smoothedBassRef.current > 0.08));

      if (isBeat) {
        lastBeatTimeRef.current = now;
        beatFlashRef.current = 1;
        styleIndexRef.current = (styleIndexRef.current + 1) % BEAT_STYLES.length;
        applyBeatStyle(BEAT_STYLES[styleIndexRef.current], updateFrameVariable);
        setStyleIndex(styleIndexRef.current);
        onBeatRef.current?.();
      } else {
        beatFlashRef.current *= 0.68;
      }

      updateFrameVariable('--audio', smoothedAudioRef.current.toFixed(3));
      updateFrameVariable('--bass', smoothedBassRef.current.toFixed(3));
      updateFrameVariable('--mid', smoothedMidRef.current.toFixed(3));
      updateFrameVariable('--high', smoothedHighRef.current.toFixed(3));
      updateFrameVariable('--beat-flash', beatFlashRef.current.toFixed(3));
      frameRef.current?.classList.toggle('is-beat-hit', beatFlashRef.current > 0.28);

      if (now - lastUiAudioUpdateRef.current > 90) {
        lastUiAudioUpdateRef.current = now;
        setAudioLevel(smoothedAudioRef.current);
      }
    }

    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  }, [frameRef, updateFrameVariable]);

  const requestMotionAccess = useCallback(async () => {
    try {
      if (
        typeof DeviceMotionEvent !== 'undefined' &&
        typeof DeviceMotionEvent.requestPermission === 'function'
      ) {
        await DeviceMotionEvent.requestPermission();
      }

      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function'
      ) {
        await DeviceOrientationEvent.requestPermission();
      }

      return true;
    } catch {
      return false;
    }
  }, []);

  const startExperience = useCallback(async () => {
    setError('');
    setStatus('Requesting camera, microphone, and motion access...');

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('This browser does not support camera and microphone access.');
      setStatus('Use a modern mobile browser over HTTPS or localhost.');
      return null;
    }

    try {
      await requestMotionAccess();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1080 },
          height: { ideal: 1920 },
        },
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        const audioContext = new AudioContextClass({ latencyHint: 'interactive' });
        const audioTracks = stream.getAudioTracks();
        const audioStream = new MediaStream(audioTracks);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.48;
        analyser.minDecibels = -82;
        analyser.maxDecibels = -8;

        sourceRef.current = audioContext.createMediaStreamSource(audioStream);
        sourceRef.current.connect(analyser);
        analyserRef.current = analyser;
        audioContextRef.current = audioContext;

        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        animationFrameRef.current = requestAnimationFrame(analyzeAudio);
      }

      applyBeatStyle(BEAT_STYLES[0], updateFrameVariable);
      styleIndexRef.current = 0;
      bassHistoryRef.current = [];
      lastBeatTimeRef.current = 0;
      beatFlashRef.current = 0;

      setHasStarted(true);
      setStatus('Live.');
      return stream;
    } catch (startError) {
      setError(startError?.message || 'Permissions were blocked or unavailable.');
      setStatus('Camera and microphone permissions are required to start.');
      return null;
    }
  }, [analyzeAudio, requestMotionAccess, updateFrameVariable]);

  const setOnBeat = useCallback((callback) => {
    onBeatRef.current = callback;
  }, []);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      sourceRef.current?.disconnect();
      audioContextRef.current?.close();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return {
    hasStarted,
    status,
    error,
    setStatus,
    setError,
    audioLevel,
    styleIndex,
    currentStyle,
    videoRef,
    streamRef,
    startExperience,
    updateFrameVariable,
    setOnBeat,
  };
}

export function getGlyphVector(index, total) {
  const angle = (index / Math.max(total, 1)) * Math.PI * 2 + (index % 3) * 0.6;
  const distance = 90 + (index % 5) * 24;
  const rotation = Math.sin(index * 1.7) * 42;

  return {
    x: `${Math.cos(angle) * distance}px`,
    y: `${Math.sin(angle) * distance}px`,
    r: `${rotation}deg`,
    orbitR: `${rotation * 0.2}deg`,
  };
}
