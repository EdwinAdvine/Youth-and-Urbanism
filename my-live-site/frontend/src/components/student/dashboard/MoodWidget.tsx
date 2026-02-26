import React from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { Heart, Smile, Meh, Frown, Coffee, Zap } from 'lucide-react';
import type { MoodType } from '../../../types/student';

interface MoodWidgetProps {
  moodType?: MoodType | null;
  onCheckIn?: () => void;
}

const moodIcons: Record<MoodType, React.ReactNode> = {
  excited: <Zap className="w-5 h-5 text-yellow-400" />,
  happy: <Smile className="w-5 h-5 text-green-400" />,
  okay: <Meh className="w-5 h-5 text-blue-400" />,
  tired: <Coffee className="w-5 h-5 text-purple-400" />,
  frustrated: <Frown className="w-5 h-5 text-red-400" />,
};

const MoodWidget: React.FC<MoodWidgetProps> = ({ moodType, onCheckIn }) => {
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className={`px-4 py-3 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] flex items-center gap-3`}>
      <Heart className="w-5 h-5 text-red-400" />
      {moodType ? (
        <div className="flex items-center gap-2">
          {moodIcons[moodType]}
          <span className="text-gray-700 dark:text-white/80 text-sm capitalize">{moodType}</span>
        </div>
      ) : (
        <button onClick={onCheckIn} className="text-gray-500 dark:text-white/60 text-sm hover:text-gray-900 dark:hover:text-white">
          How are you feeling?
        </button>
      )}
    </div>
  );
};

export default MoodWidget;
