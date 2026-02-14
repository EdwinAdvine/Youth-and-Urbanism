/**
 * Lesson Player Page
 *
 * Content delivery interface for students learning courses.
 *
 * Features:
 * - Lesson navigation (previous/next)
 * - Video player / content viewer
 * - Progress tracking
 * - Mark lesson as complete
 * - Sidebar with lesson list
 * - Quiz integration
 * - Notes and resources
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  BookOpenIcon,
  PlayIcon,
  DocumentTextIcon,
  XMarkIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

import courseService from '../services/courseService';
import type { CourseWithDetails, Lesson, Enrollment } from '../types/course';

export default function LessonPlayerPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  // State
  const [course, setCourse] = useState<CourseWithDetails | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load course and enrollment
  useEffect(() => {
    if (courseId) {
      loadCourseData();
    }
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [courseData, enrollmentData] = await Promise.all([
        courseService.getCourseDetails(courseId!),
        courseService.getEnrollmentForCourse(courseId!),
      ]);

      setCourse(courseData);
      setEnrollment(enrollmentData);

      // Find first incomplete lesson or start from beginning
      if (enrollmentData && courseData.lessons) {
        const firstIncomplete = courseData.lessons.findIndex(
          (lesson) => !enrollmentData.completed_lessons.includes(lesson.id)
        );
        if (firstIncomplete !== -1) {
          setCurrentLessonIndex(firstIncomplete);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!enrollment || !currentLesson) return;

    try {
      setMarkingComplete(true);
      await courseService.completeLesson(enrollment.id, {
        lesson_id: currentLesson.id,
        time_spent_minutes: 0, // TODO: Track actual time spent
      });

      // Update enrollment state
      const updatedEnrollment = await courseService.getEnrollmentForCourse(courseId!);
      setEnrollment(updatedEnrollment);

      // Auto-advance to next lesson
      if (canGoNext) {
        setCurrentLessonIndex(currentLessonIndex + 1);
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to mark lesson complete');
    } finally {
      setMarkingComplete(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || !course || !enrollment) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Unable to Load Course</h2>
          <p className="text-gray-400 mb-4">{error || 'Course not found or not enrolled'}</p>
          <button
            onClick={() => navigate('/courses')}
            className="px-4 py-2 bg-blue-600 text-gray-900 dark:text-white rounded-lg hover:bg-blue-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const currentLesson = course.lessons[currentLessonIndex];
  const isLessonComplete = enrollment.completed_lessons.includes(currentLesson?.id);
  const canGoPrevious = currentLessonIndex > 0;
  const canGoNext = currentLessonIndex < course.lessons.length - 1;

  const progress = enrollment.progress_percentage;

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar - Lesson List */}
      <div
        className={`${
          sidebarOpen ? 'w-80' : 'w-0'
        } bg-gray-800 transition-all duration-300 overflow-hidden flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-gray-900 dark:text-white truncate">{course.title}</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
              <span>Progress</span>
              <span>{Math.round(Number(progress))}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Lesson List */}
        <div className="flex-1 overflow-y-auto">
          {course.lessons.map((lesson, index) => {
            const isComplete = enrollment.completed_lessons.includes(lesson.id);
            const isCurrent = index === currentLessonIndex;

            return (
              <button
                key={lesson.id}
                onClick={() => setCurrentLessonIndex(index)}
                className={`w-full p-4 border-b border-gray-700 text-left hover:bg-gray-700 transition-colors ${
                  isCurrent ? 'bg-gray-700' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {isComplete ? (
                      <CheckCircleSolid className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-600"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isCurrent ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-300'}`}>
                      {index + 1}. {lesson.title}
                    </p>
                    {lesson.duration_minutes && (
                      <p className="text-xs text-gray-500 mt-1">
                        {lesson.duration_minutes} min
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Exit Button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="w-full px-4 py-2 bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-600"
          >
            Exit Course
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
              )}
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{currentLesson?.title}</h1>
                <p className="text-sm text-gray-400 mt-1">
                  Lesson {currentLessonIndex + 1} of {course.lessons.length}
                </p>
              </div>
            </div>

            {isLessonComplete ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-900/30 text-green-400 rounded-lg">
                <CheckCircleIcon className="h-5 w-5" />
                Completed
              </div>
            ) : (
              <button
                onClick={handleMarkComplete}
                disabled={markingComplete}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-gray-900 dark:text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircleIcon className="h-5 w-5" />
                {markingComplete ? 'Marking...' : 'Mark Complete'}
              </button>
            )}
          </div>
        </div>

        {/* Content Player */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-8">
            {currentLesson?.type === 'video' && (
              <VideoPlayer lesson={currentLesson} />
            )}
            {currentLesson?.type === 'reading' && (
              <ReadingContent lesson={currentLesson} />
            )}
            {currentLesson?.type === 'quiz' && (
              <QuizContent lesson={currentLesson} />
            )}
            {!['video', 'reading', 'quiz'].includes(currentLesson?.type) && (
              <DefaultContent lesson={currentLesson} />
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <button
              onClick={() => setCurrentLessonIndex(currentLessonIndex - 1)}
              disabled={!canGoPrevious}
              className="flex items-center gap-2 px-6 py-2 bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="h-5 w-5" />
              Previous
            </button>

            <div className="text-sm text-gray-400">
              {currentLessonIndex + 1} / {course.lessons.length}
            </div>

            <button
              onClick={() => setCurrentLessonIndex(currentLessonIndex + 1)}
              disabled={!canGoNext}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-gray-900 dark:text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Content Type Components
// ============================================================================

function VideoPlayer({ lesson }: { lesson: Lesson }) {
  return (
    <div className="space-y-6">
      {/* Video Player Placeholder */}
      <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
        {lesson.content_url ? (
          <video
            src={lesson.content_url}
            controls
            className="w-full h-full rounded-lg"
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="text-center">
            <PlayIcon className="mx-auto h-16 w-16 text-gray-600 mb-4" />
            <p className="text-gray-400">Video content will appear here</p>
            <p className="text-sm text-gray-500 mt-2">URL: {lesson.content_url || 'Not available'}</p>
          </div>
        )}
      </div>

      {/* Lesson Description */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">About this lesson</h2>
        <p className="text-gray-400 dark:text-gray-300">{lesson.description}</p>
      </div>

      {/* Resources */}
      {lesson.resources && lesson.resources.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Resources</h2>
          <div className="space-y-2">
            {lesson.resources.map((resource) => (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <DocumentTextIcon className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{resource.title}</p>
                  <p className="text-xs text-gray-400">{resource.type}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ReadingContent({ lesson }: { lesson: Lesson }) {
  return (
    <div className="bg-gray-800 rounded-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <BookOpenIcon className="h-8 w-8 text-blue-400" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reading Material</h2>
      </div>
      <div className="prose prose-invert max-w-none">
        <p className="text-gray-400 dark:text-gray-300 leading-relaxed">{lesson.description}</p>
        {lesson.content_url && (
          <div className="mt-6">
            <a
              href={lesson.content_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-gray-900 dark:text-white rounded-lg hover:bg-blue-700"
            >
              <DocumentTextIcon className="h-5 w-5" />
              Open Reading Material
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function QuizContent({ lesson }: { lesson: Lesson }) {
  return (
    <div className="bg-gray-800 rounded-lg p-8">
      <div className="text-center">
        <CheckCircleIcon className="mx-auto h-16 w-16 text-yellow-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Quiz</h2>
        <p className="text-gray-400 dark:text-gray-300 mb-6">{lesson.description}</p>
        <button className="px-6 py-3 bg-yellow-600 text-gray-900 dark:text-white rounded-lg hover:bg-yellow-700">
          Start Quiz
        </button>
        <p className="text-sm text-gray-500 mt-4">
          Quiz integration coming soon
        </p>
      </div>
    </div>
  );
}

function DefaultContent({ lesson }: { lesson: Lesson }) {
  return (
    <div className="bg-gray-800 rounded-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{lesson.title}</h2>
      <p className="text-gray-400 dark:text-gray-300 leading-relaxed">{lesson.description}</p>
      {lesson.content_url && (
        <div className="mt-6">
          <a
            href={lesson.content_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-gray-900 dark:text-white rounded-lg hover:bg-blue-700"
          >
            View Content
          </a>
        </div>
      )}
    </div>
  );
}
