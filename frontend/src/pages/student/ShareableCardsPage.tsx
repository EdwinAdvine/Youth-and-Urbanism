import React, { useState } from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Trophy } from 'lucide-react';
import ShareableCard from '../../components/student/progress/ShareableCard';

const achievements = [
  { id: '1', title: 'Quiz Master', achievement: 'Scored 100% on 5 quizzes in a row', date: 'Feb 2026' },
  { id: '2', title: '30-Day Streak', achievement: 'Logged in and learned for 30 consecutive days', date: 'Jan 2026' },
  { id: '3', title: 'Top of the Class', achievement: 'Ranked #1 on the weekly leaderboard', date: 'Jan 2026' },
];

const ShareableCardsPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [selected, setSelected] = useState(achievements[0]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Share Your Achievements</h1>
        <p className="text-gray-600 dark:text-white/70">Create and share achievement cards with friends and family</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-gray-900 dark:text-white font-medium mb-3">Select Achievement</h3>
          <div className="space-y-2">
            {achievements.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelected(a)}
                className={`w-full p-4 ${borderRadius} text-left flex items-center gap-3 transition-colors ${
                  selected.id === a.id ? 'bg-[#FF0000]/10 border border-[#FF0000]/30' : 'bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20'
                }`}
              >
                <Trophy className={`w-5 h-5 ${selected.id === a.id ? 'text-yellow-400' : 'text-gray-400 dark:text-white/40'}`} />
                <div>
                  <h4 className="text-gray-900 dark:text-white font-medium text-sm">{a.title}</h4>
                  <p className="text-gray-400 dark:text-white/40 text-xs">{a.achievement}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-gray-900 dark:text-white font-medium mb-3">Preview</h3>
          <ShareableCard
            title={selected.title}
            achievement={selected.achievement}
            studentName="Kevin Ochieng"
            date={selected.date}
          />
        </div>
      </div>
    </div>
  );
};

export default ShareableCardsPage;
