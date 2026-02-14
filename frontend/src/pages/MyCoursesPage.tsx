/**
 * My Courses Page
 *
 * Student dashboard for viewing enrolled courses and tracking progress.
 *
 * Features:
 * - View all enrolled courses
 * - Filter by status (active, completed)
 * - Track course progress
 * - Continue learning
 * - View certificates
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AcademicCapIcon,
  ClockIcon,
  ChartBarIcon,
  TrophyIcon,
  PlayIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

import courseService from '../services/courseService';
import type { Enrollment } from '../types/course';

export default function MyCoursesPage() {
  const navigate = useNavigate();

  // State
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');

  // Load enrollments
  useEffect(() => {
    loadEnrollments();
  }, [filterStatus]);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);

      let data: Enrollment[];
      if (filterStatus === 'all') {
        data = await courseService.getMyEnrollments();
      } else {
        data = await courseService.getMyEnrollments({ status: filterStatus });
      }

      setEnrollments(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load enrollments');
      console.error('Error loading enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueLearning = (courseId: string) => {
    // TODO: Navigate to lesson player
    navigate(`/courses/${courseId}/learn`);
  };

  const handleViewCourse = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  // Filter enrollments
  const filteredEnrollments = enrollments;

  // Calculate stats
  const totalEnrollments = enrollments.length;
  const activeCount = enrollments.filter((e) => e.status === 'active').length;
  const completedCount = enrollments.filter((e) => e.is_completed).length;
  const totalTimeSpent = enrollments.reduce((sum, e) => sum + e.total_time_spent_minutes, 0);
  const averageProgress =
    enrollments.length > 0
      ? enrollments.reduce((sum, e) => sum + Number(e.progress_percentage), 0) / enrollments.length
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="mt-2 text-gray-600">Track your learning progress and continue where you left off</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={AcademicCapIcon}
            label="Total Courses"
            value={totalEnrollments}
            color="blue"
          />
          <StatsCard
            icon={ChartBarIcon}
            label="In Progress"
            value={activeCount}
            color="orange"
          />
          <StatsCard
            icon={TrophyIcon}
            label="Completed"
            value={completedCount}
            color="green"
          />
          <StatsCard
            icon={ClockIcon}
            label="Time Spent"
            value={courseService.formatTimeSpent(totalTimeSpent)}
            color="purple"
          />
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-gray-900 dark:text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Courses ({totalEnrollments})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filterStatus === 'active'
                  ? 'bg-blue-600 text-gray-900 dark:text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              In Progress ({activeCount})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filterStatus === 'completed'
                  ? 'bg-blue-600 text-gray-900 dark:text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>
        </div>

        {/* Course List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">{error}</div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <AcademicCapIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-6">
              {filterStatus === 'all'
                ? "You haven't enrolled in any courses yet."
                : `You don't have any ${filterStatus} courses.`}
            </p>
            <button
              onClick={() => navigate('/courses')}
              className="px-6 py-2 bg-blue-600 text-gray-900 dark:text-white rounded-lg hover:bg-blue-700"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEnrollments.map((enrollment) => (
              <CourseEnrollmentCard
                key={enrollment.id}
                enrollment={enrollment}
                onContinue={() => handleContinueLearning(enrollment.course_id)}
                onView={() => handleViewCourse(enrollment.course_id)}
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
  color: 'blue' | 'orange' | 'green' | 'purple';
}

function StatsCard({ icon: Icon, label, value, color }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    orange: 'bg-orange-100 text-orange-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
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
// Course Enrollment Card Component
// ============================================================================

interface CourseEnrollmentCardProps {
  enrollment: Enrollment;
  onContinue: () => void;
  onView: () => void;
}

function CourseEnrollmentCard({ enrollment, onContinue, onView }: CourseEnrollmentCardProps) {
  const progress = Number(enrollment.progress_percentage);
  const isCompleted = enrollment.is_completed;
  const timeSpent = courseService.formatTimeSpent(enrollment.total_time_spent_minutes);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start gap-6">
        {/* Course Thumbnail Placeholder */}
        <div className="flex-shrink-0">
          <div className="w-48 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <AcademicCapIcon className="h-12 w-12 text-gray-900 dark:text-white opacity-50" />
          </div>
        </div>

        {/* Course Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Course Title
                {/* TODO: Fetch actual course details */}
              </h3>
              <p className="text-sm text-gray-600">
                Enrolled on {new Date(enrollment.enrolled_at).toLocaleDateString()}
              </p>
            </div>
            {isCompleted && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <CheckCircleIcon className="h-4 w-4" />
                Completed
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-medium text-gray-900">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  isCompleted ? 'bg-green-600' : 'bg-blue-600'
                }`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4" />
              <span>{enrollment.completed_lessons.length} lessons completed</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4" />
              <span>{timeSpent} spent</span>
            </div>
            {enrollment.current_grade && (
              <div className="flex items-center gap-2">
                <ChartBarIcon className="h-4 w-4" />
                <span>Grade: {enrollment.current_grade}%</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {isCompleted ? (
              <>
                <button
                  onClick={onView}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  View Course
                </button>
                {enrollment.certificate_id && (
                  <button className="px-4 py-2 bg-blue-600 text-gray-900 dark:text-white rounded-lg hover:bg-blue-700">
                    Download Certificate
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={onContinue}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-gray-900 dark:text-white rounded-lg hover:bg-blue-700"
                >
                  <PlayIcon className="h-4 w-4" />
                  Continue Learning
                </button>
                <button
                  onClick={onView}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  View Details
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
