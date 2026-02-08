import { useState, useRef } from 'react';

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  // Load available voices
  const loadVoices = () => {
    voicesRef.current = window.speechSynthesis.getVoices();
  };

  // Initialize voices
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  const speak = (text: string, voiceIndex: number = 0) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }

    // Stop any existing speech
    window.speechSynthesis.cancel();

    utteranceRef.current = new SpeechSynthesisUtterance(text);
    
    // Set voice if available
    if (voicesRef.current.length > 0) {
      utteranceRef.current.voice = voicesRef.current[voiceIndex];
    }
    
    // Set speech parameters
    utteranceRef.current.rate = 0.9; // Slightly slower for kids
    utteranceRef.current.pitch = 1.2; // Higher pitch for friendly tone
    utteranceRef.current.volume = 1.0;

    // Event handlers
    utteranceRef.current.onstart = () => {
      setIsSpeaking(true);
    };

    utteranceRef.current.onend = () => {
      setIsSpeaking(false);
    };

    utteranceRef.current.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utteranceRef.current);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const pauseSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
  };

  const resumeSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.resume();
    }
  };

  return {
    isSpeaking,
    speak,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    voices: voicesRef.current,
  };
};