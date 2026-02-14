import React from 'react';
import { BookOpen, Users, Star, TrendingUp, Calendar, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail_url?: string;
    grade_levels: string[];
    learning_area?: string;
    enrolled_count: number;
    rating?: number;
    total_revenue?: number;
    status: 'draft' | 'published' | 'archived';
    created_at: string;
    updated_at: string;
  };
  onEdit?: (courseId: string) => void;
  onDelete?: (courseId: string) => void;
  onViewAnalytics?: (courseId: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onEdit, onDelete, onViewAnalytics }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = React.useState(false);

  const statusColors = {
    draft: 'bg-gray-500/20 text-gray-400 dark:text-gray-300 border-gray-500/30',
    published: 'bg-green-500/20 text-green-300 border-green-500/30',
    archived: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  };

  const handleCardClick = () => {
    navigate(`/dashboard/instructor/courses/${course.id}`);
  };

  return (
    <div
      className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden hover:bg-gray-100 dark:hover:bg-white/10 transition-all group cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-purple-500/20 to-blue-500/20 overflow-hidden">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-gray-400 dark:text-white/30" />
          </div>
        )}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <span
            className={`px-2 py-1 text-xs font-medium rounded border ${
              statusColors[course.status]
            }`}
          >
            {course.status}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-900 dark:text-white" />
          </button>
        </div>

        {/* Dropdown Menu */}
        {showMenu && (
          <div
            className="absolute top-12 right-3 bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg shadow-xl py-2 min-w-[160px] z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {onEdit && (
              <button
                onClick={() => {
                  onEdit(course.id);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-600 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Edit Course
              </button>
            )}
            {onViewAnalytics && (
              <button
                onClick={() => {
                  onViewAnalytics(course.id);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-600 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                View Analytics
              </button>
            )}
            {onDelete && (
              <>
                <div className="my-1 border-t border-gray-200 dark:border-white/10" />
                <button
                  onClick={() => {
                    onDelete(course.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  Delete Course
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{course.title}</h3>
        <p className="text-sm text-gray-500 dark:text-white/60 mb-4 line-clamp-2">{course.description}</p>

        {/* Grade Levels */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {course.grade_levels.slice(0, 3).map((grade) => (
            <span
              key={grade}
              className="px-2 py-1 text-xs bg-purple-500/10 text-purple-300 rounded"
            >
              {grade}
            </span>
          ))}
          {course.grade_levels.length > 3 && (
            <span className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40">+{course.grade_levels.length - 3} more</span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-600 dark:text-white/70">{course.enrolled_count}</span>
          </div>
          {course.rating && (
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-600 dark:text-white/70">{course.rating.toFixed(1)}</span>
            </div>
          )}
          {course.total_revenue && (
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-600 dark:text-white/70">
                KES {course.total_revenue.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
