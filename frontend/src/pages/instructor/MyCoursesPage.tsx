import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, BookOpen, TrendingUp } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import { CourseCard } from '../../components/instructor/courses/CourseCard';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';


interface Course {
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
}

export const MyCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updated');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, [statusFilter, sortBy]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (sortBy) params.sort_by = sortBy;

      const response = await apiClient.get('/api/v1/instructor/courses', {
        params,
      });

      // Use mock data for development if API returns empty
      if (!response.data || response.data.length === 0) {
        setCourses([
          {
            id: '1',
            title: 'Introduction to Mathematics - Grade 7',
            description: 'Comprehensive math course covering algebra, geometry, and statistics aligned with CBC curriculum.',
            thumbnail_url: '',
            grade_levels: ['Grade 7', 'Grade 8'],
            learning_area: 'Mathematics',
            enrolled_count: 45,
            rating: 4.8,
            total_revenue: 135000,
            status: 'published',
            created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '2',
            title: 'English Language & Literature',
            description: 'Improve reading, writing, and comprehension skills with interactive lessons.',
            thumbnail_url: '',
            grade_levels: ['Grade 6', 'Grade 7'],
            learning_area: 'Languages',
            enrolled_count: 32,
            rating: 4.6,
            total_revenue: 96000,
            status: 'published',
            created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '3',
            title: 'Science Experiments for Young Learners',
            description: 'Hands-on science experiments and explorations for curious minds.',
            thumbnail_url: '',
            grade_levels: ['Grade 4', 'Grade 5', 'Grade 6'],
            learning_area: 'Science',
            enrolled_count: 18,
            rating: 4.9,
            total_revenue: 54000,
            status: 'draft',
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]);
      } else {
        setCourses(response.data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Fallback to mock data on error
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = () => {
    navigate('/dashboard/instructor/courses/create');
  };

  const handleEditCourse = (courseId: string) => {
    navigate(`/dashboard/instructor/courses/${courseId}/edit`);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      await apiClient.delete(`/api/v1/instructor/courses/${courseId}`);
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course');
    }
  };

  const handleViewAnalytics = (_courseId: string) => {
    navigate('/dashboard/instructor/performance');
  };

  // Filter courses based on search query
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Calculate stats
  const stats = {
    total: courses.length,
    published: courses.filter((c) => c.status === 'published').length,
    draft: courses.filter((c) => c.status === 'draft').length,
    totalEnrollments: courses.reduce((sum, c) => sum + c.enrolled_count, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InstructorPageHeader
        title="My Courses"
        description="Manage your course library and track student enrollments"
        icon={<BookOpen className="w-6 h-6 text-purple-400" />}
        actions={
          <button
            onClick={handleCreateCourse}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Create Course
          </button>
        }
      />

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <BookOpen className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-white/60">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-white/60">Published</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.published}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Filter className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-white/60">Drafts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.draft}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-white/60">Total Enrollments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEnrollments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-300 dark:text-white/40" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500 dark:text-white/60" />
            <span className="text-sm text-gray-500 dark:text-white/60">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
            >
              <option value="all">All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-white/60">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
            >
              <option value="updated">Recently Updated</option>
              <option value="created">Recently Created</option>
              <option value="title">Title A-Z</option>
              <option value="enrollments">Most Enrolled</option>
              <option value="revenue">Highest Revenue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 dark:text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Courses Yet</h3>
          <p className="text-gray-500 dark:text-white/60 mb-6">
            {searchQuery
              ? 'No courses match your search criteria'
              : 'Create your first course to get started'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleCreateCourse}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
            >
              Create Your First Course
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={handleEditCourse}
              onDelete={handleDeleteCourse}
              onViewAnalytics={handleViewAnalytics}
            />
          ))}
        </div>
      )}
    </div>
  );
};
