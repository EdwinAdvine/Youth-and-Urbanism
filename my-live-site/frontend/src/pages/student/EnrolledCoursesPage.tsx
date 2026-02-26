import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { BookOpen, Play, Clock, TrendingUp, Search } from 'lucide-react';
import ProgressRing from '../../components/student/charts/ProgressRing';

interface Course {
  id: string;
  title: string;
  progress: number;
  lastAccessed: string;
  totalLessons: number;
  completedLessons: number;
  instructor: string;
  color: string;
}

const sampleCourses: Course[] = [
  { id: '1', title: 'Mathematics: Fractions & Decimals', progress: 72, lastAccessed: '2 hours ago', totalLessons: 20, completedLessons: 14, instructor: 'Ms. Wanjiku', color: 'from-blue-500 to-cyan-500' },
  { id: '2', title: 'Science: The Living World', progress: 45, lastAccessed: 'Yesterday', totalLessons: 15, completedLessons: 7, instructor: 'Mr. Ochieng', color: 'from-green-500 to-emerald-500' },
  { id: '3', title: 'English: Creative Writing', progress: 88, lastAccessed: '3 days ago', totalLessons: 12, completedLessons: 11, instructor: 'Mrs. Kamau', color: 'from-purple-500 to-pink-500' },
  { id: '4', title: 'Social Studies: Kenya History', progress: 30, lastAccessed: '1 week ago', totalLessons: 18, completedLessons: 5, instructor: 'Ms. Njeri', color: 'from-orange-500 to-red-500' },
  { id: '5', title: 'Kiswahili: Fasihi', progress: 60, lastAccessed: '4 days ago', totalLessons: 16, completedLessons: 10, instructor: 'Mwl. Otieno', color: 'from-teal-500 to-cyan-500' },
];

const EnrolledCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'progress' | 'name'>('recent');

  const filtered = sampleCourses
    .filter(c => c.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'progress') return b.progress - a.progress;
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      return 0;
    });

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
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {course.completedLessons}/{course.totalLessons} lessons</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.lastAccessed}</span>
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
          <BookOpen className="w-12 h-12 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-white/60">No courses found matching your search</p>
        </div>
      )}
    </div>
  );
};

export default EnrolledCoursesPage;
