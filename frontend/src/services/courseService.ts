/**
 * Course Service - API Client for Course Management
 *
 * This service handles all HTTP requests to the backend Course API.
 * It provides methods for:
 * - Course CRUD operations
 * - Course enrollment management
 * - Progress tracking
 * - Course ratings and reviews
 */

import apiClient from './api';
import type {
  Course,
  CourseWithDetails,
  CourseCreate,
  CourseUpdate,
  CourseListResponse,
  CourseFilterParams,
  Enrollment,
  LessonCompletionRequest,
  EnrollmentRatingRequest,
  EnrollmentFilterParams,
} from '../types/course';

// ============================================================================
// Course Service
// ============================================================================

export const courseService = {
  // ========================
  // Course CRUD Operations
  // ========================

  /**
   * Create a new course
   * @param courseData Course creation data
   * @returns Created course
   */
  async createCourse(courseData: CourseCreate): Promise<Course> {
    const response = await apiClient.post<Course>('/courses/', courseData);
    return response.data;
  },

  /**
   * Get a list of courses with optional filtering
   * @param params Filter and pagination parameters
   * @returns Paginated list of courses
   */
  async listCourses(params?: CourseFilterParams): Promise<CourseListResponse> {
    const response = await apiClient.get<CourseListResponse>('/courses/', {
      params,
    });
    return response.data;
  },

  /**
   * Get detailed information about a specific course
   * @param courseId Course UUID
   * @returns Course with full details (syllabus, lessons, competencies)
   */
  async getCourseDetails(courseId: string): Promise<CourseWithDetails> {
    const response = await apiClient.get<CourseWithDetails>(`/courses/${courseId}`);
    return response.data;
  },

  /**
   * Update an existing course
   * @param courseId Course UUID
   * @param courseData Course update data (partial)
   * @returns Updated course
   */
  async updateCourse(courseId: string, courseData: CourseUpdate): Promise<Course> {
    const response = await apiClient.put<Course>(`/courses/${courseId}`, courseData);
    return response.data;
  },

  /**
   * Delete (unpublish) a course
   * @param courseId Course UUID
   */
  async deleteCourse(courseId: string): Promise<void> {
    await apiClient.delete(`/courses/${courseId}`);
  },

  /**
   * Publish a course (make it visible to students)
   * @param courseId Course UUID
   * @returns Updated course
   */
  async publishCourse(courseId: string): Promise<Course> {
    return this.updateCourse(courseId, { is_published: true });
  },

  /**
   * Unpublish a course (hide from students)
   * @param courseId Course UUID
   * @returns Updated course
   */
  async unpublishCourse(courseId: string): Promise<Course> {
    return this.updateCourse(courseId, { is_published: false });
  },

  /**
   * Get courses by instructor
   * @param instructorId Instructor UUID
   * @param params Additional filter parameters
   * @returns Instructor's courses
   */
  async getInstructorCourses(
    instructorId: string,
    params?: Omit<CourseFilterParams, 'instructor_id'>
  ): Promise<CourseListResponse> {
    return this.listCourses({ ...params, instructor_id: instructorId });
  },

  /**
   * Get featured courses
   * @param params Additional filter parameters
   * @returns Featured courses
   */
  async getFeaturedCourses(
    params?: Omit<CourseFilterParams, 'is_featured'>
  ): Promise<CourseListResponse> {
    return this.listCourses({ ...params, is_featured: true });
  },

  /**
   * Search courses by query
   * @param searchQuery Search text
   * @param params Additional filter parameters
   * @returns Matching courses
   */
  async searchCourses(
    searchQuery: string,
    params?: Omit<CourseFilterParams, 'search'>
  ): Promise<CourseListResponse> {
    return this.listCourses({ ...params, search: searchQuery });
  },

  // ========================
  // Enrollment Operations
  // ========================

  /**
   * Enroll in a course
   * @param courseId Course UUID
   * @param paymentId Optional payment UUID for paid courses
   * @returns Created enrollment
   */
  async enrollInCourse(courseId: string, paymentId?: string): Promise<Enrollment> {
    const response = await apiClient.post<Enrollment>(`/courses/${courseId}/enroll`, null, {
      params: { payment_id: paymentId },
    });
    return response.data;
  },

  /**
   * Get current user's enrollments
   * @param params Filter parameters
   * @returns List of enrollments
   */
  async getMyEnrollments(params?: EnrollmentFilterParams): Promise<Enrollment[]> {
    const response = await apiClient.get<Enrollment[]>('/courses/my-enrollments', {
      params: params?.status ? { status_filter: params.status } : undefined,
    });
    return response.data;
  },

  /**
   * Get active enrollments for current user
   * @returns List of active enrollments
   */
  async getActiveEnrollments(): Promise<Enrollment[]> {
    return this.getMyEnrollments({ status: 'active' });
  },

  /**
   * Get completed enrollments for current user
   * @returns List of completed enrollments
   */
  async getCompletedEnrollments(): Promise<Enrollment[]> {
    return this.getMyEnrollments({ status: 'completed' });
  },

  /**
   * Mark a lesson as completed
   * @param enrollmentId Enrollment UUID
   * @param lessonData Lesson completion data
   * @returns Updated enrollment
   */
  async completLesson(
    enrollmentId: string,
    lessonData: LessonCompletionRequest
  ): Promise<Enrollment> {
    const response = await apiClient.post<Enrollment>(
      `/courses/enrollments/${enrollmentId}/complete-lesson`,
      lessonData
    );
    return response.data;
  },

  /**
   * Rate a course
   * @param enrollmentId Enrollment UUID
   * @param ratingData Rating and review data
   * @returns Updated enrollment
   */
  async rateCourse(
    enrollmentId: string,
    ratingData: EnrollmentRatingRequest
  ): Promise<Enrollment> {
    const response = await apiClient.post<Enrollment>(
      `/courses/enrollments/${enrollmentId}/rate`,
      ratingData
    );
    return response.data;
  },

  // ========================
  // Helper Methods
  // ========================

  /**
   * Check if user is enrolled in a course
   * @param courseId Course UUID
   * @returns True if enrolled, false otherwise
   */
  async isEnrolledInCourse(courseId: string): Promise<boolean> {
    try {
      const enrollments = await this.getMyEnrollments();
      return enrollments.some(
        (e) => e.course_id === courseId && ['active', 'completed'].includes(e.status)
      );
    } catch (error) {
      console.error('Error checking enrollment:', error);
      return false;
    }
  },

  /**
   * Get enrollment for a specific course
   * @param courseId Course UUID
   * @returns Enrollment if found, null otherwise
   */
  async getEnrollmentForCourse(courseId: string): Promise<Enrollment | null> {
    try {
      const enrollments = await this.getMyEnrollments();
      const enrollment = enrollments.find((e) => e.course_id === courseId);
      return enrollment || null;
    } catch (error) {
      console.error('Error getting enrollment:', error);
      return null;
    }
  },

  /**
   * Calculate course progress percentage
   * @param enrollment Enrollment data
   * @returns Progress percentage (0-100)
   */
  calculateProgress(enrollment: Enrollment): number {
    return Number(enrollment.progress_percentage);
  },

  /**
   * Format time spent in human-readable format
   * @param minutes Total time in minutes
   * @returns Formatted time string (e.g., "2h 30m")
   */
  formatTimeSpent(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${remainingMinutes}m`;
  },

  /**
   * Check if course is free
   * @param course Course data
   * @returns True if free, false if paid
   */
  isFree(course: Course): boolean {
    return course.price === 0;
  },

  /**
   * Format course price
   * @param course Course data
   * @returns Formatted price string (e.g., "KES 1,500" or "Free")
   */
  formatPrice(course: Course): string {
    if (this.isFree(course)) {
      return 'Free';
    }

    const formattedPrice = new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: course.currency,
      minimumFractionDigits: 0,
    }).format(course.price);

    return formattedPrice;
  },
};

export default courseService;
