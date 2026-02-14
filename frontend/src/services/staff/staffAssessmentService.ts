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

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/staff`;

function getAuthHeaders(): HeadersInit {
  const token =
    localStorage.getItem('access_token') ||
    JSON.parse(localStorage.getItem('auth-store') || '{}')?.state?.token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

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
  const qs = new URLSearchParams();
  if (params.page != null) qs.set('page', String(params.page));
  if (params.page_size != null) qs.set('page_size', String(params.page_size));

  const response = await fetch(`${API_BASE}/assessments?${qs.toString()}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<PaginatedResponse<AdaptiveAssessment>>(response);
}

/** Fetch a single assessment by ID. */
export async function getAssessment(
  assessmentId: string,
): Promise<AdaptiveAssessment> {
  const response = await fetch(`${API_BASE}/assessments/${assessmentId}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<AdaptiveAssessment>(response);
}

/** Create a new adaptive assessment. */
export async function createAssessment(
  data: CreateAssessmentPayload,
): Promise<AdaptiveAssessment> {
  const response = await fetch(`${API_BASE}/assessments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<AdaptiveAssessment>(response);
}

/** Update an existing assessment. */
export async function updateAssessment(
  assessmentId: string,
  data: UpdateAssessmentPayload,
): Promise<AdaptiveAssessment> {
  const response = await fetch(`${API_BASE}/assessments/${assessmentId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<AdaptiveAssessment>(response);
}

/** Delete an assessment. */
export async function deleteAssessment(assessmentId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/assessments/${assessmentId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse<void>(response);
}

/** Add a question to an assessment. */
export async function addQuestion(
  assessmentId: string,
  data: CreateQuestionPayload,
): Promise<AssessmentQuestion> {
  const response = await fetch(`${API_BASE}/assessments/${assessmentId}/questions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<AssessmentQuestion>(response);
}

/** Update an existing question. */
export async function updateQuestion(
  questionId: string,
  data: UpdateQuestionPayload,
): Promise<AssessmentQuestion> {
  const response = await fetch(`${API_BASE}/assessments/questions/${questionId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<AssessmentQuestion>(response);
}

/** Delete a question from an assessment. */
export async function deleteQuestion(questionId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/assessments/questions/${questionId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse<void>(response);
}

/** Request the next adaptive question based on current session state. */
export async function getNextAdaptiveQuestion(
  assessmentId: string,
  sessionState: AdaptiveSessionState,
): Promise<AssessmentQuestion> {
  const response = await fetch(
    `${API_BASE}/assessments/${assessmentId}/adaptive/next`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(sessionState),
    },
  );
  return handleResponse<AssessmentQuestion>(response);
}

/** Submit a student answer for AI-powered grading. */
export async function gradeResponse(
  questionId: string,
  answer: string,
): Promise<AIGradingResult> {
  const response = await fetch(
    `${API_BASE}/assessments/questions/${questionId}/grade`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ answer }),
    },
  );
  return handleResponse<AIGradingResult>(response);
}
