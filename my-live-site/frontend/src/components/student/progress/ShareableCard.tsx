import React, { useRef } from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { Download, Share2, Trophy } from 'lucide-react';

interface ShareableCardProps {
  title: string;
  achievement: string;
  studentName: string;
  date: string;
}

const ShareableCard: React.FC<ShareableCardProps> = ({ title, achievement, studentName, date }) => {
  const { borderRadius } = useAgeAdaptiveUI();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    // Placeholder: In production, use html2canvas or canvas API
    alert('Download feature — html2canvas integration pending');
  };

  return (
    <div>
      <div
        ref={cardRef}
        className={`p-8 bg-gradient-to-br from-[#FF0000]/30 to-purple-500/30 ${borderRadius} border border-[#FF0000]/20 text-center`}
      >
        <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{title}</h2>
        <p className="text-gray-600 dark:text-white/70 mb-4">{achievement}</p>
        <div className="border-t border-gray-200 dark:border-white/10 pt-3">
          <p className="text-gray-900 dark:text-white font-medium">{studentName}</p>
          <p className="text-gray-400 dark:text-white/40 text-sm">{date}</p>
          <p className="text-gray-400 dark:text-gray-300 dark:text-white/20 text-xs mt-2">Urban Home School</p>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleDownload}
          className={`flex-1 px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white ${borderRadius} flex items-center justify-center gap-2 text-sm`}
        >
          <Download className="w-4 h-4" /> Download
        </button>
        <button
          className={`flex-1 px-4 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white ${borderRadius} flex items-center justify-center gap-2 text-sm`}
        >
          <Share2 className="w-4 h-4" /> Share
        </button>
      </div>
    </div>
  );
};

export default ShareableCard;
