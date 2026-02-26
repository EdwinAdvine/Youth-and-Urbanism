/**
 * Course Details Page (Phase 3 - Dark Theme Rewrite)
 *
 * Displays full course information with dark theme styling.
 * Features:
 * - Hero banner with thumbnail / gradient
 * - Course overview, syllabus, reviews tabs
 * - Enrollment card with price and CTA
 * - Lesson list with lock icons for non-enrolled
 * - Responsive design
 * - framer-motion animations
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  GraduationCap,
  Clock,
  Users,
  Play,
  BookOpen,
  CheckCircle,
  Lock,
  Award,
  FileText,
  BarChart3,
  Globe,
  Loader2,
} from 'lucide-react';

import courseService from '../services/courseService';
import { StarRating } from '../components/course/CourseCard';
import AuthModal from '../components/auth/AuthModal';
import { useCourseAccess } from '../hooks/useCourseAccess';
import { getCbcDataByCourseCode, getCbcSubjectData, getGradeStage } from '../utils/cbcLookup';
import type { CourseWithDetails, Enrollment } from '../types/course';

// ============================================================================
// Main Component
// ============================================================================

export default function CourseDetailsPage() {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State
  const [course, setCourse] = useState<CourseWithDetails | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'syllabus' | 'reviews'>('overview');

  // Smart role-based CTA: auth check + routing
  const { isAuthModalOpen, closeAuthModal, handleAuthSuccess, handleCTAClick, ctaLabel } =
    useCourseAccess(course);

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load course details';
      setError(message);
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

  const handleStartLearning = () => {
    if (course?.lessons && course.lessons.length > 0) {
      navigate(`/courses/${courseId}/lesson/${course.lessons[0].id}`);
    } else {
      navigate(`/courses/${courseId}/learn`);
    }
  };

  // ========================
  // Loading State
  // ========================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] flex items-center justify-center">
        <Loader2 size={40} className="text-[#E40000] animate-spin" />
      </div>
    );
  }

  // ========================
  // Error / Not Found State
  // ========================
  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-4"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] flex items-center justify-center">
            <BookOpen size={36} className="text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Course Not Found</h2>
          <p className="text-gray-400 mb-6 max-w-sm mx-auto">
            {error || 'The course you are looking for does not exist or has been removed.'}
          </p>
          <button
            onClick={() => navigate('/courses')}
            className="px-5 py-2.5 bg-[#E40000] text-gray-900 dark:text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Courses
          </button>
        </motion.div>
      </div>
    );
  }

  const isEnrolled = enrollment !== null;
  const isFree = courseService.isFree(course);
  const priceText = courseService.formatPrice(course);

  // CBC curriculum lookup — course_code is the primary key (deterministic, no fuzzy matching).
  // Falls back to name-based lookup for courses without a code.
  const primaryGrade = course.grade_levels[0] ?? null;
  const cbcSubject = course.course_code
    ? getCbcDataByCourseCode(course.course_code)
    : primaryGrade
      ? getCbcSubjectData(course.learning_area, primaryGrade)
      : null;
  const gradeStage = primaryGrade ? getGradeStage(primaryGrade) : '';
  const cbcRubric = [
    { code: 'EE', label: 'Exceeding Expectations' },
    { code: 'ME', label: 'Meeting Expectations' },
    { code: 'AE', label: 'Approaching Expectations' },
    { code: 'BE', label: 'Below Expectations' },
  ];

  const tabs = [
    { key: 'overview' as const, label: 'Overview', icon: FileText },
    { key: 'syllabus' as const, label: 'Syllabus', icon: BookOpen },
    { key: 'reviews' as const, label: 'Reviews', icon: BarChart3 },
  ];

  // ========================
  // Render
  // ========================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112]">
      {/* ============================================================ */}
      {/* HERO SECTION */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden">
        {/* Background image/gradient */}
        <div className="absolute inset-0">
          {course.thumbnail_url ? (
            <>
              <img
                src={course.thumbnail_url}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-50 dark:from-[#0F1112] via-[#0F1112]/95 to-gray-50 dark:to-[#0F1112]/80" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-50 dark:from-[#0F1112] via-[#1a0000] to-gray-50 dark:to-[#0F1112]" />
          )}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          {/* Back Button */}
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">Back to Courses</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Course Info (left 2 columns) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-2"
            >
              {/* Badges */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="px-3 py-1 bg-gray-100 dark:bg-[#22272B] text-gray-400 dark:text-gray-300 rounded-full text-xs font-medium">
                  {course.learning_area}
                </span>
                {course.grade_levels.length > 0 && (
                  <span className="px-3 py-1 bg-gray-100 dark:bg-[#22272B] text-gray-400 dark:text-gray-300 rounded-full text-xs font-medium flex items-center gap-1">
                    <Globe size={12} />
                    {course.grade_levels[0]}
                    {course.grade_levels.length > 1 && ` +${course.grade_levels.length - 1}`}
                  </span>
                )}
                {course.is_featured && (
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-bold flex items-center gap-1">
                    <Award size={12} />
                    Featured
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                {course.title}
              </h1>

              {/* Description */}
              <p className="text-base lg:text-lg text-gray-400 mb-6 leading-relaxed">
                {course.description}
              </p>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-5 text-sm">
                {/* Rating */}
                {course.total_reviews > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 font-semibold">
                      {Number(course.average_rating).toFixed(1)}
                    </span>
                    <StarRating rating={Number(course.average_rating)} size={14} />
                    <span className="text-gray-500">
                      ({course.total_reviews.toLocaleString()} reviews)
                    </span>
                  </div>
                )}
                {/* Enrollment */}
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Users size={15} />
                  <span>{course.enrollment_count.toLocaleString()} students</span>
                </div>
                {/* Duration */}
                {course.estimated_duration_hours && (
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Clock size={15} />
                    <span>{course.estimated_duration_hours} hours</span>
                  </div>
                )}
                {/* Lessons */}
                {course.lessons && course.lessons.length > 0 && (
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <BookOpen size={15} />
                    <span>{course.lessons.length} lessons</span>
                  </div>
                )}
              </div>

              {/* CBC Curriculum Info — appears for every matched course */}
              {cbcSubject && (
                <div className="mt-6 pt-6 border-t border-[#22272B]">
                  {/* Stage + lessons/week */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {gradeStage && (
                      <span className="px-3 py-1 bg-[#E40000]/10 text-red-400 rounded-full text-xs font-semibold">
                        {gradeStage}
                      </span>
                    )}
                    {cbcSubject.lessonsPerWeek !== undefined && (
                      <span className="px-3 py-1 bg-[#22272B] text-gray-400 rounded-full text-xs font-medium">
                        {cbcSubject.lessonsPerWeek} lessons / week
                      </span>
                    )}
                    {course.grade_levels.length > 1 && (
                      <span className="text-xs text-gray-500 italic">
                        CBC alignment for {primaryGrade}
                      </span>
                    )}
                  </div>

                  {/* Curriculum Strands */}
                  {cbcSubject.strands.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                        Curriculum Strands
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {cbcSubject.strands.map((strand, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-[#22272B] text-gray-300 text-xs rounded-full"
                          >
                            {strand.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CBC Learning Outcomes */}
                  {cbcSubject.outcomes.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                        CBC Learning Outcomes
                      </p>
                      <ul className="space-y-1.5">
                        {cbcSubject.outcomes.map((outcome, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-300">{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Assessment Rubric */}
                  <div className="pt-4 border-t border-[#22272B]">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                      Assessment Rubric
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {cbcRubric.map(({ code, label }) => (
                        <div
                          key={code}
                          className="flex flex-col items-center text-center p-2 bg-[#22272B] rounded-lg"
                        >
                          <span className="text-sm font-bold text-white mb-0.5">{code}</span>
                          <span className="text-[11px] text-gray-500 leading-tight">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Enrollment Card (right column) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="lg:col-span-1"
            >
              <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 sticky top-6">
                {/* Price */}
                <div className="mb-5">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Price</p>
                  <p className={`text-3xl font-bold ${isFree ? 'text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                    {priceText}
                  </p>
                </div>

                {/* Enrollment Status / Button */}
                {isEnrolled ? (
                  <>
                    <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <CheckCircle size={18} />
                        <span className="font-medium text-sm">Enrolled</span>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{enrollment.progress_percentage}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 dark:bg-[#22272B] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${enrollment.progress_percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleStartLearning}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                    >
                      <Play size={18} />
                      Continue Learning
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleCTAClick}
                    className="w-full px-6 py-3 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Play size={18} />
                    {ctaLabel}
                  </button>
                )}

                {/* Course Includes */}
                <div className="mt-6 pt-5 border-t border-gray-200 dark:border-[#22272B]">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">This course includes:</h3>
                  <ul className="space-y-2.5 text-sm text-gray-400">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                      {course.lessons.length} lessons
                    </li>
                    {course.estimated_duration_hours && (
                      <li className="flex items-center gap-2.5">
                        <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                        {course.estimated_duration_hours} hours of content
                      </li>
                    )}
                    <li className="flex items-center gap-2.5">
                      <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                      Full lifetime access
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                      Certificate of completion
                    </li>
                    {course.competencies && course.competencies.length > 0 && (
                      <li className="flex items-center gap-2.5">
                        <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                        {course.competencies.length} CBC competencies covered
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TABS SECTION */}
      {/* ============================================================ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-[#22272B] mb-8">
          <nav className="flex gap-1 -mb-px">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-[#E40000] text-red-400'
                      : 'border-transparent text-gray-500 hover:text-gray-400 dark:hover:text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* ======================== */}
            {/* OVERVIEW TAB */}
            {/* ======================== */}
            {activeTab === 'overview' && (
              <div className="max-w-3xl">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-5">About This Course</h2>
                <p className="text-gray-400 leading-relaxed mb-8">
                  {course.description}
                </p>

                {cbcSubject?.description && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Curriculum Overview
                    </h3>
                    <p className="text-gray-400 leading-relaxed">{cbcSubject.description}</p>
                  </div>
                )}

                {course.syllabus?.overview && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Overview</h3>
                    <p className="text-gray-400 leading-relaxed">{course.syllabus.overview}</p>
                  </div>
                )}

                {course.syllabus?.learning_outcomes && course.syllabus.learning_outcomes.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">What You Will Learn</h3>
                    <p className="text-gray-400 leading-relaxed">
                      {course.syllabus.learning_outcomes.join('. ')}.
                    </p>
                  </div>
                )}

                {course.syllabus?.prerequisites && course.syllabus.prerequisites.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Prerequisites</h3>
                    <p className="text-gray-400 leading-relaxed">
                      {course.syllabus.prerequisites.join('. ')}.
                    </p>
                  </div>
                )}

                {/* Grade Levels */}
                {course.grade_levels.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Grade Levels</h3>
                    <div className="flex flex-wrap gap-2">
                      {course.grade_levels.map((grade) => (
                        <span
                          key={grade}
                          className="px-3 py-1.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-xs text-gray-400 dark:text-gray-300 font-medium"
                        >
                          {grade}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* ======================== */}
            {/* SYLLABUS TAB */}
            {/* ======================== */}
            {activeTab === 'syllabus' && (
              <div className="max-w-3xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Course Content</h2>
                  {course.lessons && (
                    <span className="text-sm text-gray-500">
                      {course.lessons.length} lessons
                      {course.estimated_duration_hours &&
                        ` | ${course.estimated_duration_hours} total hours`}
                    </span>
                  )}
                </div>

                {/* Syllabus modules */}
                {course.syllabus?.modules && course.syllabus.modules.length > 0 && (
                  <div className="mb-8 space-y-4">
                    {course.syllabus.modules.map((mod, idx) => (
                      <div
                        key={mod.id}
                        className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5"
                      >
                        <h3 className="text-gray-900 dark:text-white font-semibold mb-1">
                          Module {idx + 1}: {mod.title}
                        </h3>
                        <p className="text-sm text-gray-400 mb-3">{mod.description}</p>
                        {mod.topics.length > 0 && (
                          <ul className="space-y-1">
                            {mod.topics.map((topic, tidx) => (
                              <li key={tidx} className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="w-1 h-1 rounded-full bg-gray-600" />
                                {topic}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Lessons list */}
                {course.lessons && course.lessons.length > 0 ? (
                  <div className="space-y-2">
                    {course.lessons.map((lesson, idx) => {
                      const isLocked = !isEnrolled && lesson.is_locked;
                      const isCompleted = isEnrolled && lesson.is_completed;

                      return (
                        <div
                          key={lesson.id}
                          className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                            isCompleted
                              ? 'bg-emerald-500/5 border-emerald-500/20'
                              : 'bg-white dark:bg-[#181C1F] border-gray-200 dark:border-[#22272B] hover:border-[#333a40]'
                          }`}
                        >
                          {/* Number / Icon */}
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isCompleted
                                ? 'bg-emerald-500/20'
                                : isLocked
                                ? 'bg-gray-100 dark:bg-[#22272B]'
                                : 'bg-[#E40000]/10'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle size={18} className="text-emerald-400" />
                            ) : isLocked ? (
                              <Lock size={16} className="text-gray-600" />
                            ) : (
                              <span className="text-sm font-semibold text-red-400">
                                {idx + 1}
                              </span>
                            )}
                          </div>

                          {/* Lesson info */}
                          <div className="flex-1 min-w-0">
                            <h4
                              className={`text-sm font-medium ${
                                isLocked ? 'text-gray-600' : 'text-gray-900 dark:text-white'
                              }`}
                            >
                              {lesson.title}
                            </h4>
                            {lesson.description && (
                              <p className="text-xs text-gray-500 mt-0.5 truncate">
                                {lesson.description}
                              </p>
                            )}
                          </div>

                          {/* Meta */}
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {lesson.type && (
                              <span className="hidden sm:inline text-[10px] uppercase tracking-wider text-gray-600 bg-gray-100 dark:bg-[#22272B] px-2 py-0.5 rounded">
                                {lesson.type}
                              </span>
                            )}
                            {lesson.duration_minutes && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock size={12} />
                                {lesson.duration_minutes}m
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <GraduationCap size={40} className="text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500">Lesson content is being prepared. Check back soon!</p>
                  </div>
                )}
              </div>
            )}

            {/* ======================== */}
            {/* REVIEWS TAB */}
            {/* ======================== */}
            {activeTab === 'reviews' && (
              <div className="max-w-3xl">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Student Reviews</h2>

                {course.total_reviews > 0 ? (
                  <div>
                    {/* Rating summary */}
                    <div className="flex items-center gap-6 p-6 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl mb-8">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-gray-900 dark:text-white">
                          {Number(course.average_rating).toFixed(1)}
                        </div>
                        <div className="mt-2">
                          <StarRating rating={Number(course.average_rating)} size={18} />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {course.total_reviews.toLocaleString()} reviews
                        </p>
                      </div>

                      {/* Placeholder for rating distribution bars */}
                      <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 w-3">{star}</span>
                            <div className="flex-1 h-2 bg-gray-100 dark:bg-[#22272B] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-yellow-400/70 rounded-full"
                                style={{
                                  width:
                                    star === Math.round(Number(course.average_rating))
                                      ? '70%'
                                      : star > Number(course.average_rating)
                                      ? '10%'
                                      : '30%',
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <p className="text-gray-500 text-sm">
                      Individual reviews will be displayed here once the review system is fully integrated.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 size={40} className="text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500">
                      No reviews yet. Be the first to review this course after enrolling!
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Auth modal — opens when an unauthenticated user clicks the course CTA */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
