/**
 * Dual-strategy lip-sync engine.
 *
 * Primary: WebSocket streaming from /ws/avatar-stream (viseme data from ElevenLabs).
 * Fallback: Client-side Web Audio API analyser (amplitude → approximate viseme).
 *
 * Drives ARKit blendshape morph targets on the 3D avatar.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAvatarStore } from '../store/avatarStore';
import avatarService from '../services/avatarService';
import type { AvatarStreamMessage, GestureAnnotation } from '../types/avatar';

interface LipSyncControls {
  /** Begin narrating the given text. Opens WS, streams audio + visemes. */
  startNarration: (
    text: string,
    gestureAnnotations?: GestureAnnotation[],
    token?: string
  ) => void;
  /** Stop narration and close WS. */
  stopNarration: () => void;
  /** Play audio from a URL with client-side lip-sync analysis. */
  playAudioWithSync: (audioUrl: string) => void;
  /** Whether the avatar is currently narrating. */
  isActive: boolean;
  /** Current viseme index (0-21, Oculus mapping). */
  currentViseme: number;
}

// Oculus viseme count
const VISEME_COUNT = 22;

export function useAvatarLipSync(): LipSyncControls {
  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>(0);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioChunksRef = useRef<string[]>([]);

  const [isActive, setIsActive] = useState(false);
  const [currentViseme, setCurrentViseme] = useState(0);

  const setStoreViseme = useAvatarStore((s) => s.setCurrentViseme);
  const setStoreSpeaking = useAvatarStore((s) => s.setIsAvatarSpeaking);
  const setStoreGesture = useAvatarStore((s) => s.setCurrentGesture);

  // Sync viseme to store
  useEffect(() => {
    setStoreViseme(currentViseme);
  }, [currentViseme, setStoreViseme]);

  /** Cleanup on unmount. */
  useEffect(() => {
    return () => {
      wsRef.current?.close();
      cancelAnimationFrame(rafRef.current);
      audioCtxRef.current?.close();
    };
  }, []);

  /* ── Primary: WebSocket streaming ─────────────────────────────── */

  const startNarration = useCallback(
    (
      text: string,
      gestureAnnotations: GestureAnnotation[] = [],
      token = ''
    ) => {
      // Cleanup previous
      wsRef.current?.close();
      audioChunksRef.current = [];

      const ws = avatarService.connectAvatarStream(token);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsActive(true);
        setStoreSpeaking(true);
        avatarService.sendNarration(ws, text, gestureAnnotations);
      };

      ws.onmessage = (event) => {
        const msg = avatarService.parseStreamMessage(event);
        handleStreamMessage(msg);
      };

      ws.onclose = () => {
        setIsActive(false);
        setStoreSpeaking(false);
        setCurrentViseme(0);
      };

      ws.onerror = () => {
        // Fallback: try playing audio directly if available
        setIsActive(false);
        setStoreSpeaking(false);
      };
    },
    [setStoreSpeaking]
  );

  const handleStreamMessage = useCallback(
    (msg: AvatarStreamMessage) => {
      switch (msg.type) {
        case 'audio_chunk':
          audioChunksRef.current.push(msg.data as string);
          break;

        case 'viseme':
          if (msg.data && typeof msg.data.viseme_id === 'number') {
            setCurrentViseme(msg.data.viseme_id % VISEME_COUNT);
          }
          break;

        case 'gesture':
        case 'gesture_timeline':
          if (msg.data) {
            // For single gestures
            if (typeof msg.data === 'object' && msg.data.gesture) {
              setStoreGesture(msg.data.gesture);
            }
          }
          break;

        case 'audio_url':
          // Fallback: full audio file URL
          if (typeof msg.data === 'string') {
            playAudioWithSync(msg.data);
          }
          break;

        case 'end':
          // Play accumulated audio chunks if any
          if (audioChunksRef.current.length > 0) {
            playBase64Audio(audioChunksRef.current);
            audioChunksRef.current = [];
          }
          setTimeout(() => {
            setCurrentViseme(0);
            setIsActive(false);
            setStoreSpeaking(false);
          }, 500);
          break;

        case 'error':
          setIsActive(false);
          setStoreSpeaking(false);
          break;
      }
    },
    [setStoreGesture, setStoreSpeaking]
  );

  /** Play base64-encoded audio chunks. */
  const playBase64Audio = useCallback((chunks: string[]) => {
    try {
      const combined = chunks.join('');
      const bytes = atob(combined);
      const arrayBuffer = new ArrayBuffer(bytes.length);
      const view = new Uint8Array(arrayBuffer);
      for (let i = 0; i < bytes.length; i++) {
        view[i] = bytes.charCodeAt(i);
      }
      const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      playAudioWithSync(url);
    } catch {
      /* ignore decode errors */
    }
  }, []);

  /* ── Fallback: client-side audio analysis ─────────────────────── */

  const playAudioWithSync = useCallback(
    (audioUrl: string) => {
      // Stop previous
      audioElementRef.current?.pause();
      cancelAnimationFrame(rafRef.current);

      const audio = new Audio(audioUrl);
      audioElementRef.current = audio;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;

      const source = ctx.createMediaElementSource(audio);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      source.connect(analyser);
      analyser.connect(ctx.destination);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        analyser.getByteFrequencyData(dataArray);
        // Map average amplitude to a viseme index
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const avg = sum / dataArray.length;

        // Simple mapping: silence → 0, low → 1 (aa), mid → 6 (oh), high → 10 (ee)
        let viseme = 0;
        if (avg > 10) viseme = 1;
        if (avg > 40) viseme = 6;
        if (avg > 80) viseme = 10;
        if (avg > 120) viseme = 14;

        setCurrentViseme(viseme);
        rafRef.current = requestAnimationFrame(tick);
      };

      audio.onplay = () => {
        setIsActive(true);
        setStoreSpeaking(true);
        ctx.resume();
        tick();
      };

      audio.onended = () => {
        cancelAnimationFrame(rafRef.current);
        setCurrentViseme(0);
        setIsActive(false);
        setStoreSpeaking(false);
      };

      audio.play().catch(() => {
        setIsActive(false);
        setStoreSpeaking(false);
      });
    },
    [setStoreSpeaking]
  );

  const stopNarration = useCallback(() => {
    wsRef.current?.close();
    audioElementRef.current?.pause();
    cancelAnimationFrame(rafRef.current);
    setCurrentViseme(0);
    setIsActive(false);
    setStoreSpeaking(false);
  }, [setStoreSpeaking]);

  return {
    startNarration,
    stopNarration,
    playAudioWithSync,
    isActive,
    currentViseme,
  };
}
