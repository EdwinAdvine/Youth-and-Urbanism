import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface SLAIndicatorProps {
  deadline: string | null;
  totalMinutes?: number;
  compact?: boolean;
}

interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isBreached: boolean;
}

const calculateTimeRemaining = (deadline: string | null): TimeRemaining => {
  if (!deadline) {
    return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isBreached: true };
  }

  const now = new Date().getTime();
  const deadlineTime = new Date(deadline).getTime();
  const diff = deadlineTime - now;

  if (diff <= 0) {
    const absDiff = Math.abs(diff) / 1000;
    return {
      hours: Math.floor(absDiff / 3600),
      minutes: Math.floor((absDiff % 3600) / 60),
      seconds: Math.floor(absDiff % 60),
      totalSeconds: -absDiff,
      isBreached: true,
    };
  }

  const totalSeconds = diff / 1000;
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: Math.floor(totalSeconds % 60),
    totalSeconds,
    isBreached: false,
  };
};

const SLAIndicator: React.FC<SLAIndicatorProps> = ({
  deadline,
  totalMinutes = 240,
  compact = false,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(
    calculateTimeRemaining(deadline)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(deadline));
    }, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  const totalSeconds = totalMinutes * 60;
  const elapsedSeconds = totalSeconds - timeRemaining.totalSeconds;
  const percentUsed = totalSeconds > 0 ? Math.min(100, Math.max(0, (elapsedSeconds / totalSeconds) * 100)) : 100;
  const percentRemaining = 100 - percentUsed;

  const getStatusColor = (): { text: string; bg: string; bar: string; dot: string } => {
    if (timeRemaining.isBreached) {
      return {
        text: 'text-red-400',
        bg: 'bg-red-500/10',
        bar: 'bg-red-500',
        dot: 'bg-red-500',
      };
    }
    if (percentRemaining > 50) {
      return {
        text: 'text-green-400',
        bg: 'bg-green-500/10',
        bar: 'bg-green-500',
        dot: 'bg-green-500',
      };
    }
    if (percentRemaining > 25) {
      return {
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        bar: 'bg-amber-500',
        dot: 'bg-amber-500',
      };
    }
    return {
      text: 'text-red-400',
      bg: 'bg-red-500/10',
      bar: 'bg-red-500',
      dot: 'bg-red-500',
    };
  };

  const colors = getStatusColor();

  const formatTime = (tr: TimeRemaining): string => {
    const h = String(tr.hours).padStart(2, '0');
    const m = String(tr.minutes).padStart(2, '0');
    const s = String(tr.seconds).padStart(2, '0');
    if (tr.hours > 0) return `${h}:${m}:${s}`;
    return `${m}:${s}`;
  };

  // Compact mode: just time and dot
  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5">
        <span
          className={`w-2 h-2 rounded-full ${colors.dot} ${
            timeRemaining.isBreached ? 'animate-pulse' : ''
          }`}
        />
        <span className={`text-xs font-mono tabular-nums ${colors.text}`}>
          {timeRemaining.isBreached ? '-' : ''}
          {formatTime(timeRemaining)}
        </span>
      </div>
    );
  }

  // Full mode
  return (
    <div className={`rounded-lg border overflow-hidden ${
      timeRemaining.isBreached
        ? 'bg-red-500/5 border-red-500/20'
        : 'bg-[#181C1F] border-[#22272B]'
    }`}>
      <div className="px-4 py-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            {timeRemaining.isBreached ? (
              <AlertTriangle className={`w-3.5 h-3.5 ${colors.text} animate-pulse`} />
            ) : (
              <Clock className={`w-3.5 h-3.5 ${colors.text}`} />
            )}
            <span className="text-xs font-medium text-white/60">SLA Timer</span>
          </div>
          {timeRemaining.isBreached && (
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider animate-pulse">
              Breached
            </span>
          )}
        </div>

        {/* Countdown */}
        <div className={`text-2xl font-mono font-bold tabular-nums ${colors.text} mb-2`}>
          {timeRemaining.isBreached ? '-' : ''}
          {formatTime(timeRemaining)}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-[#22272B] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${colors.bar} ${
              timeRemaining.isBreached ? 'animate-pulse' : ''
            }`}
            style={{ width: `${Math.min(100, percentUsed)}%` }}
          />
        </div>

        {/* Labels */}
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] text-white/30">0m</span>
          <span className="text-[10px] text-white/30">{totalMinutes}m total</span>
        </div>
      </div>
    </div>
  );
};

export default SLAIndicator;
