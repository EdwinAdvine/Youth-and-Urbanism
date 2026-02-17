import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { getTodayDashboard } from '../../services/student/studentDashboardService';
import { Clock, CheckCircle, GripVertical, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import type { DailyPlanItem } from '../../types/student';

const AIPlanPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const [planItems, setPlanItems] = useState<DailyPlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTodayDashboard();
      if (data.daily_plan?.items) {
        setPlanItems(data.daily_plan.items);
      }
    } catch {
      setError('Failed to load today\'s plan');
      // Fallback data for demo
      setPlanItems([
        { id: '1', title: 'Math Practice', duration: 30, type: 'lesson', completed: false, aiSuggested: true, priority: 'high', order: 1 },
        { id: '2', title: 'Reading Assignment', duration: 45, type: 'assignment', completed: false, aiSuggested: true, priority: 'medium', order: 2 },
        { id: '3', title: 'Science Quiz', duration: 20, type: 'quiz', completed: true, aiSuggested: true, priority: 'medium', order: 3 },
        { id: '4', title: 'Break Time', duration: 15, type: 'break', completed: false, aiSuggested: false, priority: 'low', order: 4 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const handleRegenerate = async () => {
    setRegenerating(true);
    await fetchPlan();
    setRegenerating(false);
  };

  const handleStart = (item: DailyPlanItem) => {
    if (item.type === 'lesson') {
      navigate(item.courseId ? `/dashboard/student/courses/${item.courseId}` : '/dashboard/student/courses/enrolled');
    } else if (item.type === 'assignment') {
      navigate('/dashboard/student/assignments/pending');
    } else if (item.type === 'quiz') {
      navigate('/dashboard/student/quizzes/practice');
    } else if (item.type === 'break') {
      navigate('/dashboard/student/today/mood');
    } else {
      navigate('/dashboard/student/courses/enrolled');
    }
  };

  const handleToggleComplete = (itemId: string) => {
    setPlanItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    ));
  };

  const completedCount = planItems.filter(i => i.completed).length;
  const totalCount = planItems.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#FF0000] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Today's Learning Plan</h1>
          <p className="text-gray-600 dark:text-white/70">AI-curated plan based on your progress</p>
        </div>
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className={`px-4 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 disabled:opacity-50 text-gray-900 dark:text-white ${borderRadius} flex items-center gap-2`}
        >
          <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
          Regenerate Plan
        </button>
      </div>

      {error && (
        <div className={`p-3 bg-yellow-500/10 ${borderRadius} border border-yellow-500/20 flex items-center gap-2`}>
          <AlertCircle className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-400 text-sm">{error} - showing sample data</span>
        </div>
      )}

      <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-white/70">Progress</span>
              <span className="text-sm text-gray-900 dark:text-white">{completedCount} / {totalCount} complete</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
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
                <button onClick={() => handleToggleComplete(item.id)} className="flex-shrink-0">
                  {item.completed
                    ? <CheckCircle className="w-5 h-5 text-green-500" />
                    : <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-white/30" />
                  }
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-gray-900 dark:text-white font-medium ${item.completed ? 'line-through opacity-60' : ''}`}>{item.title}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-white/60">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.duration} min
                    </span>
                    <span className="capitalize">{item.type}</span>
                  </div>
                </div>
                <button
                  onClick={() => !item.completed && handleStart(item)}
                  className={`px-4 py-2 ${item.completed ? 'bg-green-500/20 text-green-400' : 'bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white'} ${borderRadius} text-sm`}
                >
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
