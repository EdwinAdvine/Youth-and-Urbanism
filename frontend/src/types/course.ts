/**
 * Course-related TypeScript types for Urban Home School frontend
 *
 * These types align with the backend Pydantic schemas for Course Management
 * and provide type safety for the frontend application.
 */

// ========================
// Enums and Constants
// ========================

/**
 * CBC (Competency-Based Curriculum) Learning Areas
 */
export type LearningArea =
  | 'Mathematics'
  | 'Science and Technology'
  | 'Languages'
  | 'English'
  | 'Kiswahili'
  | 'Social Studies'
  | 'Religious Education'
  | 'Creative Arts'
  | 'Physical Education'
  | 'Agriculture and Nutrition'
  | 'Home Science'
  | 'Pre-Technical and Career Education';

/**
 * CBC Grade Levels
 */
export type GradeLevel =
  | 'ECD 1'
  | 'ECD 2'
  | 'Grade 1'
  | 'Grade 2'
  | 'Grade 3'
  | 'Grade 4'
  | 'Grade 5'
  | 'Grade 6'
  | 'Grade 7'
  | 'Grade 8'
  | 'Grade 9'
  | 'Grade 10'
  | 'Grade 11'
  | 'Grade 12';

/**
 * Enrollment Status
 */
export type EnrollmentStatus =
  | 'active'
  | 'completed'
  | 'dropped'
  | 'expired'
  | 'pending_payment';

/**
 * Lesson types
 */
export type LessonType =
  | 'video'
  | 'reading'
  | 'quiz'
  | 'assignment'
  | 'interactive'
  | 'live_session';

// ========================
// Course Types
// ========================

/**
 * Lesson structure within a course
 */
export interface Lesson {
  id: string;
  title: string;
  description: string;
  type: LessonType;
  duration_minutes?: number;
  content_url?: string;
  resources?: LessonResource[];
  order: number;
  is_locked: boolean;
  is_completed?: boolean;
}

/**
 * Lesson resource (e.g., PDFs, links, materials)
 */
export interface LessonResource {
  id: string;
  title: string;
  type: 'pdf' | 'link' | 'video' | 'document';
  url: string;
  size_mb?: number;
}

/**
 * CBC Competency structure
 */
export interface Competency {
  id: string;
  code: string;
  description: string;
  learning_area: LearningArea;
  grade_level: GradeLevel;
}

/**
 * Course syllabus structure
 */
export interface Syllabus {
  overview: string;
  learning_outcomes: string[];
  prerequisites?: string[];
  assessment_criteria?: string[];
  modules: SyllabusModule[];
}

/**
 * Syllabus module/unit structure
 */
export interface SyllabusModule {
  id: string;
  title: string;
  description: string;
  duration_weeks?: number;
  topics: string[];
  learning_outcomes: string[];
}

/**
 * Base Course data (used for creating courses)
 */
export interface CourseBase {
  title: string;
  description: string;
  learning_area: LearningArea;
  grade_levels: GradeLevel[];
  thumbnail_url?: string;
  syllabus?: Syllabus;
  lessons?: Lesson[];
  price?: number;
  currency?: string;
  estimated_duration_hours?: number;
  competencies?: Competency[];
}

/**
 * Course creation payload
 */
export interface CourseCreate extends CourseBase {
  // All fields inherited from CourseBase
}

/**
 * Course update payload (all fields optional)
 */
export interface CourseUpdate {
  title?: string;
  description?: string;
  thumbnail_url?: string;
  learning_area?: LearningArea;
  grade_levels?: GradeLevel[];
  syllabus?: Syllabus;
  lessons?: Lesson[];
  price?: number;
  is_published?: boolean;
  is_featured?: boolean;
}

/**
 * Course response from API (summary view)
 */
