import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListChecks, Calendar, CheckCircle2, Circle } from 'lucide-react';

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

/** Determine the navigation route based on task type. */
function getTaskRoute(task: Task): string {
  switch (task.type) {
    case 'review':
      return '/dashboard/staff/moderation/review';
    case 'ticket':
      return '/dashboard/staff/support/tickets';
    case 'session':
      return '/dashboard/staff/learning/sessions';
    case 'content':
      return '/dashboard/staff/learning/content';
    case 'assessment':
      return '/dashboard/staff/learning/assessments';
    default:
      return '/dashboard/staff';
  }
}

const TasksDeadlinesCard: React.FC<TasksDeadlinesCardProps> = ({ tasks: initialTasks, isLoading }) => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  // Sync when parent re-renders with new tasks
  React.useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const toggleTaskCompletion = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t))
    );
  };

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
              onClick={() => navigate(getTaskRoute(task))}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(getTaskRoute(task));
                }
              }}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-100 dark:bg-[#22272B]/50 cursor-pointer hover:bg-gray-200 dark:hover:bg-[#22272B] transition-colors"
            >
              <button
                onClick={(e) => toggleTaskCompletion(task.id, e)}
                className="flex-shrink-0 text-gray-400 dark:text-white/40 hover:text-green-400 dark:hover:text-green-400 transition-colors"
                title="Mark as complete"
              >
                <Circle className="w-4 h-4" />
              </button>
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
              {task.isOverdue && (
                <span className="text-[10px] px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-full flex-shrink-0">
                  Overdue
                </span>
              )}
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
