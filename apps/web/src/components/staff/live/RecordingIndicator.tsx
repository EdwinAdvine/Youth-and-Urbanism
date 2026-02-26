import React, { useState, useEffect } from 'react';
import { Circle, Square } from 'lucide-react';

interface RecordingIndicatorProps {
  isRecording: boolean;
  duration?: number;
  onToggle: () => void;
}

const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const pad = (n: number) => String(n).padStart(2, '0');

  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
};

const RecordingIndicator: React.FC<RecordingIndicatorProps> = ({
  isRecording,
  duration = 0,
  onToggle,
}) => {
  const [elapsed, setElapsed] = useState(duration);

  useEffect(() => {
    setElapsed(duration);
  }, [duration]);

  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

  if (isRecording) {
    return (
      <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#E40000]/10 border border-[#E40000]/30">
        {/* Pulsing red dot */}
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E40000] opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E40000]" />
        </span>

        {/* REC label */}
        <span className="text-xs font-bold text-[#E40000] uppercase tracking-wider">REC</span>

        {/* Duration */}
        <span className="text-sm font-mono tabular-nums text-gray-700 dark:text-white/80">{formatDuration(elapsed)}</span>

        {/* Stop button */}
        <button
          onClick={onToggle}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#E40000] text-gray-900 dark:text-white text-xs font-medium hover:bg-[#E40000]/90 transition-colors ml-1"
        >
          <Square className="w-3 h-3 fill-current" />
          Stop
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onToggle}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#333] transition-colors"
    >
      <Circle className="w-3.5 h-3.5 text-[#E40000]" />
      <span className="text-sm font-medium">Start Recording</span>
    </button>
  );
};

export default RecordingIndicator;
