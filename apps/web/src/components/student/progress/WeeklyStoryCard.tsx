import React from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { BookOpen, TrendingUp, Award } from 'lucide-react';

interface WeeklyStoryCardProps {
  weekLabel: string;
  lessonsCompleted: number;
  quizzesPassed: number;
  xpEarned: number;
  summary: string;
}

const WeeklyStoryCard: React.FC<WeeklyStoryCardProps> = ({
  weekLabel, lessonsCompleted, quizzesPassed, xpEarned, summary,
}) => {
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
      <h3 className="text-gray-900 dark:text-white font-semibold mb-3">{weekLabel}</h3>
      <p className="text-gray-500 dark:text-white/60 text-sm mb-4">{summary}</p>
      <div className="grid grid-cols-3 gap-3">
        <div className={`p-3 bg-blue-500/10 ${borderRadius} text-center`}>
          <BookOpen className="w-4 h-4 text-blue-400 mx-auto mb-1" />
          <div className="text-gray-900 dark:text-white font-bold">{lessonsCompleted}</div>
          <div className="text-gray-400 dark:text-white/40 text-xs">Lessons</div>
        </div>
        <div className={`p-3 bg-green-500/10 ${borderRadius} text-center`}>
          <Award className="w-4 h-4 text-green-400 mx-auto mb-1" />
          <div className="text-gray-900 dark:text-white font-bold">{quizzesPassed}</div>
          <div className="text-gray-400 dark:text-white/40 text-xs">Quizzes</div>
        </div>
        <div className={`p-3 bg-yellow-500/10 ${borderRadius} text-center`}>
          <TrendingUp className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
          <div className="text-gray-900 dark:text-white font-bold">{xpEarned}</div>
          <div className="text-gray-400 dark:text-white/40 text-xs">XP</div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyStoryCard;
