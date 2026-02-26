import React from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { Target, CheckCircle } from 'lucide-react';

interface GoalCardProps {
  title: string;
  progress: number;
  target: number;
  unit: string;
  dueDate?: string;
}

const GoalCard: React.FC<GoalCardProps> = ({ title, progress, target, unit, dueDate }) => {
  const { borderRadius } = useAgeAdaptiveUI();
  const percentage = Math.min((progress / target) * 100, 100);
  const isComplete = progress >= target;

  return (
    <div className={`p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border ${isComplete ? 'border-green-500/30' : 'border-gray-200 dark:border-[#22272B]'}`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 ${borderRadius} flex items-center justify-center ${isComplete ? 'bg-green-500/20' : 'bg-[#FF0000]/20'}`}>
          {isComplete ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Target className="w-4 h-4 text-[#FF0000]" />}
        </div>
        <div className="flex-1">
          <h3 className="text-gray-900 dark:text-white font-medium text-sm">{title}</h3>
          <div className="flex items-center justify-between mt-1">
            <span className="text-gray-400 dark:text-white/40 text-xs">{progress}/{target} {unit}</span>
            {dueDate && <span className="text-gray-400 dark:text-white/30 text-xs">{dueDate}</span>}
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-white/10 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${isComplete ? 'bg-green-500' : 'bg-gradient-to-r from-[#FF0000] to-orange-500'}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalCard;
