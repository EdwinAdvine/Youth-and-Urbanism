import React from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Trophy, Share2, Sparkles, Clock } from 'lucide-react';

const recentBadges = [
  { id: '1', name: 'Night Owl', icon: '🦉', rarity: 'Rare', earnedAt: '2 days ago', xpBonus: 50, description: 'Complete a lesson after 8 PM' },
  { id: '2', name: 'Social Butterfly', icon: '🦋', earnedAt: '5 days ago', rarity: 'Common', xpBonus: 25, description: 'Make 5 friends' },
  { id: '3', name: 'Quiz Master', icon: '🧠', earnedAt: '1 week ago', rarity: 'Rare', xpBonus: 50, description: 'Score 100% on a quiz' },
  { id: '4', name: 'Week Warrior', icon: '🔥', earnedAt: '2 weeks ago', rarity: 'Common', xpBonus: 25, description: 'Maintain a 7-day streak' },
  { id: '5', name: 'First Steps', icon: '🎯', earnedAt: '1 month ago', rarity: 'Common', xpBonus: 25, description: 'Complete your first lesson' },
];

const rarityColors: Record<string, string> = { Common: 'text-gray-400', Rare: 'text-blue-400', Epic: 'text-purple-400', Legendary: 'text-yellow-400' };

const RecentUnlocksPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-yellow-400" /> Recent Unlocks
        </h1>
        <p className="text-gray-600 dark:text-white/70">Your latest achievements and badges</p>
      </div>

      <div className="space-y-4">
        {recentBadges.map((badge) => (
          <div key={badge.id} className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] hover:border-yellow-500/20 transition-colors`}>
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 bg-yellow-500/10 ${borderRadius} flex items-center justify-center text-3xl border border-yellow-500/20`}>
                {badge.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-gray-900 dark:text-white font-semibold text-lg">{badge.name}</h3>
                  <span className={`text-xs ${rarityColors[badge.rarity]}`}>{badge.rarity}</span>
                </div>
                <p className="text-gray-500 dark:text-white/60 text-sm">{badge.description}</p>
                <div className="flex items-center gap-3 mt-2 text-sm">
                  <span className="text-yellow-400">+{badge.xpBonus} XP</span>
                  <span className="flex items-center gap-1 text-gray-400 dark:text-white/40"><Clock className="w-3 h-3" /> {badge.earnedAt}</span>
                </div>
              </div>
              <button className={`px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-white/60 ${borderRadius} flex items-center gap-2 text-sm`}>
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Next Badge Hint */}
      <div className={`p-4 bg-purple-500/10 ${borderRadius} border border-purple-500/20`}>
        <div className="flex items-start gap-3">
          <Trophy className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-gray-900 dark:text-white font-medium text-sm">Next Badge: Month Champion 👑</p>
            <p className="text-gray-500 dark:text-white/60 text-sm mt-1">Maintain a 30-day streak. You're at 12 days — keep going!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentUnlocksPage;
