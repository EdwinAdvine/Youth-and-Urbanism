import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { BookOpen, Clock, Play } from 'lucide-react';
import ProgressRing from '../charts/ProgressRing';

interface CourseCardStudentProps {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  lastAccessed?: string;
  showContinue?: boolean;
}

const CourseCardStudent: React.FC<CourseCardStudentProps> = ({
  id, title, instructor, progress, completedLessons, totalLessons, lastAccessed, showContinue = true,
}) => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20 transition-colors`}>
      <div className="flex gap-4">
        <ProgressRing progress={progress} size={80} strokeWidth={6} />
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900 dark:text-white font-semibold truncate">{title}</h3>
          <p className="text-gray-400 dark:text-white/40 text-sm mt-0.5">{instructor}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-white/50">
            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {completedLessons}/{totalLessons} lessons</span>
            {lastAccessed && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {lastAccessed}</span>}
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-white/10 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#FF0000] to-orange-500 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
      {showContinue && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => navigate(`/dashboard/student/courses/${id}`)}
            className={`flex-1 px-4 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white text-sm ${borderRadius} flex items-center justify-center gap-2`}
          >
            <Play className="w-4 h-4" /> Continue
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseCardStudent;
