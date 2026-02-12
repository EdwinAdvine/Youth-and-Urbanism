/**
 * Assessment Service
 *
 * Handles assessment/quiz operations:
 * - List assessments with filtering
 * - Get assessment details with questions
 * - Submit answers
 * - Get submission history
 */

import apiClient, { handleApiError } from './api';

// ==================== Type Definitions ====================

export interface Assessment {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  assessment_type: 'quiz' | 'assignment' | 'project' | 'exam';
  total_points: number;
  passing_score: number;
  duration_minutes?: number;
  max_attempts: number;
  total_submissions: number;
  average_score?: number;
  is_published: boolean;
  created_at?: string;
}

export interface AssessmentWithQuestions extends Assessment {
  questions: Question[];
}

export interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  question: string;
  options?: string[];
  points: number;
}

export interface Submission {
  id: string;
  assessment_id: string;
  score?: number;
  is_graded: boolean;
  attempt_number: number;
  answers: Record<string, string>;
  feedback?: string;
  submitted_at?: string;
}

export interface AssessmentListResponse {
  assessments: Assessment[];
  total: number;
  page: number;
  page_size: number;
}

// ==================== API Functions ====================

/**
 * List assessments with optional filtering
 */
export const listAssessments = async (params?: {
  course_id?: string;
  assessment_type?: string;
  skip?: number;
  limit?: number;
}): Promise<AssessmentListResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.course_id) queryParams.append('course_id', params.course_id);
    if (params?.assessment_type) queryParams.append('assessment_type', params.assessment_type);
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());

    const url = `/api/v1/assessments/?${queryParams.toString()}`;
    const response = await apiClient.get<AssessmentListResponse>(url);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get a single assessment with its questions
 */
export const getAssessment = async (assessmentId: string): Promise<AssessmentWithQuestions> => {
  try {
    const response = await apiClient.get<AssessmentWithQuestions>(`/api/v1/assessments/${assessmentId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Submit answers for an assessment
 */
export const submitAssessment = async (
  assessmentId: string,
  answers: Record<string, string>
): Promise<Submission> => {
  try {
    const response = await apiClient.post<Submission>(`/api/v1/assessments/${assessmentId}/submit`, {
      answers,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get submissions for an assessment
 */
export const getSubmissions = async (assessmentId: string): Promise<Submission[]> => {
  try {
    const response = await apiClient.get<Submission[]>(`/api/v1/assessments/${assessmentId}/submissions`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
