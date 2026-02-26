import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { BookOpen, Play, Clock, TrendingUp, Search, Loader2 } from 'lucide-react';
import ProgressRing from '../../components/student/charts/ProgressRing';
import { getEnrolledCourses } from '../../services/student/studentLearningService';

interface Course {
  id: string;
  title: string;
  progress: number;
  enrolledAt: string;
  instructor: string;
  learningArea: string;
  completed: boolean;
}

const EnrolledCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'progress' | 'name'>('recent');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await getEnrolledCourses();
        const mapped: Course[] = (Array.isArray(data) ? data : []).map((e: any) => ({
          id: e.course_id || e.id || '',
          title: e.course_title || e.title || '',
          progress: e.progress_percentage ?? 0,
          enrolledAt: e.enrollment_date
            ? new Date(e.enrollment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : '',
          instructor: e.instructor_name || '',
          learningArea: e.learning_area || '',
          completed: e.completed ?? false,
        }));
        setCourses(mapped);
      } catch {
        // No fallback — show empty state
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filtered = courses
    .filter(c => c.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'progress') return b.progress - a.progress;
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      return 0;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#FF0000] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Courses</h1>
        <p className="text-gray-600 dark:text-white/70">Continue where you left off</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses..." className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#FF0000]`} />
        </div>
        <div className="flex gap-2">
          {(['recent', 'progress', 'name'] as const).map((sort) => (
            <button key={sort} onClick={() => setSortBy(sort)} className={`px-3 py-2.5 ${borderRadius} text-sm capitalize ${sortBy === sort ? 'bg-[#FF0000]/20 text-[#FF0000] border border-[#FF0000]/30' : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60 border border-gray-200 dark:border-white/10'}`}>
              {sort}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((course) => (
          <div key={course.id} className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20 transition-colors`}>
            <div className="flex gap-4">
              <ProgressRing progress={course.progress} size={80} strokeWidth={6} />
              <div className="flex-1 min-w-0">
                <h3 className="text-gray-900 dark:text-white font-semibold truncate">{course.title}</h3>
                <p className="text-gray-400 dark:text-white/40 text-sm mt-0.5">{course.instructor}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-white/50">
                  {course.learningArea && <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {course.learningArea}</span>}
                  {course.enrolledAt && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Enrolled {course.enrolledAt}</span>}
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-white/10 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#FF0000] to-orange-500 rounded-full" style={{ width: `${course.progress}%` }} />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => navigate(`/dashboard/student/courses/${course.id}`)} className={`flex-1 px-4 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white text-sm ${borderRadius} flex items-center justify-center gap-2`}>
                <Play className="w-4 h-4" /> Continue
              </button>
              <button onClick={() => navigate(`/dashboard/student/learning-map`)} className={`px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-white/60 text-sm ${borderRadius}`} title="View progress trends">
                <TrendingUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className={`p-12 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center`}>
          <BookOpen className="w-12 h-12 text-gray-400 dark:text-white/20 mx-auto mb-4" />
          {search ? (
            <p className="text-gray-500 dark:text-white/60">No courses found matching your search</p>
          ) : (
            <>
              <p className="text-gray-500 dark:text-white/60 mb-3">You haven't enrolled in any courses yet.</p>
              <button
                onClick={() => navigate('/dashboard/student/courses/browse')}
                className={`px-5 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-white ${borderRadius} text-sm`}
              >
                Browse Courses
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default EnrolledCoursesPage;
