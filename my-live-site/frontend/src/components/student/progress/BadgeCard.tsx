import React from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';

interface BadgeCardProps {
  name: string;
  icon: string;
  earned: string;
  description?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

const rarityColors = {
  common: 'border-gray-200 dark:border-white/10',
  rare: 'border-blue-500/30',
  epic: 'border-purple-500/30',
  legendary: 'border-yellow-500/30',
};

const BadgeCard: React.FC<BadgeCardProps> = ({ name, icon, earned, description, rarity = 'common' }) => {
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className={`p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border ${rarityColors[rarity]} hover:border-gray-300 dark:hover:border-white/20 transition-colors`}>
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900 dark:text-white text-sm font-medium truncate">{name}</h3>
          {description && <p className="text-gray-400 dark:text-white/40 text-xs mt-0.5">{description}</p>}
          <p className="text-gray-400 dark:text-white/30 text-xs mt-1">{earned}</p>
        </div>
      </div>
    </div>
  );
};

export default BadgeCard;
