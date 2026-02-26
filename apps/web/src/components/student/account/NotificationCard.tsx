import React from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { Bell, BookOpen, Award, AlertTriangle, MessageCircle } from 'lucide-react';

interface NotificationCardProps {
  title: string;
  message: string;
  timeAgo: string;
  type: 'info' | 'achievement' | 'warning' | 'message' | 'assignment';
  isRead?: boolean;
  onClick?: () => void;
}

const typeConfig = {
  info: { icon: Bell, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  achievement: { icon: Award, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  warning: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/20' },
  message: { icon: MessageCircle, color: 'text-green-400', bg: 'bg-green-500/20' },
  assignment: { icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-500/20' },
};

const NotificationCard: React.FC<NotificationCardProps> = ({ title, message, timeAgo, type, isRead, onClick }) => {
  const { borderRadius } = useAgeAdaptiveUI();
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 ${borderRadius} border transition-colors text-left ${
        isRead
          ? 'bg-white dark:bg-[#181C1F] border-gray-200 dark:border-[#22272B]'
          : 'bg-white dark:bg-[#181C1F] border-[#FF0000]/20 bg-[#FF0000]/5'
      } hover:border-gray-300 dark:hover:border-white/20`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 ${config.bg} ${borderRadius} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium text-sm ${isRead ? 'text-gray-600 dark:text-white/70' : 'text-gray-900 dark:text-white'}`}>{title}</h3>
          <p className="text-gray-400 dark:text-white/40 text-xs mt-0.5 line-clamp-2">{message}</p>
          <span className="text-gray-400 dark:text-white/30 text-[10px] mt-1 block">{timeAgo}</span>
        </div>
        {!isRead && <div className="w-2 h-2 bg-[#FF0000] rounded-full flex-shrink-0 mt-1.5" />}
      </div>
    </button>
  );
};

export default NotificationCard;
