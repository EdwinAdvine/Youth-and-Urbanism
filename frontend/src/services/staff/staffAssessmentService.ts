/**
 * Staff Assessment Service
 *
 * Wraps API calls to /api/v1/staff/assessments endpoints for managing adaptive
 * assessments, question banks, AI-powered adaptive question selection, and
 * AI-assisted grading.
 */

import type {
  PaginatedResponse,
  AdaptiveAssessment,
  AssessmentQuestion,
  AIGradingResult,
} from '../../types/staff';
import apiClient from '../api';

// ---------------------------------------------------------------------------
// Types local to this service
// ---------------------------------------------------------------------------

export interface AssessmentListParams {
  page?: number;
  page_size?: number;
}

export interface CreateAssessmentPayload {
  title: string;
  description?: string;
  assessment_type: 'quiz' | 'exam' | 'formative' | 'diagnostic';
  course_id?: string;
  grade_level?: string;
  learning_area?: string;
  cbc_tags?: { strand: string; sub_strand: string; competency: string }[];
  difficulty_range?: { min: number; max: number };
  adaptive_config?: {
    initial_difficulty: number;
    step_up_threshold: number;
    step_down_threshold: number;
  };
  time_limit_minutes?: number;
  is_ai_graded?: boolean;
  rubric?: Record<string, unknown>;
}

export interface UpdateAssessmentPayload {
  title?: string;
  description?: string;
  assessment_type?: 'quiz' | 'exam' | 'formative' | 'diagnostic';
  grade_level?: string;
  learning_area?: string;
  difficulty_range?: { min: number; max: number };
  adaptive_config?: {
    initial_difficulty: number;
    step_up_threshold: number;
    step_down_threshold: number;
  };
  time_limit_minutes?: number;
  is_ai_graded?: boolean;
  rubric?: Record<string, unknown>;
  status?: 'draft' | 'active' | 'archived';
}

export interface CreateQuestionPayload {
  question_text: string;
  question_type: 'mcq' | 'short_answer' | 'essay' | 'fill_blank' | 'matching' | 'ordering';
  options?: { text: string; is_correct: boolean }[];
  correct_answer?: string;
  explanation?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  points: number;
  cbc_competency?: string;
  media_url?: string;
  order_index?: number;
  adaptive_paths?: { if_correct: string | null; if_wrong: string | null }[];
  ai_grading_prompt?: string;
}

export interface UpdateQuestionPayload {
  question_text?: string;
  question_type?: 'mcq' | 'short_answer' | 'essay' | 'fill_blank' | 'matching' | 'ordering';
  options?: { text: string; is_correct: boolean }[];
  correct_answer?: string;
  explanation?: string;
  difficulty?: 1 | 2 | 3 | 4 | 5;
  points?: number;
  cbc_competency?: string;
  media_url?: string;
  order_index?: number;
  ai_grading_prompt?: string;
}

export interface AdaptiveSessionState {
  session_id: string;
  current_difficulty: number;
  questions_answered: number;
  correct_count: number;
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

/** Fetch a paginated list of assessments. */
export async function getAssessments(
  params: AssessmentListParams = {},
): Promise<PaginatedResponse<AdaptiveAssessment>> {
  const { data } = await apiClient.get<{ status: string; data: PaginatedResponse<AdaptiveAssessment> }>(
    '/api/v1/staff/assessments',
    { params },
  );
  return data.data;
}

/** Fetch a single assessment by ID. */
export async function getAssessment(
  assessmentId: string,
): Promise<AdaptiveAssessment> {
  const { data } = await apiClient.get<{ status: string; data: AdaptiveAssessment }>(
    `/api/v1/staff/assessments/${assessmentId}`,
  );
  return data.data;
}

/** Create a new adaptive assessment. */
export async function createAssessment(
  payload: CreateAssessmentPayload,
): Promise<AdaptiveAssessment> {
  const { data } = await apiClient.post<{ status: string; data: AdaptiveAssessment }>(
    '/api/v1/staff/assessments',
    payload,
  );
  return data.data;
}

/** Update an existing assessment. */
export async function updateAssessment(
  assessmentId: string,
  payload: UpdateAssessmentPayload,
): Promise<AdaptiveAssessment> {
  const { data } = await apiClient.patch<{ status: string; data: AdaptiveAssessment }>(
    `/api/v1/staff/assessments/${assessmentId}`,
    payload,
  );
  return data.data;
}

/** Delete an assessment. */
export async function deleteAssessment(assessmentId: string): Promise<void> {
  await apiClient.delete(`/api/v1/staff/assessments/${assessmentId}`);
}

/** Add a question to an assessment. */
export async function addQuestion(
  assessmentId: string,
  payload: CreateQuestionPayload,
): Promise<AssessmentQuestion> {
  const { data } = await apiClient.post<{ status: string; data: AssessmentQuestion }>(
    `/api/v1/staff/assessments/${assessmentId}/questions`,
    payload,
  );
  return data.data;
}

/** Update an existing question. */
export async function updateQuestion(
  questionId: string,
  payload: UpdateQuestionPayload,
): Promise<AssessmentQuestion> {
  const { data } = await apiClient.patch<{ status: string; data: AssessmentQuestion }>(
    `/api/v1/staff/assessments/questions/${questionId}`,
    payload,
  );
  return data.data;
}

/** Delete a question from an assessment. */
export async function deleteQuestion(questionId: string): Promise<void> {
  await apiClient.delete(`/api/v1/staff/assessments/questions/${questionId}`);
}

/** Request the next adaptive question based on current session state. */
export async function getNextAdaptiveQuestion(
  assessmentId: string,
  sessionState: AdaptiveSessionState,
): Promise<AssessmentQuestion> {
  const { data } = await apiClient.post<{ status: string; data: AssessmentQuestion }>(
    `/api/v1/staff/assessments/${assessmentId}/adaptive/next`,
    sessionState,
  );
  return data.data;
}

/** Submit a student answer for AI-powered grading. */
export async function gradeResponse(
  questionId: string,
  answer: string,
): Promise<AIGradingResult> {
  const { data } = await apiClient.post<{ status: string; data: AIGradingResult }>(
    `/api/v1/staff/assessments/questions/${questionId}/grade`,
    { answer },
  );
  return data.data;
}
