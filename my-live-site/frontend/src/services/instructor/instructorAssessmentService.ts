/**
 * Instructor Assessment Service
 *
 * API calls to /api/v1/instructor/assessments endpoints.
 */
import apiClient from '../api';

export interface Assessment {
  id: string;
  title: string;
  description: string;
  assessment_type: 'quiz' | 'assignment' | 'project' | 'exam';
  course_id?: string;
  course_title?: string;
  total_questions?: number;
  max_score: number;
  time_limit?: number;
  status: 'draft' | 'published' | 'archived';
  submissions_count: number;
  pending_count: number;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  assessment_id: string;
  assessment_title: string;
  student_id: string;
  student_name: string;
  student_avatar?: string;
  submitted_at: string;
  status: 'pending' | 'graded' | 'late' | 'requires_revision';
  score?: number;
  max_score?: number;
  days_pending?: number;
  has_ai_feedback?: boolean;
}

export async function getAssessments(params?: {
  type?: string;
  status?: string;
}): Promise<Assessment[]> {
  const { data } = await apiClient.get<Assessment[]>(
    '/api/v1/instructor/assessments',
    { params },
  );
  return data;
}

export async function getSubmissions(params?: {
  status?: string;
}): Promise<Submission[]> {
  const { data } = await apiClient.get<Submission[]>(
    '/api/v1/instructor/assessments/submissions',
    { params },
  );
  return data;
}

export async function gradeSubmission(
  submissionId: string,
  gradeData: { score: number; feedback: string },
): Promise<void> {
  await apiClient.post(
    `/api/v1/instructor/assessments/submissions/${submissionId}/grade`,
    gradeData,
  );
}

export async function batchGrade(submissionIds: string[]): Promise<void> {
  await apiClient.post('/api/v1/instructor/assessments/batch-grade', {
    submission_ids: submissionIds,
  });
}

export async function exportSubmissions(): Promise<Blob> {
  const { data } = await apiClient.get<Blob>(
    '/api/v1/instructor/assessments/export',
    { responseType: 'blob' },
  );
  return data;
}
