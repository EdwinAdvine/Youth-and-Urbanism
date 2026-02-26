import React from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { Rocket } from 'lucide-react';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak?: number;
  compact?: boolean;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ currentStreak, longestStreak, compact = false }) => {
  const { borderRadius, useEmojis } = useAgeAdaptiveUI();

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 bg-orange-500/20 ${borderRadius}`}>
        <Rocket className="w-4 h-4 text-orange-400" />
        <span className="text-orange-400 font-bold text-sm">{currentStreak}</span>
        <span className="text-gray-400 dark:text-white/40 text-xs">day streak</span>
        {useEmojis && <span>🔥</span>}
      </div>
    );
  }

  return (
    <div className={`p-6 bg-gradient-to-br from-red-500/20 to-orange-500/20 ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
      <div className="flex items-center gap-3 mb-4">
        <Rocket className="w-8 h-8 text-orange-400" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Current Streak</h2>
      </div>
      <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
        {currentStreak} {useEmojis && '🔥'}
      </div>
      <p className="text-gray-600 dark:text-white/70">days in a row</p>
      {longestStreak !== undefined && (
        <p className="text-gray-500 dark:text-white/50 text-sm mt-2">Best: {longestStreak} days</p>
      )}
    </div>
  );
};

export default StreakDisplay;
