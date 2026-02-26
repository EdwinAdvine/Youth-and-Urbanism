import React from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { BookOpen } from 'lucide-react';

interface DailyQuoteCardProps {
  text: string;
  author: string;
}

const DailyQuoteCard: React.FC<DailyQuoteCardProps> = ({ text, author }) => {
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className={`p-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
      <div className="flex items-start gap-4">
        <BookOpen className="w-8 h-8 text-purple-400 flex-shrink-0" />
        <div>
          <p className="text-lg text-gray-900 dark:text-white italic mb-2">"{text}"</p>
          <p className="text-sm text-gray-500 dark:text-white/60">— {author}</p>
        </div>
      </div>
    </div>
  );
};

export default DailyQuoteCard;
