import React, { useState } from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscript }) => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setIsProcessing(true);
      // Simulate STT processing
      setTimeout(() => {
        onTranscript('Sample transcribed text from voice recording');
        setIsProcessing(false);
      }, 1500);
    } else {
      setIsRecording(true);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={toggleRecording}
        disabled={isProcessing}
        className={`w-20 h-20 ${borderRadius} flex items-center justify-center transition-all ${
          isRecording
            ? 'bg-red-500 animate-pulse scale-110'
            : isProcessing
            ? 'bg-yellow-500/50'
            : 'bg-[#FF0000] hover:bg-[#FF0000]/80'
        }`}
      >
        {isProcessing ? (
          <Loader2 className="w-8 h-8 text-gray-900 dark:text-white animate-spin" />
        ) : isRecording ? (
          <MicOff className="w-8 h-8 text-gray-900 dark:text-white" />
        ) : (
          <Mic className="w-8 h-8 text-gray-900 dark:text-white" />
        )}
      </button>
      <span className="text-gray-500 dark:text-white/60 text-sm">
        {isProcessing ? 'Processing...' : isRecording ? 'Tap to stop' : 'Tap to speak'}
      </span>
      {isRecording && (
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-1 bg-red-400 rounded-full animate-pulse"
              style={{ height: `${12 + Math.random() * 20}px`, animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
