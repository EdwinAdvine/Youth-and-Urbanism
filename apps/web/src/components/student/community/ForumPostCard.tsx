import React from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { MessageCircle, Heart, Clock, User } from 'lucide-react';

interface ForumPostCardProps {
  title: string;
  author: string;
  content: string;
  timeAgo: string;
  likes: number;
  replies: number;
  subject?: string;
  onClick?: () => void;
}

const ForumPostCard: React.FC<ForumPostCardProps> = ({
  title, author, content, timeAgo, likes, replies, subject, onClick,
}) => {
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20 transition-colors text-left`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 bg-purple-500/20 rounded-full flex items-center justify-center`}>
          <User className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <span className="text-gray-900 dark:text-white text-sm font-medium">{author}</span>
        <span className="text-gray-400 dark:text-gray-300 dark:text-white/20">·</span>
        <span className="flex items-center gap-1 text-gray-400 dark:text-white/40 text-xs"><Clock className="w-3 h-3" /> {timeAgo}</span>
        {subject && (
          <span className={`px-2 py-0.5 bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-white/40 text-xs ${borderRadius}`}>{subject}</span>
        )}
      </div>
      <h3 className="text-gray-900 dark:text-white font-medium">{title}</h3>
      <p className="text-gray-500 dark:text-white/50 text-sm mt-1 line-clamp-2">{content}</p>
      <div className="flex items-center gap-4 mt-3">
        <span className="flex items-center gap-1 text-gray-400 dark:text-white/40 text-xs">
          <Heart className="w-3 h-3" /> {likes}
        </span>
        <span className="flex items-center gap-1 text-gray-400 dark:text-white/40 text-xs">
          <MessageCircle className="w-3 h-3" /> {replies} replies
        </span>
      </div>
    </button>
  );
};

export default ForumPostCard;
