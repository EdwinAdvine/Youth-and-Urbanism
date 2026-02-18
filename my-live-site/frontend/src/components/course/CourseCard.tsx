/**
 * CourseCard Component
 *
 * Reusable course card used in the catalog, home page, and category pages.
 * Supports grid (vertical) and list (horizontal) variants.
 * Dark theme design with framer-motion animations.
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Users, Clock, GraduationCap, Award } from 'lucide-react';
import type { Course } from '../../types/course';
import courseService from '../../services/courseService';

// ============================================================================
// Star Rating Component
// ============================================================================

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
}

export function StarRating({ rating, maxStars = 5, size = 14 }: StarRatingProps) {
  const numericRating = Number(rating) || 0;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxStars }, (_, i) => {
        const fillPercentage = Math.min(Math.max(numericRating - i, 0), 1) * 100;

        return (
          <div key={i} className="relative" style={{ width: size, height: size }}>
            {/* Empty star (background) */}
            <Star
              size={size}
              className="absolute inset-0 text-gray-600"
              strokeWidth={1.5}
            />
            {/* Filled star (foreground with clip) */}
            {fillPercentage > 0 && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercentage}%` }}
              >
                <Star
                  size={size}
                  className="text-yellow-400 fill-yellow-400"
                  strokeWidth={1.5}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// CourseCard Props
// ============================================================================

export interface CourseCardProps {
  course: Course;
  variant?: 'grid' | 'list';
  onNavigate?: (courseId: string) => void;
}

// ============================================================================
// CourseCard Component
// ============================================================================

export default function CourseCard({
  course,
  variant = 'grid',
  onNavigate,
}: CourseCardProps) {
  const navigate = useNavigate();
  const isFree = courseService.isFree(course);
  const priceText = courseService.formatPrice(course);

  const handleClick = () => {
    if (onNavigate) {
      onNavigate(course.id);
    } else {
      navigate(`/courses/${course.id}`);
    }
  };

  // ========================
  // Grid Variant (vertical)
  // ========================
  if (variant === 'grid') {
    return (
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onClick={handleClick}
        className="group cursor-pointer bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden
                   hover:border-[#333a40] hover:shadow-xl hover:shadow-black/30 transition-colors duration-200"
      >
        {/* Thumbnail */}
        <div className="relative h-44 overflow-hidden">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#E40000]/80 via-[#8B0000]/60 to-[#1a1a2e] flex items-center justify-center">
              <GraduationCap size={48} className="text-gray-400 dark:text-white/40" />
            </div>
          )}

          {/* Featured Badge */}
          {course.is_featured && (
            <span className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 bg-amber-500/90 backdrop-blur-sm text-amber-950 text-xs font-bold rounded-md">
              <Award size={12} />
              Featured
            </span>
          )}

          {/* Price Badge (overlay) */}
          <span
            className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-bold rounded-md backdrop-blur-sm ${
              isFree
                ? 'bg-emerald-500/90 text-gray-900 dark:text-white'
                : 'bg-white dark:bg-[#181C1F]/80 text-gray-900 dark:text-white border border-gray-200 dark:border-[#22272B]'
            }`}
          >
            {priceText}
          </span>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-3">
          {/* Learning area tag */}
          <span className="self-start text-[11px] font-medium uppercase tracking-wider text-gray-500 bg-gray-100 dark:bg-[#22272B] px-2 py-0.5 rounded">
            {course.learning_area}
          </span>

          {/* Title */}
          <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-red-400 transition-colors">
            {course.title}
          </h3>

          {/* Instructor */}
          {course.instructor_id && (
            <p className="text-xs text-gray-500">
              by <span className="text-gray-400">{course.instructor_id}</span>
            </p>
          )}

          {/* Rating row */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-yellow-400">
              {Number(course.average_rating).toFixed(1)}
            </span>
            <StarRating rating={Number(course.average_rating)} size={13} />
            <span className="text-xs text-gray-500">
              ({course.total_reviews.toLocaleString()})
            </span>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {course.estimated_duration_hours != null && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {course.estimated_duration_hours}h
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users size={12} />
              {course.enrollment_count.toLocaleString()}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  // ========================
  // List Variant (horizontal)
  // ========================
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={handleClick}
      className="group cursor-pointer bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden
                 hover:border-[#333a40] hover:shadow-xl hover:shadow-black/30 transition-colors duration-200
                 flex flex-col sm:flex-row"
    >
      {/* Thumbnail */}
      <div className="relative w-full sm:w-64 md:w-72 h-44 sm:h-auto flex-shrink-0 overflow-hidden">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#E40000]/80 via-[#8B0000]/60 to-[#1a1a2e] flex items-center justify-center min-h-[160px]">
            <GraduationCap size={48} className="text-gray-400 dark:text-white/40" />
          </div>
        )}

        {/* Featured Badge */}
        {course.is_featured && (
          <span className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 bg-amber-500/90 backdrop-blur-sm text-amber-950 text-xs font-bold rounded-md">
            <Award size={12} />
            Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col justify-between flex-1 min-w-0">
        <div>
          {/* Learning area tag */}
          <span className="inline-block text-[11px] font-medium uppercase tracking-wider text-gray-500 bg-gray-100 dark:bg-[#22272B] px-2 py-0.5 rounded mb-2">
            {course.learning_area}
          </span>

          {/* Title */}
          <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-red-400 transition-colors mb-1">
            {course.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-400 line-clamp-2 mb-3">
            {course.description}
          </p>

          {/* Instructor */}
          {course.instructor_id && (
            <p className="text-xs text-gray-500 mb-2">
              by <span className="text-gray-400">{course.instructor_id}</span>
            </p>
          )}
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            {/* Rating */}
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-yellow-400">
                {Number(course.average_rating).toFixed(1)}
              </span>
              <StarRating rating={Number(course.average_rating)} size={13} />
              <span className="text-xs text-gray-500">
                ({course.total_reviews.toLocaleString()})
              </span>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {course.estimated_duration_hours != null && (
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {course.estimated_duration_hours}h
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users size={12} />
                {course.enrollment_count.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Price */}
          <span
            className={`px-3 py-1 text-sm font-bold rounded-md ${
              isFree
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-gray-100 dark:bg-[#22272B] text-gray-900 dark:text-white'
            }`}
          >
            {priceText}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
