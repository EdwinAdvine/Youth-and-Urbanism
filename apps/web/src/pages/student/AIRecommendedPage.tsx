// AIRecommendedPage - Student page at /dashboard/student/ai-recommended. Shows AI-curated
// course recommendations based on the student's grade level and learning patterns.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { useWishlist } from '../../hooks/useWishlist';
import { Sparkles, Star, Users, BookOpen, Heart, ShoppingCart, Loader2, AlertCircle } from 'lucide-react';
import { getAIRecommendedCourses } from '../../services/student/studentLearningService';

interface RecommendedCourse {
  course_id: string;
  title: string;
  description: string;
  instructor_name: string;
  learning_area: string;
  average_rating: number;
  enrollment_count: number;
  price: number;
  ai_match_score: number;
  thumbnail_url?: string;
}

const CARD_GRADIENTS = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-green-500 to-emerald-500',
  'from-orange-500 to-yellow-500',
  'from-red-500 to-rose-500',
  'from-teal-500 to-cyan-500',
];

const AIRecommendedPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [courses, setCourses] = useState<RecommendedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlistErrors, setWishlistErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAIRecommendedCourses(10);
      setCourses(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } }; message?: string };
      setError(e?.response?.data?.detail || e?.message || 'Failed to load recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const handleWishlistToggle = async (courseId: string) => {
    const result = await toggleWishlist(courseId);
    if (!result.success && result.error) {
      setWishlistErrors(prev => ({ ...prev, [courseId]: result.error! }));
      setTimeout(() => setWishlistErrors(prev => { const n = { ...prev }; delete n[courseId]; return n; }), 4000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-yellow-400" /> AI Recommended For You
        </h1>
        <p className="text-gray-600 dark:text-white/70">Personalized course recommendations based on your grade level and learning journey</p>
      </div>

      <div className={`p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 ${borderRadius} border border-purple-500/30`}>
        <p className="text-gray-700 dark:text-white/80 text-sm">
          <Sparkles className="w-4 h-4 inline-block mr-1 text-purple-400" />
          These recommendations are tailored using your grade level, enrolled subjects, and performance data.
        </p>
      </div>

      {/* Wishlist error banner */}
      {Object.values(wishlistErrors).length > 0 && (
        <div className={`p-3 bg-amber-500/10 border border-amber-500/20 ${borderRadius} flex items-center gap-2 text-amber-400 text-sm`}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{Object.values(wishlistErrors)[0]}</span>
        </div>
      )}

      {loading && (
        <div className={`p-12 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] flex items-center justify-center gap-2 text-gray-500 dark:text-white/60`}>
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading recommendations…</span>
        </div>
      )}

      {error && (
        <div className={`p-3 bg-red-500/10 border border-red-500/20 ${borderRadius} flex items-center gap-2 text-red-400 text-sm`}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={loadCourses} className="ml-auto underline text-xs">Retry</button>
        </div>
      )}

      {!loading && !error && courses.length === 0 && (
        <div className={`p-12 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center text-gray-500 dark:text-white/50`}>
          <Sparkles className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-white/20" />
          <p>No recommendations available yet. Explore the course catalog!</p>
          <button
            onClick={() => navigate('/dashboard/student/courses/browse')}
            className={`mt-3 px-5 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-white ${borderRadius} text-sm`}
          >
            Browse Courses
          </button>
        </div>
      )}

      {!loading && courses.length > 0 && (
        <div className="space-y-4">
          {courses.map((course, idx) => {
            const gradient = CARD_GRADIENTS[idx % CARD_GRADIENTS.length];
            const wishlisted = isWishlisted(course.course_id);
            const price = course.price === 0 ? 'Free' : `KES ${course.price.toLocaleString()}`;
            return (
              <div key={course.course_id} className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20 transition-colors`}>
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${gradient} ${borderRadius} flex items-center justify-center`}>
                    <span className="text-white font-bold text-lg">{course.ai_match_score}%</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-gray-900 dark:text-white font-semibold text-lg">{course.title}</h3>
                        <span className={`inline-block px-2 py-0.5 ${borderRadius} text-xs bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/60 mt-1`}>
                          {course.learning_area}
                        </span>
                      </div>
                      <button
                        onClick={() => handleWishlistToggle(course.course_id)}
                        className={`p-2 ${borderRadius} transition-colors ${wishlisted ? 'text-red-400' : 'text-gray-400 dark:text-white/30 hover:text-red-400'}`}
                        title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        <Heart className={`w-5 h-5 ${wishlisted ? 'fill-red-400' : ''}`} />
                      </button>
                    </div>
                    <p className="text-gray-500 dark:text-white/60 text-sm mt-2 line-clamp-2">{course.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-white/50">
                      <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> {course.average_rating.toFixed(1)}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {course.enrollment_count} students</span>
                      <span className="text-gray-400 dark:text-white/40 text-xs">{course.instructor_name}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between gap-2">
                    <span className={`text-lg font-bold ${price === 'Free' ? 'text-green-400' : 'text-gray-900 dark:text-white'}`}>{price}</span>
                    <button
                      onClick={() => navigate(`/dashboard/student/browse/preview/${course.course_id}`)}
                      className={`px-4 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-white text-sm ${borderRadius} flex items-center gap-2`}
                    >
                      <BookOpen className="w-4 h-4" /> Preview
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="text-center">
        <button
          onClick={() => navigate('/dashboard/student/courses/browse')}
          className={`px-6 py-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white ${borderRadius} inline-flex items-center gap-2`}
        >
          <ShoppingCart className="w-4 h-4" /> Browse All Courses
        </button>
      </div>
    </div>
  );
};

export default AIRecommendedPage;
