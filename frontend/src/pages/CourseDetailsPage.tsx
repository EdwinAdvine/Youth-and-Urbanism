/**
 * Course Details Page
 *
 * Displays full course information including:
 * - Course overview and description
 * - Syllabus and lessons
 * - Instructor information
 * - Ratings and reviews
 * - Enrollment button/status
 *
 * Features:
 * - Enroll in course
 * - View enrollment status
 * - Access course content (if enrolled)
 * - Submit ratings and reviews
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AcademicCapIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon,
  PlayIcon,
  BookOpenIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

import courseService from '../services/courseService';
import type { CourseWithDetails, Enrollment } from '../types/course';

export default function CourseDetailsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  // State
  const [course, setCourse] = useState<CourseWithDetails | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'syllabus' | 'reviews'>('overview');

  // Load course details and enrollment status
  useEffect(() => {
    if (courseId) {
      loadCourseDetails();
      checkEnrollmentStatus();
    }
  }, [courseId]);

  const loadCourseDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await courseService.getCourseDetails(courseId!);
      setCourse(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load course details');
      console.error('Error loading course:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    try {
      const enrollmentData = await courseService.getEnrollmentForCourse(courseId!);
      setEnrollment(enrollmentData);
    } catch (err) {
      console.error('Error checking enrollment:', err);
    }
  };

  const handleEnroll = async () => {
    if (!course) return;

    // Check if payment is required
    if (course.price > 0) {
      // TODO: Navigate to payment page
      alert('Payment integration not yet implemented. This is a paid course.');
      return;
    }

    try {
      setEnrolling(true);
      const newEnrollment = await courseService.enrollInCourse(courseId!);
      setEnrollment(newEnrollment);
      alert('Successfully enrolled in course!');
    } catch (err: any) {
      alert(err?.message || 'Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartLearning = () => {
    // TODO: Navigate to lesson player
    navigate(`/courses/${courseId}/learn`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The course you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/courses')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const isEnrolled = enrollment !== null;
  const isFree = courseService.isFree(course);
  const priceText = courseService.formatPrice(course);

  // Render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <StarIconSolid key={i} className="h-5 w-5 text-yellow-400" />
        ) : (
          <StarIcon key={i} className="h-5 w-5 text-gray-300" />
        )
      );
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-6"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Courses
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  {course.learning_area}
                </span>
                {course.is_featured && (
                  <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-sm font-semibold">
                    Featured
                  </span>
                )}
              </div>

              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-white/90 mb-6">{course.description}</p>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <UserGroupIcon className="h-5 w-5" />
                  <span>{course.enrollment_count} students</span>
                </div>
                {course.estimated_duration_hours && (
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-5 w-5" />
                    <span>{course.estimated_duration_hours} hours</span>
                  </div>
                )}
                {course.total_reviews > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex">{renderStars(Number(course.average_rating))}</div>
                    <span>({course.total_reviews} reviews)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Enrollment Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6">
                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Price</span>
                    {!isFree && <CurrencyDollarIcon className="h-5 w-5 text-gray-600" />}
                  </div>
                  <p className={`text-3xl font-bold ${isFree ? 'text-green-600' : 'text-gray-900'}`}>
                    {priceText}
                  </p>
                </div>

                {/* Enrollment Status/Button */}
                {isEnrolled ? (
                  <>
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircleIcon className="h-5 w-5" />
                        <span className="font-medium">Enrolled</span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        Progress: {enrollment.progress_percentage}%
                      </p>
                    </div>
                    <button
                      onClick={handleStartLearning}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      <PlayIcon className="h-5 w-5" />
                      Continue Learning
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enrolling ? 'Enrolling...' : isFree ? 'Enroll For Free' : 'Enroll Now'}
                  </button>
                )}

                {/* Course Includes */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-gray-900 mb-3">This course includes:</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                      {course.lessons.length} lessons
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                      Full lifetime access
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                      Certificate of completion
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-4 px-1 border-b-2 font-medium ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('syllabus')}
              className={`pb-4 px-1 border-b-2 font-medium ${
                activeTab === 'syllabus'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Syllabus
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 px-1 border-b-2 font-medium ${
                activeTab === 'reviews'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Reviews
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Course</h2>
              <div className="prose max-w-none">
                <p className="text-gray-600">{course.description}</p>

                {course.syllabus?.overview && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Overview</h3>
                    <p className="text-gray-600">{course.syllabus.overview}</p>
                  </div>
                )}

                {course.syllabus?.learning_outcomes && course.syllabus.learning_outcomes.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Learning Outcomes</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                      {course.syllabus.learning_outcomes.map((outcome, idx) => (
                        <li key={idx}>{outcome}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'syllabus' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Syllabus</h2>
              <div className="space-y-4">
                {course.lessons && course.lessons.length > 0 ? (
                  course.lessons.map((lesson, idx) => (
                    <div key={lesson.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <BookOpenIcon className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {idx + 1}. {lesson.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                          {lesson.duration_minutes && (
                            <p className="text-xs text-gray-500 mt-2">
                              Duration: {lesson.duration_minutes} minutes
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No lessons available yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Reviews</h2>
              {course.total_reviews > 0 ? (
                <div>
                  <div className="mb-6">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl font-bold text-gray-900">
                        {Number(course.average_rating).toFixed(1)}
                      </div>
                      <div>
                        <div className="flex">{renderStars(Number(course.average_rating))}</div>
                        <p className="text-sm text-gray-600 mt-1">
                          Based on {course.total_reviews} reviews
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600">Individual reviews will be displayed here.</p>
                </div>
              ) : (
                <p className="text-gray-600">No reviews yet. Be the first to review this course!</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
