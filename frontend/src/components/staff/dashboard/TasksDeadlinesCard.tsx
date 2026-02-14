import React from 'react';
import { ListChecks, Calendar, CheckCircle2 } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  dueDate: string;
  type: 'review' | 'ticket' | 'session' | 'content' | 'assessment';
  isOverdue: boolean;
  isCompleted: boolean;
}

interface TasksDeadlinesCardProps {
  tasks: Task[];
  isLoading?: boolean;
}

const TasksDeadlinesCard: React.FC<TasksDeadlinesCardProps> = ({ tasks, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5 animate-pulse">
        <div className="h-5 w-36 bg-gray-100 dark:bg-[#22272B] rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-gray-100 dark:bg-[#22272B] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const typeColors: Record<string, string> = {
    review: 'text-purple-400',
    ticket: 'text-blue-400',
    session: 'text-green-400',
    content: 'text-cyan-400',
    assessment: 'text-amber-400',
  };

  const pending = tasks.filter((t) => !t.isCompleted);
  const completed = tasks.filter((t) => t.isCompleted);

  return (
    <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-blue-400" />
          Tasks & Deadlines
        </h3>
        <span className="text-xs text-gray-400 dark:text-white/40">
          {completed.length}/{tasks.length} done
        </span>
      </div>
      <div className="space-y-2">
        {pending.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-white/40 text-center py-4">All tasks completed!</p>
        ) : (
          pending.slice(0, 5).map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-100 dark:bg-[#22272B]/50"
            >
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${task.isOverdue ? 'bg-red-400' : 'bg-green-400'}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-900 dark:text-white truncate">{task.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] ${typeColors[task.type] || 'text-gray-400 dark:text-white/40'}`}>{task.type}</span>
                  <span className={`text-[10px] flex items-center gap-0.5 ${task.isOverdue ? 'text-red-400' : 'text-gray-400 dark:text-white/40'}`}>
                    <Calendar className="w-2.5 h-2.5" />
                    {task.dueDate}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {completed.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-[#22272B]">
          <p className="text-xs text-gray-400 dark:text-white/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {completed.length} completed today
          </p>
        </div>
      )}
    </div>
  );
};

export default TasksDeadlinesCard;
