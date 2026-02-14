import React from 'react';
import { useStudentStore } from '../../store/studentStore';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Rocket, Trophy } from 'lucide-react';

const StreakPage: React.FC = () => {
  const { currentStreak, longestStreak } = useStudentStore();
  const { borderRadius, useEmojis } = useAgeAdaptiveUI();

  const streakHistory = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    completed: Math.random() > 0.3
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Your Learning Streak {useEmojis && '🔥'}
        </h1>
        <p className="text-gray-600 dark:text-white/70">Keep the momentum going!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-6 bg-gradient-to-br from-red-500/20 to-orange-500/20 ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
          <div className="flex items-center gap-3 mb-4">
            <Rocket className="w-8 h-8 text-orange-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Current Streak</h2>
          </div>
          <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">{currentStreak}</div>
          <p className="text-gray-600 dark:text-white/70">days in a row</p>
        </div>

        <div className={`p-6 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Best Streak</h2>
          </div>
          <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">{longestStreak}</div>
          <p className="text-gray-600 dark:text-white/70">days (personal record)</p>
        </div>
      </div>

      <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Last 30 Days</h2>
        <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
          {streakHistory.map((day, index) => (
            <div
              key={index}
              className={`aspect-square ${borderRadius} ${
                day.completed ? 'bg-green-500' : 'bg-gray-100 dark:bg-white/10'
              }`}
              title={day.date}
            />
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-white/60">
          <span>Less</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 dark:bg-white/10 rounded"></div>
            <div className="w-4 h-4 bg-green-500/30 rounded"></div>
            <div className="w-4 h-4 bg-green-500 rounded"></div>
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default StreakPage;
