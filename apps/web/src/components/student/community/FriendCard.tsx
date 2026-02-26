import React from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { User, UserPlus, MessageCircle } from 'lucide-react';

interface FriendCardProps {
  name: string;
  grade: string;
  status: 'online' | 'offline';
  isFriend?: boolean;
  onConnect?: () => void;
  onMessage?: () => void;
}

const FriendCard: React.FC<FriendCardProps> = ({ name, grade, status, isFriend, onConnect, onMessage }) => {
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className={`p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20 transition-colors`}>
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className={`w-10 h-10 ${borderRadius} bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center`}>
            <User className="w-5 h-5 text-gray-900 dark:text-white" />
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#181C1F] ${status === 'online' ? 'bg-green-500' : 'bg-white/30'}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-gray-900 dark:text-white font-medium text-sm">{name}</h3>
          <p className="text-gray-400 dark:text-white/40 text-xs">{grade}</p>
        </div>
        <div className="flex gap-1">
          {isFriend && onMessage && (
            <button onClick={onMessage} className={`p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius}`}>
              <MessageCircle className="w-4 h-4 text-gray-500 dark:text-white/60" />
            </button>
          )}
          {!isFriend && onConnect && (
            <button onClick={onConnect} className={`p-2 bg-blue-500/20 hover:bg-blue-500/30 ${borderRadius}`}>
              <UserPlus className="w-4 h-4 text-blue-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendCard;
