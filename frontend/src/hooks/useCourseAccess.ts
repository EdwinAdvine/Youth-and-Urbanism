/**
 * useCourseAccess
 *
 * Encapsulates the smart CTA logic for the public course landing page.
 * When a user clicks the enroll / access button:
 *   - If not authenticated → opens the AuthModal
 *   - After login/signup (or if already authenticated) → navigates to the
 *     most relevant page for that user's role
 *
 * Routing table:
 *   student    → /dashboard/student/browse/course/:id  (grade-check done by backend)
 *   admin      → /dashboard/admin/courses?course=:id
 *   staff      → /dashboard/staff/learning/content/editor/:id
 *   parent     → /dashboard/parent/learning-journey
 *   instructor → /dashboard/instructor/courses/:id/enrollments  (if they own the course)
 *              → /dashboard/instructor/courses                  (otherwise)
 *   partner    → /dashboard/partner/enrollments
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { User } from '../services/authService';
import type { CourseWithDetails } from '../types/course';

interface UseCourseAccessReturn {
  isAuthModalOpen: boolean;
  closeAuthModal: () => void;
  /** Pass directly to AuthModal's onAuthSuccess prop */
  handleAuthSuccess: (user: User) => void;
  /** Single entry point for the CTA button's onClick */
  handleCTAClick: () => void;
  /** Dynamic button label based on current auth + role state */
  ctaLabel: string;
}

function getDestination(user: User, course: CourseWithDetails): string {
  switch (user.role) {
    case 'student':
      return `/dashboard/student/browse/course/${course.id}`;
    case 'admin':
      return `/dashboard/admin/courses?course=${course.id}`;
    case 'staff':
      return `/dashboard/staff/learning/content/editor/${course.id}`;
    case 'parent':
      return `/dashboard/parent/learning-journey`;
    case 'instructor':
      if (course.instructor_id && course.instructor_id === user.id) {
        return `/dashboard/instructor/courses/${course.id}/enrollments`;
      }
      return `/dashboard/instructor/courses`;
    case 'partner':
      return `/dashboard/partner/enrollments`;
    default:
      return `/dashboard/${user.role}`;
  }
}

function getCTALabel(user: User | null, course: CourseWithDetails | null): string {
  if (!user) return 'Get Started';
  switch (user.role) {
    case 'student':
      return 'View Course';
    case 'admin':
      return 'Manage Course';
    case 'staff':
      return 'Edit Content';
    case 'parent':
      return 'Track Progress';
    case 'instructor':
      return course?.instructor_id === user.id ? 'View Enrollments' : 'Browse Courses';
    case 'partner':
      return 'View Enrollments';
    default:
      return 'Go to Dashboard';
  }
}

export function useCourseAccess(course: CourseWithDetails | null): UseCourseAccessReturn {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const handleCTAClick = () => {
    if (isAuthenticated && user && course) {
      navigate(getDestination(user, course));
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = (freshUser: User) => {
    setIsAuthModalOpen(false);
    if (!course) return;
    navigate(getDestination(freshUser, course));
  };

  return {
    isAuthModalOpen,
    closeAuthModal: () => setIsAuthModalOpen(false),
    handleAuthSuccess,
    handleCTAClick,
    ctaLabel: getCTALabel(user, course),
  };
}
