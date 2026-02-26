import React from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { Trophy, Medal } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  level: number;
  isCurrentUser?: boolean;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ entries }) => {
  const { borderRadius } = useAgeAdaptiveUI();

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400 dark:text-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-400" />;
    return <span className="text-gray-400 dark:text-white/40 text-sm w-5 text-center">{rank}</span>;
  };

  return (
    <div className={`bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] overflow-hidden`}>
      {entries.map((entry) => (
        <div
          key={entry.rank}
          className={`p-4 flex items-center gap-4 border-b border-gray-100 dark:border-white/5 last:border-b-0 ${
            entry.isCurrentUser ? 'bg-[#FF0000]/10' : ''
          }`}
        >
          <div className="w-8 flex justify-center">{getRankIcon(entry.rank)}</div>
          <div className="flex-1">
            <span className={`font-medium ${entry.isCurrentUser ? 'text-[#FF0000]' : 'text-gray-900 dark:text-white'}`}>
              {entry.name} {entry.isCurrentUser && '(You)'}
            </span>
          </div>
          <div className="text-right">
            <div className="text-gray-900 dark:text-white font-bold text-sm">{entry.xp.toLocaleString()} XP</div>
            <div className="text-gray-400 dark:text-white/40 text-xs">Lvl {entry.level}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeaderboardTable;
