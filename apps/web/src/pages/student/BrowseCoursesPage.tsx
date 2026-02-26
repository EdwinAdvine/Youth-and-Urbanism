import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Search, Star, Users, Grid, List, Loader2, BookOpen, Heart } from 'lucide-react';
import { browseCourses } from '../../services/student/studentLearningService';
import { useWishlist } from '../../hooks/useWishlist';

interface MarketplaceCourse {
  course_id: string;
  title: string;
  learning_area: string;
  instructor_name: string;
  average_rating: number;
  enrollment_count: number;
  thumbnail_url: string | null;
  price: number;
  grade_levels: string[];
  description: string;
}

const subjects = ['All', 'Mathematics', 'Science', 'English', 'Kiswahili', 'Social Studies', 'Creative Arts', 'Technology'];

const formatPrice = (price: number) => price === 0 ? 'Free' : `KES ${price.toLocaleString()}`;

const BrowseCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [courses, setCourses] = useState<MarketplaceCourse[]>([]);
  const [total, setTotal] = useState(0);
  const [studentGrade, setStudentGrade] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [wishlistError, setWishlistError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleWishlistToggle = async (courseId: string) => {
    setWishlistError(null);
    const result = await toggleWishlist(courseId);
    if (!result.success && result.error) {
      setWishlistError(result.error);
      setTimeout(() => setWishlistError(null), 4000);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchCourses();
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedSubject, sortBy]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await browseCourses({
        search: search || undefined,
        subject: selectedSubject !== 'All' ? selectedSubject : undefined,
        sort_by: sortBy,
      });
      if (data?.courses) {
        setCourses(data.courses);
        setTotal(data.total ?? data.courses.length);
        if (data.student_grade) setStudentGrade(data.student_grade);
      } else {
        setCourses([]);
        setTotal(0);
      }
    } catch {
      setCourses([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Browse Courses</h1>
        <p className="text-gray-600 dark:text-white/70">
          {studentGrade
            ? `CBC-aligned courses for ${studentGrade}`
            : 'Explore CBC-aligned courses from top instructors'}
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/40" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses, subjects, or instructors..."
          className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#FF0000]`}
        />
      </div>

      {/* Subject Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {subjects.map((sub) => (
          <button
            key={sub}
            onClick={() => setSelectedSubject(sub)}
            className={`px-4 py-2 ${borderRadius} text-sm whitespace-nowrap transition-colors ${
              selectedSubject === sub
                ? 'bg-[#FF0000] text-white'
                : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Sort & View */}
      <div className="flex items-center justify-between">
        <span className="text-gray-500 dark:text-white/60 text-sm">
          {loading ? 'Loading…' : `${total} course${total !== 1 ? 's' : ''} found`}
        </span>
        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`px-3 py-2 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white text-sm`}
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
            <option value="price_low">Price: Low → High</option>
            <option value="price_high">Price: High → Low</option>
          </select>
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${borderRadius} ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-400 dark:text-white/40'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${borderRadius} ${viewMode === 'list' ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-400 dark:text-white/40'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Wishlist error toast */}
      {wishlistError && (
        <div className={`p-3 bg-red-500/10 border border-red-500/20 ${borderRadius} text-red-400 text-sm`}>
          {wishlistError}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 text-[#FF0000] animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && courses.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center gap-3">
          <BookOpen className="w-12 h-12 text-gray-300 dark:text-white/20" />
          <p className="text-gray-500 dark:text-white/50 font-medium">No courses found</p>
          <p className="text-gray-400 dark:text-white/30 text-sm">
            {search || selectedSubject !== 'All'
              ? 'Try adjusting your search or filters.'
              : studentGrade
              ? `No published courses for ${studentGrade} yet.`
              : 'No published courses available.'}
          </p>
        </div>
      )}

      {/* Course Grid/List */}
      {!loading && courses.length > 0 && (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {courses.map((course) => {
            const priceLabel = formatPrice(course.price);
            return (
              <div
                key={course.course_id}
                className={`bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20 transition-colors overflow-hidden`}
              >
                {/* Color header */}
                <div className="h-2 bg-gradient-to-r from-[#FF0000] to-orange-500" />
                <div className={viewMode === 'list' ? 'p-4 flex items-center gap-4' : 'p-5'}>
                  <div className={viewMode === 'list' ? 'flex-1' : ''}>
                    <div className="flex justify-end mb-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleWishlistToggle(course.course_id); }}
                        aria-label={isWishlisted(course.course_id) ? 'Remove from wishlist' : 'Add to wishlist'}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                      >
                        <Heart
                          className={`w-5 h-5 transition-colors ${isWishlisted(course.course_id) ? 'fill-[#FF0000] text-[#FF0000]' : 'text-gray-400 dark:text-white/40'}`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {course.grade_levels.slice(0, 2).map((g) => (
                        <span key={g} className={`px-2 py-0.5 ${borderRadius} text-xs bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/50`}>{g}</span>
                      ))}
                      <span className={`px-2 py-0.5 ${borderRadius} text-xs bg-blue-500/20 text-blue-400`}>{course.learning_area}</span>
                    </div>
                    <h3 className="text-gray-900 dark:text-white font-semibold mt-2 line-clamp-2">{course.title}</h3>
                    <p className="text-gray-400 dark:text-white/40 text-sm mt-1">{course.instructor_name}</p>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 dark:text-white/50 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        {course.average_rating.toFixed(1)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {course.enrollment_count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className={viewMode === 'list' ? 'flex items-center gap-3 shrink-0' : 'flex items-center justify-between mt-4'}>
                    <span className={`font-bold ${priceLabel === 'Free' ? 'text-green-400' : 'text-gray-900 dark:text-white'}`}>
                      {priceLabel}
                    </span>
                    <button
                      onClick={() => navigate(`/dashboard/student/browse/preview/${course.course_id}`)}
                      className={`px-4 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-white text-sm ${borderRadius}`}
                    >
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BrowseCoursesPage;
