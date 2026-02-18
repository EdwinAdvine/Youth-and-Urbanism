import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Map, Clock, CheckCircle2, Circle, ChevronRight, Sparkles, GripVertical, RefreshCw } from 'lucide-react';

interface PathItem {
  id: string;
  title: string;
  duration: string;
  type: 'lesson' | 'quiz' | 'practice' | 'break';
  completed: boolean;
}

const defaultItems: PathItem[] = [
  { id: '1', title: 'Mathematics: Fractions Review', duration: '25 min', type: 'lesson', completed: true },
  { id: '2', title: 'Fractions Practice Quiz', duration: '10 min', type: 'quiz', completed: true },
  { id: '3', title: 'Break Time', duration: '10 min', type: 'break', completed: false },
  { id: '4', title: 'Science: Water Cycle', duration: '20 min', type: 'lesson', completed: false },
  { id: '5', title: 'English: Creative Writing', duration: '30 min', type: 'lesson', completed: false },
  { id: '6', title: 'Writing Practice', duration: '15 min', type: 'practice', completed: false },
];

const typeColors: Record<string, string> = {
  lesson: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  quiz: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  practice: 'bg-green-500/20 text-green-400 border-green-500/30',
  break: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

const LearningPathPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const [items, setItems] = useState<PathItem[]>(defaultItems);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const totalMinutes = items.reduce((acc, item) => acc + parseInt(item.duration), 0);
  const completedMinutes = items.filter(i => i.completed).reduce((acc, item) => acc + parseInt(item.duration), 0);
  const progress = Math.round((completedMinutes / totalMinutes) * 100);

  const toggleComplete = (id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI Learning Path</h1>
          <p className="text-gray-600 dark:text-white/70">Your personalized daily learning plan</p>
        </div>
        <button
          onClick={() => {
            setIsRegenerating(true);
            setTimeout(() => {
              setItems(defaultItems.map(item => ({ ...item, completed: false })));
              setIsRegenerating(false);
            }, 1500);
          }}
          disabled={isRegenerating}
          className={`px-4 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 disabled:opacity-50 text-gray-900 dark:text-white ${borderRadius} flex items-center gap-2`}
        >
          {isRegenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isRegenerating ? 'Regenerating...' : 'Regenerate Plan'}
        </button>
      </div>

      {/* Progress Overview */}
      <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-900 dark:text-white font-medium">Today's Progress</span>
          <span className="text-gray-500 dark:text-white/60 text-sm">{completedMinutes}/{totalMinutes} min ({progress}%)</span>
        </div>
        <div className="w-full h-3 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Path Items */}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className={`p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20 transition-colors ${item.completed ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-4">
              <GripVertical className="w-5 h-5 text-gray-400 dark:text-gray-300 dark:text-white/20 cursor-grab" />
              <button onClick={() => toggleComplete(item.id)}>
                {item.completed ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Circle className="w-6 h-6 text-gray-400 dark:text-white/30" />}
              </button>
              <div className="flex-1">
                <div className={`text-gray-900 dark:text-white font-medium ${item.completed ? 'line-through' : ''}`}>{item.title}</div>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`px-2 py-0.5 text-xs ${borderRadius} border ${typeColors[item.type]}`}>{item.type}</span>
                  <span className="text-gray-400 dark:text-white/40 text-sm flex items-center gap-1"><Clock className="w-3 h-3" /> {item.duration}</span>
                </div>
              </div>
              {!item.completed && (
                <button onClick={() => navigate('/dashboard/student/courses/enrolled')} className={`px-4 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white text-sm ${borderRadius}`}>Start</button>
              )}
              <ChevronRight className="w-5 h-5 text-gray-400 dark:text-white/30" />
            </div>
          </div>
        ))}
      </div>

      {/* AI Suggestion */}
      <div className={`p-4 bg-blue-500/10 ${borderRadius} border border-blue-500/20`}>
        <div className="flex items-start gap-3">
          <Map className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-gray-900 dark:text-white text-sm font-medium">AI Suggestion</p>
            <p className="text-gray-500 dark:text-white/60 text-sm mt-1">Based on your energy levels, I recommend tackling the Science lesson next — you typically perform best on science topics in the afternoon!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPathPage;
