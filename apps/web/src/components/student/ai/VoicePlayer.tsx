import React, { useState } from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { Volume2, Pause } from 'lucide-react';

interface VoicePlayerProps {
  text: string;
}

const VoicePlayer: React.FC<VoicePlayerProps> = ({ text }) => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayback = () => {
    if ('speechSynthesis' in window) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    }
  };

  return (
    <button
      onClick={togglePlayback}
      className={`px-3 py-1.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-white/60 ${borderRadius} text-sm flex items-center gap-1`}
    >
      {isPlaying ? (
        <><Pause className="w-4 h-4" /> Stop</>
      ) : (
        <><Volume2 className="w-4 h-4" /> Read Aloud</>
      )}
    </button>
  );
};

export default VoicePlayer;
