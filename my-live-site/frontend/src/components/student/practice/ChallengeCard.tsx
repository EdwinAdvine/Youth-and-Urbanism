import React from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { Brain, Clock, Play } from 'lucide-react';

interface ChallengeCardProps {
  title: string;
  subject: string;
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  onStart: () => void;
}

const difficultyColors = {
  easy: 'bg-green-500/20 text-green-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  hard: 'bg-red-500/20 text-red-400',
};

const ChallengeCard: React.FC<ChallengeCardProps> = ({ title, subject, duration, difficulty, onStart }) => {
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20 transition-colors`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 bg-purple-500/20 ${borderRadius} flex items-center justify-center`}>
          <Brain className="w-5 h-5 text-purple-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-gray-900 dark:text-white font-semibold">{title}</h3>
          <p className="text-gray-400 dark:text-white/40 text-sm">{subject}</p>
        </div>
        <span className={`px-2 py-0.5 ${borderRadius} text-xs capitalize ${difficultyColors[difficulty]}`}>
          {difficulty}
        </span>
      </div>
      <div className="flex items-center justify-between mt-3">
        <span className="flex items-center gap-1 text-gray-500 dark:text-white/50 text-sm">
          <Clock className="w-3 h-3" /> {duration}
        </span>
        <button
          onClick={onStart}
          className={`px-4 py-1.5 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white text-sm ${borderRadius} flex items-center gap-1`}
        >
          <Play className="w-3 h-3" /> Start
        </button>
      </div>
    </div>
  );
};

export default ChallengeCard;
