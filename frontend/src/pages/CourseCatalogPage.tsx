/**
 * Course Catalog Page
 *
 * This page displays all available courses with search and filtering capabilities.
 * Students can browse courses, view details, and enroll.
 *
 * Features:
 * - Grid/list view toggle
 * - Search by title/description
 * - Filter by grade level, learning area
 * - Sort by rating, price, enrollment count
 * - Course enrollment
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  AcademicCapIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

import courseService from '../services/courseService';
import type {
  Course,
  CourseFilterParams,
  LearningArea,
  GradeLevel,
} from '../types/course';

export default function CourseCatalogPage() {
  const navigate = useNavigate();

  // State
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<GradeLevel | ''>('');
  const [selectedLearningArea, setSelectedLearningArea] = useState<LearningArea | ''>('');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [showFilters, setShowFilters] = useState(false);

  // Load courses
  useEffect(() => {
    loadCourses();
  }, [searchQuery, selectedGradeLevel, selectedLearningArea, showFeaturedOnly, currentPage]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: CourseFilterParams = {
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
      };

      if (searchQuery) params.search = searchQuery;
      if (selectedGradeLevel) params.grade_level = selectedGradeLevel;
      if (selectedLearningArea) params.learning_area = selectedLearningArea;
      if (showFeaturedOnly) params.is_featured = true;

      const response = await courseService.listCourses(params);
      setCourses(response.courses);
      setTotal(response.total);
    } catch (err: any) {
      setError(err?.message || 'Failed to load courses');
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      // Navigate to course details page where enrollment happens
      navigate(`/courses/${courseId}`);
    } catch (err: any) {
      alert(err?.message || 'Failed to enroll in course');
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedGradeLevel('');
    setSelectedLearningArea('');
    setShowFeaturedOnly(false);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(total / itemsPerPage);
  const hasActiveFilters = searchQuery || selectedGradeLevel || selectedLearningArea || showFeaturedOnly;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Course Catalog</h1>
              <p className="mt-2 text-gray-600">
                Browse our CBC-aligned courses and start learning
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FunnelIcon className="h-5 w-5" />
              Filters
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 p-6 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Grade Level Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade Level
                  </label>
                  <select
                    value={selectedGradeLevel}
                    onChange={(e) => setSelectedGradeLevel(e.target.value as GradeLevel | '')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Grades</option>
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Grade 3">Grade 3</option>
                    <option value="Grade 4">Grade 4</option>
                    <option value="Grade 5">Grade 5</option>
                    <option value="Grade 6">Grade 6</option>
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>

                {/* Learning Area Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Learning Area
                  </label>
                  <select
                    value={selectedLearningArea}
                    onChange={(e) => setSelectedLearningArea(e.target.value as LearningArea | '')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Areas</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science and Technology">Science and Technology</option>
                    <option value="Languages">Languages</option>
                    <option value="English">English</option>
                    <option value="Kiswahili">Kiswahili</option>
                    <option value="Social Studies">Social Studies</option>
                    <option value="Creative Arts">Creative Arts</option>
                    <option value="Physical Education">Physical Education</option>
                  </select>
                </div>

                {/* Featured Filter */}
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showFeaturedOnly}
                      onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Featured Courses Only
                    </span>
                  </label>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Results Info */}
          <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
            <p>
              Showing {courses.length} of {total} courses
            </p>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
            {error}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onEnroll={handleEnroll}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Course Card Component
// ============================================================================

interface CourseCardProps {
  course: Course;
  onEnroll: (courseId: string) => void;
}

function CourseCard({ course, onEnroll }: CourseCardProps) {
  const isFree = courseService.isFree(course);
  const priceText = courseService.formatPrice(course);

  // Render star rating
  const renderStars = () => {
    const stars = [];
    const rating = Number(course.average_rating);

    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />
        ) : (
          <StarIcon key={i} className="h-4 w-4 text-gray-300" />
        )
      );
    }
    return stars;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <AcademicCapIcon className="h-16 w-16 text-white opacity-50" />
          </div>
        )}
        {course.is_featured && (
          <span className="absolute top-2 right-2 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-semibold rounded">
            Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {course.description}
        </p>

        {/* Meta Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <AcademicCapIcon className="h-4 w-4" />
            <span>{course.learning_area}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <UserGroupIcon className="h-4 w-4" />
            <span>{course.enrollment_count} students</span>
          </div>
          {course.estimated_duration_hours && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ClockIcon className="h-4 w-4" />
              <span>{course.estimated_duration_hours} hours</span>
            </div>
          )}
        </div>

        {/* Rating */}
        {course.total_reviews > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">{renderStars()}</div>
            <span className="text-sm text-gray-600">
              ({course.total_reviews} reviews)
            </span>
          </div>
        )}

        {/* Price and CTA */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            {!isFree && <CurrencyDollarIcon className="h-5 w-5 text-gray-600" />}
            <span className={`font-semibold ${isFree ? 'text-green-600' : 'text-gray-900'}`}>
              {priceText}
            </span>
          </div>
          <button
            onClick={() => onEnroll(course.id)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
