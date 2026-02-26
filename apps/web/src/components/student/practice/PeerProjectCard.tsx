import React from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { Heart, MessageCircle, User } from 'lucide-react';

interface PeerProjectCardProps {
  title: string;
  author: string;
  subject: string;
  likes: number;
  comments: number;
  thumbnail?: string;
  onLike?: () => void;
  onClick?: () => void;
}

const PeerProjectCard: React.FC<PeerProjectCardProps> = ({
  title, author, subject, likes, comments, onLike, onClick,
}) => {
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20 transition-colors text-left`}
    >
      <div className={`w-full aspect-video bg-gradient-to-br from-purple-500/20 to-blue-500/20 ${borderRadius} flex items-center justify-center mb-3`}>
        <span className="text-gray-400 dark:text-white/30 text-sm">Project Preview</span>
      </div>
      <h3 className="text-gray-900 dark:text-white font-medium">{title}</h3>
      <div className="flex items-center gap-2 mt-1">
        <User className="w-3 h-3 text-gray-400 dark:text-white/40" />
        <span className="text-gray-400 dark:text-white/40 text-sm">{author}</span>
        <span className="text-gray-400 dark:text-gray-300 dark:text-white/20">·</span>
        <span className="text-gray-400 dark:text-white/40 text-sm">{subject}</span>
      </div>
      <div className="flex items-center gap-4 mt-3">
        <button
          onClick={(e) => { e.stopPropagation(); onLike?.(); }}
          className="flex items-center gap-1 text-gray-500 dark:text-white/50 text-sm hover:text-red-400"
        >
          <Heart className="w-3.5 h-3.5" /> {likes}
        </button>
        <span className="flex items-center gap-1 text-gray-500 dark:text-white/50 text-sm">
          <MessageCircle className="w-3.5 h-3.5" /> {comments}
        </span>
      </div>
    </button>
  );
};

export default PeerProjectCard;