export interface Course {
  id: string;
  title: string;
  description: string;
  learning_area: LearningArea;
  grade_levels: GradeLevel[];
  thumbnail_url?: string;
  instructor_id?: string;
  is_platform_created: boolean;
  price: number;
  currency: string;
  is_published: boolean;
  is_featured: boolean;
  enrollment_count: number;
  average_rating: number;
  total_reviews: number;
  estimated_duration_hours?: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

/**
 * Course with full details (includes syllabus, lessons, competencies)
 */
export interface CourseWithDetails extends Course {
  syllabus: Syllabus;
  lessons: Lesson[];
  competencies: Competency[];
}

// ========================
// Enrollment Types
// ========================

/**
 * Quiz score record
 */
export interface QuizScore {
  quiz_id: string;
  quiz_title: string;
  score: number;
  max_score: number;
  percentage: number;
  completed_at: string;
}

/**
 * Assignment score record
 */
export interface AssignmentScore {
  assignment_id: string;
  assignment_title: string;
  score: number;
  max_score: number;
  percentage: number;
  submitted_at: string;
  graded_at?: string;
}

/**
 * Enrollment creation payload
 */
export interface EnrollmentCreate {
  student_id: string;
  course_id: string;
  payment_id?: string;
  payment_amount?: number;
}

/**
 * Lesson completion request
 */
export interface LessonCompletionRequest {
  lesson_id: string;
  time_spent_minutes?: number;
}

/**
 * Course rating request
 */
export interface EnrollmentRatingRequest {
  rating: number; // 1-5
  review?: string;
}

/**
 * Enrollment response from API
 */
export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  status: EnrollmentStatus;
  progress_percentage: number;
  completed_lessons: string[];
  total_time_spent_minutes: number;
  last_accessed_at?: string;
  current_grade?: number;
  quiz_scores: QuizScore[];
  assignment_scores: AssignmentScore[];
  is_completed: boolean;
  completed_at?: string;
  certificate_id?: string;
  payment_id?: string;
  payment_amount: number;
  rating?: number;
  review?: string;
  reviewed_at?: string;
  enrolled_at: string;
  updated_at: string;
}

/**
 * Enrollment with nested course details
 */
export interface EnrollmentWithCourse extends Enrollment {
  course: Course;
}

/**
 * Student enrollment list response
 */
export interface StudentEnrollmentListResponse {
  enrollments: EnrollmentWithCourse[];
  total: number;
  active_count: number;
  completed_count: number;
}

/**
 * Course enrollment list response (for instructors)
 */
export interface CourseEnrollmentListResponse {
  enrollments: Enrollment[];
  total: number;
  course_id: string;
  course_title: string;
}

/**
 * Enrollment statistics
 */
export interface EnrollmentStats {
  total_enrollments: number;
  active_enrollments: number;
  completed_enrollments: number;
  dropped_enrollments: number;
  average_progress: number;
  average_completion_time_days?: number;
}

// ========================
// API Response Types
// ========================

/**
 * Course list API response
 */
export interface CourseListResponse {
  courses: Course[];
  total: number;
  skip: number;
  limit: number;
  has_more: boolean;
}

/**
 * Course filter parameters
 */
export interface CourseFilterParams {
  skip?: number;
  limit?: number;
  grade_level?: GradeLevel;
  learning_area?: LearningArea;
  is_featured?: boolean;
  search?: string;
  instructor_id?: string;
}

/**
 * Enrollment filter parameters
 */
export interface EnrollmentFilterParams {
  status?: EnrollmentStatus;
}

// ========================
// UI Helper Types
// ========================

/**
 * Course card display data (for catalog/browse views)
 */
export interface CourseCardData {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  instructor_name?: string;
  price: number;
  currency: string;
  is_free: boolean;
  rating: number;
  total_reviews: number;
  enrollment_count: number;
  estimated_duration_hours?: number;
  grade_levels: GradeLevel[];
  learning_area: LearningArea;
}

/**
 * Course progress summary (for student dashboard)
 */
export interface CourseProgress {
  course_id: string;
  course_title: string;
  thumbnail_url?: string;
  progress_percentage: number;
  completed_lessons: number;
  total_lessons: number;
  last_accessed_at?: string;
  current_grade?: number;
  time_spent_hours: number;
}

/**
 * Instructor course summary (for instructor dashboard)
 */
export interface InstructorCourseSummary {
  course_id: string;
  course_title: string;
  thumbnail_url?: string;
  is_published: boolean;
  enrollment_count: number;
  average_rating: number;
  total_reviews: number;
  revenue_earned?: number;
  created_at: string;
  updated_at: string;
}
