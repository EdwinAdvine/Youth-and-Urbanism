import React, { useState } from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Trophy, Share2 } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned: boolean;
  earnedAt?: string;
  category: string;
}

const badges: Badge[] = [
  { id: '1', name: 'First Steps', description: 'Complete your first lesson', icon: '🎯', rarity: 'common', earned: true, earnedAt: 'Jan 15, 2026', category: 'Learning' },
  { id: '2', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥', rarity: 'common', earned: true, earnedAt: 'Jan 22, 2026', category: 'Streaks' },
  { id: '3', name: 'Quiz Master', description: 'Score 100% on a quiz', icon: '🧠', rarity: 'rare', earned: true, earnedAt: 'Feb 1, 2026', category: 'Quizzes' },
  { id: '4', name: 'Social Butterfly', description: 'Make 5 friends', icon: '🦋', rarity: 'common', earned: true, earnedAt: 'Feb 5, 2026', category: 'Community' },
  { id: '5', name: 'Night Owl', description: 'Complete a lesson after 8 PM', icon: '🦉', rarity: 'rare', earned: true, earnedAt: 'Feb 10, 2026', category: 'Learning' },
  { id: '6', name: 'Math Wizard', description: 'Complete all math courses', icon: '🧙', rarity: 'epic', earned: false, category: 'Courses' },
  { id: '7', name: 'Month Champion', description: 'Maintain a 30-day streak', icon: '👑', rarity: 'epic', earned: false, category: 'Streaks' },
  { id: '8', name: 'The Scholar', description: 'Earn 10,000 XP total', icon: '📚', rarity: 'legendary', earned: false, category: 'XP' },
  { id: '9', name: 'Helping Hand', description: 'Give 10 shoutouts', icon: '🤝', rarity: 'rare', earned: false, category: 'Community' },
  { id: '10', name: 'Voice Explorer', description: 'Use voice mode 10 times', icon: '🎤', rarity: 'rare', earned: false, category: 'AI' },
];

const rarityColors = {
  common: 'border-gray-500/30 bg-gray-500/10',
  rare: 'border-blue-500/30 bg-blue-500/10',
  epic: 'border-purple-500/30 bg-purple-500/10',
  legendary: 'border-yellow-500/30 bg-yellow-500/10',
};

const rarityLabels = { common: 'Common', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' };
const rarityTextColors = { common: 'text-gray-400', rare: 'text-blue-400', epic: 'text-purple-400', legendary: 'text-yellow-400' };

const AchievementsGalleryPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [filter, setFilter] = useState('all');
  const earned = badges.filter(b => b.earned).length;

  const filtered = filter === 'all' ? badges : filter === 'earned' ? badges.filter(b => b.earned) : badges.filter(b => !b.earned);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Trophy className="w-8 h-8 text-yellow-400" /> Achievements Gallery
        </h1>
        <p className="text-gray-600 dark:text-white/70">{earned}/{badges.length} badges earned</p>
      </div>

      {/* Progress */}
      <div className={`p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-500 dark:text-white/60 text-sm">Collection Progress</span>
          <span className="text-gray-900 dark:text-white text-sm font-medium">{Math.round((earned / badges.length) * 100)}%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full" style={{ width: `${(earned / badges.length) * 100}%` }} />
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'earned', 'locked'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 ${borderRadius} text-sm capitalize ${filter === f ? 'bg-[#FF0000] text-gray-900 dark:text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60'}`}>
            {f} {f === 'earned' ? `(${earned})` : f === 'locked' ? `(${badges.length - earned})` : ''}
          </button>
        ))}
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {filtered.map((badge) => (
          <div key={badge.id} className={`p-4 ${borderRadius} border ${rarityColors[badge.rarity]} text-center ${!badge.earned ? 'opacity-50' : ''}`}>
            <div className="text-4xl mb-2">{badge.earned ? badge.icon : '🔒'}</div>
            <h3 className="text-gray-900 dark:text-white font-medium text-sm">{badge.name}</h3>
            <p className={`text-xs mt-0.5 ${rarityTextColors[badge.rarity]}`}>{rarityLabels[badge.rarity]}</p>
            <p className="text-gray-400 dark:text-white/40 text-xs mt-2">{badge.description}</p>
            {badge.earned && badge.earnedAt && <p className="text-gray-400 dark:text-white/30 text-xs mt-1">{badge.earnedAt}</p>}
            {badge.earned && (
              <button className={`mt-2 px-2 py-1 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-white/40 text-xs ${borderRadius} flex items-center gap-1 mx-auto`}>
                <Share2 className="w-3 h-3" /> Share
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsGalleryPage;
