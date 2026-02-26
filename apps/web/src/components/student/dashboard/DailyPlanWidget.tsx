import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';

interface PlanItem {
  id: number;
  title: string;
  duration: string;
}

interface DailyPlanWidgetProps {
  items?: PlanItem[];
}

const defaultItems: PlanItem[] = [
  { id: 1, title: 'Sample Activity 1', duration: '30 minutes' },
  { id: 2, title: 'Sample Activity 2', duration: '30 minutes' },
  { id: 3, title: 'Sample Activity 3', duration: '30 minutes' },
];

const DailyPlanWidget: React.FC<DailyPlanWidgetProps> = ({ items = defaultItems }) => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Today's Plan</h2>
        <button
          onClick={() => navigate('/dashboard/student/today/ai-plan')}
          className="text-sm text-[#FF0000] hover:text-[#FF0000]/80"
        >
          View Full Plan →
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={`p-4 bg-gray-50 dark:bg-white/5 ${borderRadius} border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors`}
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <div className="flex-1">
                <div className="text-gray-900 dark:text-white font-medium">{item.title}</div>
                <div className="text-sm text-gray-500 dark:text-white/60">{item.duration}</div>
              </div>
              <button
                onClick={() => navigate('/dashboard/student/today/ai-plan')}
                className="px-4 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white text-sm rounded-lg transition-colors"
              >
                Start
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyPlanWidget;
