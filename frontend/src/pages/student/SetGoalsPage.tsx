import React, { useState } from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Target, Plus, CheckCircle2, Circle, Sparkles, Clock } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  aiSuggested: boolean;
  completed: boolean;
}

const sampleGoals: Goal[] = [
  { id: '1', title: 'Complete 5 Math lessons this week', target: 5, current: 3, unit: 'lessons', deadline: 'Feb 16', aiSuggested: true, completed: false },
  { id: '2', title: 'Maintain a 14-day streak', target: 14, current: 12, unit: 'days', deadline: 'Feb 20', aiSuggested: false, completed: false },
  { id: '3', title: 'Score 80%+ on Science quiz', target: 80, current: 0, unit: '%', deadline: 'Feb 18', aiSuggested: true, completed: false },
  { id: '4', title: 'Read 3 English chapters', target: 3, current: 3, unit: 'chapters', deadline: 'Feb 14', aiSuggested: false, completed: true },
];

const SetGoalsPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [goals, setGoals] = useState(sampleGoals);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newDeadline, setNewDeadline] = useState('');

  const addGoal = () => {
    if (!newTitle.trim()) return;
    setGoals(prev => [...prev, {
      id: String(Date.now()),
      title: newTitle,
      target: parseInt(newTarget) || 1,
      current: 0,
      unit: 'tasks',
      deadline: newDeadline || 'No deadline',
      aiSuggested: false,
      completed: false,
    }]);
    setNewTitle('');
    setNewTarget('');
    setNewDeadline('');
    setShowNew(false);
  };

  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Target className="w-8 h-8 text-blue-400" /> My Goals
          </h1>
          <p className="text-gray-600 dark:text-white/70">Set and track your learning goals</p>
        </div>
        <button onClick={() => setShowNew(!showNew)} className={`px-4 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white ${borderRadius} flex items-center gap-2`}>
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      {showNew && (
        <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-[#FF0000]/30`}>
          <h3 className="text-gray-900 dark:text-white font-medium mb-3">Create New Goal</h3>
          <div className="space-y-3">
            <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Goal title..." className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#FF0000]`} />
            <div className="flex gap-3">
              <input type="number" value={newTarget} onChange={(e) => setNewTarget(e.target.value)} placeholder="Target" className={`w-32 px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#FF0000]`} />
              <input type="date" value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)} className={`flex-1 px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white focus:outline-none focus:border-[#FF0000]`} />
            </div>
            <div className="flex gap-2">
              <button onClick={addGoal} className={`px-4 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white ${borderRadius}`}>Create Goal</button>
              <button onClick={() => setShowNew(false)} className={`px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white ${borderRadius}`}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Active Goals */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Active Goals ({activeGoals.length})</h2>
        <div className="space-y-3">
          {activeGoals.map((goal) => {
            const progress = Math.min(100, Math.round((goal.current / goal.target) * 100));
            return (
              <div key={goal.id} className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
                <div className="flex items-center gap-3">
                  <Circle className="w-5 h-5 text-gray-400 dark:text-white/30" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-gray-900 dark:text-white font-medium">{goal.title}</h3>
                      {goal.aiSuggested && <span className="flex items-center gap-1 text-xs text-purple-400"><Sparkles className="w-3 h-3" /> AI Suggested</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-white/50">
                      <span>{goal.current}/{goal.target} {goal.unit}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {goal.deadline}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <span className="text-gray-500 dark:text-white/60 text-sm font-medium">{progress}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Completed ({completedGoals.length})</h2>
          <div className="space-y-2">
            {completedGoals.map((goal) => (
              <div key={goal.id} className={`p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-green-500/20 opacity-60`}>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="text-gray-500 dark:text-white/60 line-through">{goal.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SetGoalsPage;
