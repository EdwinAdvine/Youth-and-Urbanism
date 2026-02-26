/**
 * Staff Student Service
 *
 * Wraps API calls to /api/v1/staff/student-progress and
 * /api/v1/staff/student-journeys endpoints for monitoring
 * student progress, learning journeys, and at-risk learners.
 */

import type {
  PaginatedResponse,
  StudentProgressCard,
  StudentJourney,
} from '../../types/staff';
import apiClient from '../api';

// ---------------------------------------------------------------------------
// Student Progress
// ---------------------------------------------------------------------------

export interface StudentProgressParams {
  page?: number;
  page_size?: number;
  grade_level?: string;
  class_id?: string;
  search?: string;
}

/** Fetch paginated student progress overview cards. */
export async function getStudentProgressOverview(
  params: StudentProgressParams = {},
): Promise<PaginatedResponse<StudentProgressCard>> {
  const { data } = await apiClient.get<{ status: string; data: PaginatedResponse<StudentProgressCard> }>(
    '/api/v1/staff/student-progress/overview',
    { params },
  );
  return data.data;
}

/** Fetch detailed progress for a specific student. */
export async function getStudentProgressDetail(studentId: string) {
  const { data } = await apiClient.get(`/api/v1/staff/student-progress/${studentId}`);
  return data.data;
}

// ---------------------------------------------------------------------------
// Student Journeys
// ---------------------------------------------------------------------------

export interface StudentJourneyParams {
  page?: number;
  page_size?: number;
  grade_level?: string;
  risk_level?: string;
}

/** Fetch at-risk learners list. */
export async function getAtRiskLearners(
  params: StudentJourneyParams = {},
): Promise<PaginatedResponse<StudentJourney>> {
  const { data } = await apiClient.get<{ status: string; data: PaginatedResponse<StudentJourney> }>(
    '/api/v1/staff/student-journeys/at-risk',
    { params },
  );
  return data.data;
}

/** Fetch a student's learning journey. */
export async function getStudentJourney(studentId: string) {
  const { data } = await apiClient.get(`/api/v1/staff/student-journeys/${studentId}/journey`);
  return data.data;
}

/** Fetch a student's progress card (daily activity, completion, grades). */
export async function getStudentProgressCard(studentId: string) {
  const { data } = await apiClient.get(`/api/v1/staff/student-journeys/${studentId}/progress`);
  return data.data;
}
