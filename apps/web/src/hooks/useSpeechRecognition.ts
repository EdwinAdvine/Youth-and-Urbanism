/**
 * useSpeechRecognition
 *
 * Reliable Web Speech API hook for speech-to-text.
 * Supports English (en-US) and Kiswahili (sw-KE) — auto-detected.
 *
 * Design:
 * - Uses refs for all callbacks to avoid stale-closure bugs.
 * - Restarts recognition automatically on `onend` if the user is still
 *   "recording" — this works around the browser's silence timeout which
 *   stops continuous recognition after ~10–30 seconds.
 * - `onFinalTranscript` is called for each final utterance; the caller
 *   (ChatInput) appends the text to the message field.
 *
 * Returns:
 *   isRecording       — whether mic is active
 *   isSupported       — false if the browser lacks SpeechRecognition
 *   interimTranscript — live partial transcript while speaking
 *   toggle            — start/stop recording
 *   reset             — stop and clear transcript
 */

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseSpeechRecognitionOptions {
  onFinalTranscript: (text: string) => void;
  onError?: (error: string) => void;
}

interface UseSpeechRecognitionResult {
  isRecording: boolean;
  isSupported: boolean;
  interimTranscript: string;
  toggle: () => void;
  reset: () => void;
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions
): UseSpeechRecognitionResult {
  const [isRecording, setIsRecording] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);

  // Refs so handlers always use the latest values without needing re-creation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef(false);          // mirrors isRecording without stale closure
  const onFinalRef = useRef(options.onFinalTranscript);
  const onErrorRef = useRef(options.onError);

  useEffect(() => { onFinalRef.current = options.onFinalTranscript; }, [options.onFinalTranscript]);
  useEffect(() => { onErrorRef.current = options.onError; }, [options.onError]);

  // Browser compatibility check
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (!w.SpeechRecognition && !w.webkitSpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  // Detect language: Kiswahili vs English based on browser locale
  const getLang = (): string => {
    try {
      const lang = navigator.language || navigator.languages?.[0] || 'en-US';
      if (lang.startsWith('sw')) return 'sw-KE';
    } catch (_) { /* ignore */ }
    return 'en-US';
  };

  /** Create and start a fresh SpeechRecognition instance */
  const createAndStart = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec: any = new SR();
    rec.lang = getLang();
    rec.continuous = true;        // keep listening while active
    rec.interimResults = true;    // stream partial results

    rec.onstart = () => {
      setIsRecording(true);
      setInterimTranscript('');
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const piece: string = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          onFinalRef.current(piece.trim());
        } else {
          interim += piece;
        }
      }
      setInterimTranscript(interim);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (event: any) => {
      // 'no-speech' is non-fatal: the browser timed out waiting for speech.
      // Restart if we're still supposed to be recording.
      if (event.error === 'no-speech') {
        if (isRecordingRef.current) {
          // Will restart via onend
        }
        return;
      }
      // Abort-related errors when we stop intentionally — ignore
      if (event.error === 'aborted') return;

      onErrorRef.current?.(`Voice recognition error: ${event.error}. Check microphone permissions.`);
      isRecordingRef.current = false;
      setIsRecording(false);
      setInterimTranscript('');
      recognitionRef.current = null;
    };

    rec.onend = () => {
      setInterimTranscript('');
      // Auto-restart if user hasn't manually stopped
      if (isRecordingRef.current) {
        try {
          rec.start();
          return;
        } catch (_) {
          // If restart fails (e.g. mic permission revoked), stop cleanly
        }
      }
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch (e) {
      onErrorRef.current?.('Could not start voice recognition. Check microphone permissions.');
      isRecordingRef.current = false;
      setIsRecording(false);
      recognitionRef.current = null;
    }
  }, []);

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) { /* ignore */ }
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setInterimTranscript('');
  }, []);

  const startRecording = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (!w.SpeechRecognition && !w.webkitSpeechRecognition) {
      onErrorRef.current?.('Voice recognition is not supported. Use Chrome, Edge, or Safari.');
      return;
    }
    isRecordingRef.current = true;
    createAndStart();
  }, [createAndStart]);

  const toggle = useCallback(() => {
    if (isRecordingRef.current) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [startRecording, stopRecording]);

  const reset = useCallback(() => {
    stopRecording();
  }, [stopRecording]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) { /* ignore */ }
        recognitionRef.current = null;
      }
    };
  }, []);

  return { isRecording, isSupported, interimTranscript, toggle, reset };
}
