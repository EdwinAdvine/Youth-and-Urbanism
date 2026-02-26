import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Search, Star, Users, Clock, Grid, List } from 'lucide-react';

interface MarketplaceCourse {
  id: string;
  title: string;
  subject: string;
  instructor: string;
  rating: number;
  reviews: number;
  students: number;
  duration: string;
  price: string;
  level: string;
  image: string;
}

const courses: MarketplaceCourse[] = [
  { id: '1', title: 'CBC Mathematics Grade 7', subject: 'Mathematics', instructor: 'Ms. Wanjiku', rating: 4.8, reviews: 156, students: 1240, duration: '12 weeks', price: 'KES 500', level: 'Grade 7', image: '' },
  { id: '2', title: 'Integrated Science Explorer', subject: 'Science', instructor: 'Mr. Ochieng', rating: 4.6, reviews: 89, students: 876, duration: '10 weeks', price: 'KES 450', level: 'Grade 6-8', image: '' },
  { id: '3', title: 'English Language Arts', subject: 'English', instructor: 'Mrs. Kamau', rating: 4.9, reviews: 213, students: 2100, duration: '14 weeks', price: 'Free', level: 'Grade 7', image: '' },
  { id: '4', title: 'Kiswahili Sanifu', subject: 'Kiswahili', instructor: 'Mwl. Otieno', rating: 4.5, reviews: 67, students: 540, duration: '8 weeks', price: 'KES 300', level: 'Grade 6-8', image: '' },
  { id: '5', title: 'Social Studies: Our Kenya', subject: 'Social Studies', instructor: 'Ms. Njeri', rating: 4.7, reviews: 102, students: 930, duration: '10 weeks', price: 'KES 400', level: 'Grade 7', image: '' },
  { id: '6', title: 'Creative Arts & Design', subject: 'Creative Arts', instructor: 'Mr. Mwangi', rating: 4.4, reviews: 45, students: 320, duration: '6 weeks', price: 'KES 350', level: 'All Grades', image: '' },
];

const subjects = ['All', 'Mathematics', 'Science', 'English', 'Kiswahili', 'Social Studies', 'Creative Arts', 'Technology'];

const BrowseCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popular');

  const filtered = courses
    .filter(c => (selectedSubject === 'All' || c.subject === selectedSubject) && c.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === 'rating' ? b.rating - a.rating : b.students - a.students);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Browse Courses</h1>
        <p className="text-gray-600 dark:text-white/70">Explore CBC-aligned courses from top instructors</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/40" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses, subjects, or instructors..." className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#FF0000]`} />
      </div>

      {/* Subject Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {subjects.map((sub) => (
          <button key={sub} onClick={() => setSelectedSubject(sub)} className={`px-4 py-2 ${borderRadius} text-sm whitespace-nowrap ${selectedSubject === sub ? 'bg-[#FF0000] text-gray-900 dark:text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10'}`}>
            {sub}
          </button>
        ))}
      </div>

      {/* Sort & View */}
      <div className="flex items-center justify-between">
        <span className="text-gray-500 dark:text-white/60 text-sm">{filtered.length} courses found</span>
        <div className="flex items-center gap-3">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={`px-3 py-2 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white text-sm`}>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
          </select>
          <div className="flex gap-1">
            <button onClick={() => setViewMode('grid')} className={`p-2 ${borderRadius} ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-400 dark:text-white/40'}`}><Grid className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 ${borderRadius} ${viewMode === 'list' ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-400 dark:text-white/40'}`}><List className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Course Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
        {filtered.map((course) => (
          <div key={course.id} className={`bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20 transition-colors overflow-hidden`}>
            {/* Color header */}
            <div className="h-2 bg-gradient-to-r from-[#FF0000] to-orange-500" />
            <div className={viewMode === 'list' ? 'p-4 flex items-center gap-4' : 'p-5'}>
              <div className={viewMode === 'list' ? 'flex-1' : ''}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 ${borderRadius} text-xs bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/50`}>{course.level}</span>
                  <span className={`px-2 py-0.5 ${borderRadius} text-xs bg-blue-500/20 text-blue-400`}>{course.subject}</span>
                </div>
                <h3 className="text-gray-900 dark:text-white font-semibold mt-2">{course.title}</h3>
                <p className="text-gray-400 dark:text-white/40 text-sm mt-1">{course.instructor}</p>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 dark:text-white/50">
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {course.rating} ({course.reviews})</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {course.students}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}</span>
                </div>
              </div>
              <div className={viewMode === 'list' ? 'flex items-center gap-3' : 'flex items-center justify-between mt-4'}>
                <span className={`font-bold ${course.price === 'Free' ? 'text-green-400' : 'text-gray-900 dark:text-white'}`}>{course.price}</span>
                <button onClick={() => navigate(`/dashboard/student/browse/preview/${course.id}`)} className={`px-4 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white text-sm ${borderRadius}`}>
                  Preview
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowseCoursesPage;
