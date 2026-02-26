import React from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { Heart, Star } from 'lucide-react';

interface ShoutoutCardProps {
  from: string;
  to: string;
  message: string;
  timeAgo: string;
  likes: number;
  onLike?: () => void;
}

const ShoutoutCard: React.FC<ShoutoutCardProps> = ({ from, to, message, timeAgo, likes, onLike }) => {
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className={`p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 ${borderRadius} border border-yellow-500/20`}>
      <div className="flex items-center gap-2 mb-2">
        <Star className="w-4 h-4 text-yellow-400" />
        <span className="text-gray-900 dark:text-white font-medium text-sm">{from}</span>
        <span className="text-gray-400 dark:text-white/30">→</span>
        <span className="text-yellow-400 font-medium text-sm">{to}</span>
      </div>
      <p className="text-gray-600 dark:text-white/70 text-sm">{message}</p>
      <div className="flex items-center justify-between mt-3">
        <span className="text-gray-400 dark:text-white/30 text-xs">{timeAgo}</span>
        <button
          onClick={onLike}
          className="flex items-center gap-1 text-gray-400 dark:text-white/40 text-xs hover:text-red-400 transition-colors"
        >
          <Heart className="w-3 h-3" /> {likes}
        </button>
      </div>
    </div>
  );
};

export default ShoutoutCard;
