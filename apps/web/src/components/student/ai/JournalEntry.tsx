import React from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { BookOpen, Calendar } from 'lucide-react';

interface JournalEntryProps {
  id: string;
  title: string;
  content: string;
  date: string;
  mood?: string;
  onClick?: () => void;
}

const JournalEntry: React.FC<JournalEntryProps> = ({ title, content, date, mood, onClick }) => {
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20 transition-colors text-left`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 bg-purple-500/20 ${borderRadius} flex items-center justify-center flex-shrink-0`}>
          <BookOpen className="w-5 h-5 text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900 dark:text-white font-medium truncate">{title}</h3>
          <p className="text-gray-500 dark:text-white/50 text-sm mt-1 line-clamp-2">{content}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-white/40">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {date}</span>
            {mood && <span className="capitalize">{mood}</span>}
          </div>
        </div>
      </div>
    </button>
  );
};

export default JournalEntry;
