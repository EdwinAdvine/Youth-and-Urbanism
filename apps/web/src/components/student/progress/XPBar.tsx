import React from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { Sparkles } from 'lucide-react';

interface XPBarProps {
  currentXP: number;
  nextLevelXP: number;
  level: number;
}

const XPBar: React.FC<XPBarProps> = ({ currentXP, nextLevelXP, level }) => {
  const { borderRadius } = useAgeAdaptiveUI();
  const progress = Math.min((currentXP / nextLevelXP) * 100, 100);

  return (
    <div className={`px-4 py-3 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="text-gray-900 dark:text-white font-bold text-sm">Level {level}</span>
        </div>
        <span className="text-gray-400 dark:text-white/40 text-xs">{currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP</span>
      </div>
      <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default XPBar;
