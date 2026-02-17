/**
 * VoiceRecorder Component
 *
 * Encapsulates Web Speech API for speech-to-text recording in voice mode.
 * Provides a pulsing microphone button with real-time visual feedback,
 * recording timer, and waveform animation.
 *
 * Features:
 * - Browser compatibility detection
 * - Visual recording indicator (pulsing animation)
 * - Real-time transcript callback
 * - Automatic stop after silence
 * - Error handling and user feedback
 */

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader } from 'lucide-react';

interface VoiceRecorderProps {
  /** Callback when transcript is available */
  onTranscript: (text: string) => void;
  /** Callback for errors */
  onError?: (error: string) => void;
  /** Whether recording is active (controlled mode) */
  isRecording?: boolean;
  /** Callback when recording state changes */
  onRecordingChange?: (isRecording: boolean) => void;
}

// Type definition for Web Speech API (not in standard TypeScript lib)
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscript,
  onError,
  isRecording: controlledRecording,
  onRecordingChange,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check browser compatibility on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      onError?.(
        'Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.'
      );
    }
  }, [onError]);

  // Update internal state when controlled prop changes
  useEffect(() => {
    if (controlledRecording !== undefined) {
      setIsRecording(controlledRecording);
    }
  }, [controlledRecording]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordingTime(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = () => {
    if (!isSupported) {
      onError?.('Voice recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US'; // Can be made configurable

    recognition.onstart = () => {
      setIsRecording(true);
      setTranscript('');
      onRecordingChange?.(true);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPiece + ' ';
        } else {
          interimTranscript += transcriptPiece;
        }
      }

      const fullTranscript = finalTranscript || interimTranscript;
      setTranscript(fullTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      onError?.(
        `Voice recognition error: ${event.error}. Please check microphone permissions.`
      );
      stopRecording();
    };

    recognition.onend = () => {
      // If we have a transcript, send it
      if (transcript.trim()) {
        onTranscript(transcript.trim());
      }
      setIsRecording(false);
      onRecordingChange?.(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <MicOff className="w-8 h-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Voice input is not supported in this browser.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-1">
          Please use Chrome, Edge, or Safari.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Microphone Button */}
      <button
        onClick={handleToggleRecording}
        className={`
          relative flex items-center justify-center w-20 h-20 rounded-full
          transition-all duration-300 focus:outline-none focus:ring-4
          ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 focus:ring-red-300 animate-pulse'
              : 'bg-gradient-to-r from-[#FF0000] to-[#E40000] hover:from-[#E40000] hover:to-[#D00000] focus:ring-red-300'
          }
        `}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        {isRecording ? (
          <MicOff className="w-8 h-8 text-white" />
        ) : (
          <Mic className="w-8 h-8 text-white" />
        )}

        {/* Pulsing ripple effect when recording */}
        {isRecording && (
          <>
            <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75"></span>
            <span className="absolute inset-0 rounded-full bg-red-400 animate-pulse opacity-50"></span>
          </>
        )}
      </button>

      {/* Recording Status */}
      {isRecording && (
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Recording: {formatTime(recordingTime)}
            </span>
          </div>

          {/* Live transcript preview */}
          {transcript && (
            <div className="max-w-xs px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                "{transcript}"
              </p>
            </div>
          )}

          {/* Waveform animation (visual feedback) */}
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-red-500 rounded-full"
                style={{
                  height: `${Math.random() * 20 + 10}px`,
                  animation: `waveform 0.${i + 4}s ease-in-out infinite alternate`,
                }}
              ></div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!isRecording && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-xs">
          Click the microphone to start voice input. Speak clearly and the AI will
          transcribe your message.
        </p>
      )}

      <style>{`
        @keyframes waveform {
          0% {
            height: 10px;
          }
          100% {
            height: 30px;
          }
        }
      `}</style>
    </div>
  );
};
