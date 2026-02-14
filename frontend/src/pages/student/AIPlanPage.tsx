import React from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Clock, CheckCircle, GripVertical } from 'lucide-react';

const AIPlanPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();

  const planItems = [
    { id: 1, title: 'Math Practice', duration: 30, type: 'lesson', completed: false },
    { id: 2, title: 'Reading Assignment', duration: 45, type: 'assignment', completed: false },
    { id: 3, title: 'Science Quiz', duration: 20, type: 'quiz', completed: true },
    { id: 4, title: 'Break Time', duration: 15, type: 'break', completed: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Today's Learning Plan</h1>
          <p className="text-gray-600 dark:text-white/70">AI-curated plan based on your progress</p>
        </div>
        <button className={`px-4 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white ${borderRadius}`}>
          Regenerate Plan
        </button>
      </div>

      <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-white/70">Progress</span>
              <span className="text-sm text-gray-900 dark:text-white">1 / 4 complete</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }}></div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {planItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 bg-gray-50 dark:bg-white/5 ${borderRadius} border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-move`}
            >
              <div className="flex items-center gap-4">
                <GripVertical className="w-5 h-5 text-gray-400 dark:text-white/40" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 dark:text-white font-medium">{item.title}</span>
                    {item.completed && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-white/60">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.duration} min
                    </span>
                    <span className="capitalize">{item.type}</span>
                  </div>
                </div>
                <button className={`px-4 py-2 ${item.completed ? 'bg-green-500/20 text-green-400' : 'bg-[#FF0000] text-gray-900 dark:text-white'} ${borderRadius} text-sm`}>
                  {item.completed ? 'Completed' : 'Start'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIPlanPage;
