import React from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { Users, MessageCircle } from 'lucide-react';

interface StudyGroupCardProps {
  name: string;
  subject: string;
  members: number;
  maxMembers: number;
  isJoined?: boolean;
  onJoin?: () => void;
  onChat?: () => void;
}

const StudyGroupCard: React.FC<StudyGroupCardProps> = ({
  name, subject, members, maxMembers, isJoined, onJoin, onChat,
}) => {
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className={`p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20 transition-colors`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 bg-green-500/20 ${borderRadius} flex items-center justify-center flex-shrink-0`}>
          <Users className="w-5 h-5 text-green-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-gray-900 dark:text-white font-medium">{name}</h3>
          <p className="text-gray-400 dark:text-white/40 text-sm">{subject}</p>
          <p className="text-gray-400 dark:text-white/30 text-xs mt-1">{members}/{maxMembers} members</p>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        {isJoined ? (
          <>
            <button onClick={onChat} className={`flex-1 px-3 py-1.5 bg-green-500/20 text-green-400 text-sm ${borderRadius} flex items-center justify-center gap-1`}>
              <MessageCircle className="w-3 h-3" /> Chat
            </button>
          </>
        ) : (
          <button onClick={onJoin} className={`flex-1 px-3 py-1.5 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white text-sm ${borderRadius}`}>
            Join Group
          </button>
        )}
      </div>
    </div>
  );
};

export default StudyGroupCard;
