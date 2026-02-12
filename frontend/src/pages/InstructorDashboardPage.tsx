/**
 * Instructor Dashboard Page
 *
 * Course management interface for instructors.
 *
 * Features:
 * - View all instructor's courses
 * - Create new courses
 * - Edit existing courses
 * - View course analytics (enrollments, ratings, revenue)
 * - Publish/unpublish courses
 * - Quick stats overview
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  PencilIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  AcademicCapIcon,
  UserGroupIcon,
  StarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

import courseService from '../services/courseService';
import type { Course } from '../types/course';

export default function InstructorDashboardPage() {
  const navigate = useNavigate();

  // State
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Mock instructor ID - Replace with actual user ID from auth context
  const instructorId = 'current-user-id';

  // Load instructor's courses
  useEffect(() => {
    loadCourses();
  }, [filter]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual instructor ID from auth context
      const response = await courseService.listCourses({
        instructor_id: instructorId,
        limit: 100,
      });

      let filtered = response.courses;
      if (filter === 'published') {
        filtered = filtered.filter((c) => c.is_published);
      } else if (filter === 'draft') {
        filtered = filtered.filter((c) => !c.is_published);
      }

      setCourses(filtered);
    } catch (err: any) {
      setError(err?.message || 'Failed to load courses');
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = () => {
    navigate('/instructor/courses/create');
  };

  const handleEditCourse = (courseId: string) => {
    navigate(`/instructor/courses/${courseId}/edit`);
  };

  const handleViewCourse = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const handleTogglePublish = async (courseId: string, isCurrentlyPublished: boolean) => {
    try {
      if (isCurrentlyPublished) {
        await courseService.unpublishCourse(courseId);
      } else {
        await courseService.publishCourse(courseId);
      }
      loadCourses();
    } catch (err: any) {
      alert(err?.message || 'Failed to update course');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      await courseService.deleteCourse(courseId);
      loadCourses();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete course');
    }
  };

  // Calculate stats
  const totalCourses = courses.length;
  const publishedCourses = courses.filter((c) => c.is_published).length;
  const totalEnrollments = courses.reduce((sum, c) => sum + c.enrollment_count, 0);
  const totalRevenue = courses.reduce(
    (sum, c) => sum + c.enrollment_count * Number(c.price) * 0.6,
    0
  );
  const averageRating =
    courses.length > 0
      ? courses.reduce((sum, c) => sum + Number(c.average_rating), 0) / courses.length
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
              <p className="mt-2 text-gray-600">Manage your courses and track performance</p>
            </div>
            <button
              onClick={handleCreateCourse}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5" />
              Create Course
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <StatsCard
            icon={AcademicCapIcon}
            label="Total Courses"
            value={totalCourses}
            color="blue"
          />
          <StatsCard
            icon={EyeIcon}
            label="Published"
            value={publishedCourses}
            color="green"
          />
          <StatsCard
            icon={UserGroupIcon}
            label="Enrollments"
            value={totalEnrollments}
            color="purple"
          />
          <StatsCard
            icon={StarIcon}
            label="Avg Rating"
            value={averageRating.toFixed(1)}
            color="yellow"
          />
          <StatsCard
            icon={CurrencyDollarIcon}
            label="Total Revenue"
            value={`KES ${totalRevenue.toFixed(0)}`}
            color="green"
          />
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Courses ({courses.length})
            </button>
            <button
              onClick={() => setFilter('published')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'published'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Published ({publishedCourses})
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'draft'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Drafts ({totalCourses - publishedCourses})
            </button>
          </div>
        </div>

        {/* Courses List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">{error}</div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <AcademicCapIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first course to start teaching students
            </p>
            <button
              onClick={handleCreateCourse}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Course
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEdit={() => handleEditCourse(course.id)}
                onView={() => handleViewCourse(course.id)}
                onTogglePublish={() => handleTogglePublish(course.id, course.is_published)}
                onDelete={() => handleDeleteCourse(course.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Stats Card Component
// ============================================================================

interface StatsCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: string | number;
  color: 'blue' | 'green' | 'purple' | 'yellow';
}

function StatsCard({ icon: Icon, label, value, color }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Course Card Component
// ============================================================================

interface CourseCardProps {
  course: Course;
  onEdit: () => void;
  onView: () => void;
  onTogglePublish: () => void;
  onDelete: () => void;
}

function CourseCard({ course, onEdit, onView, onTogglePublish, onDelete }: CourseCardProps) {
  const revenue = course.enrollment_count * Number(course.price) * 0.6;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start gap-6">
        {/* Thumbnail */}
        <div className="flex-shrink-0">
          <div className="w-48 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            {course.thumbnail_url ? (
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <AcademicCapIcon className="h-12 w-12 text-white opacity-50" />
            )}
          </div>
        </div>

        {/* Course Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">{course.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
            </div>
            <div className="flex items-center gap-2">
              {course.is_published ? (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  Published
                </span>
              ) : (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  Draft
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 my-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <UserGroupIcon className="h-4 w-4" />
              <span>{course.enrollment_count} students</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <StarIcon className="h-4 w-4" />
              <span>
                {Number(course.average_rating).toFixed(1)} ({course.total_reviews} reviews)
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CurrencyDollarIcon className="h-4 w-4" />
              <span>
                {courseService.isFree(course) ? 'Free' : `KES ${course.price} per enrollment`}
              </span>
            </div>
            {!courseService.isFree(course) && (
              <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                <ChartBarIcon className="h-4 w-4" />
                <span>Revenue: KES {revenue.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PencilIcon className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={onView}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <EyeIcon className="h-4 w-4" />
              View
            </button>
            <button
              onClick={onTogglePublish}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                course.is_published
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {course.is_published ? (
                <>
                  <EyeSlashIcon className="h-4 w-4" />
                  Unpublish
                </>
              ) : (
                <>
                  <EyeIcon className="h-4 w-4" />
                  Publish
                </>
              )}
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
            >
              <TrashIcon className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
