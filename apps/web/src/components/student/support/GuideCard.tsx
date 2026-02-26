import React from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { BookOpen, ChevronRight } from 'lucide-react';

interface GuideCardProps {
  title: string;
  description: string;
  category: string;
  onClick?: () => void;
}

const GuideCard: React.FC<GuideCardProps> = ({ title, description, category, onClick }) => {
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20 transition-colors text-left`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 bg-blue-500/20 ${borderRadius} flex items-center justify-center flex-shrink-0`}>
          <BookOpen className="w-5 h-5 text-blue-400" />
        </div>
        <div className="flex-1">
          <span className={`px-2 py-0.5 bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-white/40 text-xs ${borderRadius}`}>{category}</span>
          <h3 className="text-gray-900 dark:text-white font-medium mt-1">{title}</h3>
          <p className="text-gray-500 dark:text-white/50 text-sm mt-0.5 line-clamp-2">{description}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 dark:text-white/30 flex-shrink-0 mt-1" />
      </div>
    </button>
  );
};

export default GuideCard;
