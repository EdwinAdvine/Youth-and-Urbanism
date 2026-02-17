/**
 * Instructor Session Service
 *
 * API calls to /api/v1/instructor/sessions endpoints.
 */
import apiClient from '../api';

export interface Session {
  id: string;
  title: string;
  description: string;
  course_id?: string;
  course_title?: string;
  scheduled_start: string;
  scheduled_end: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  participants_count: number;
  max_participants?: number;
  meeting_url?: string;
  recording_url?: string;
  created_at: string;
}

export async function getSessions(params?: {
  status?: string;
}): Promise<Session[]> {
  const { data } = await apiClient.get<Session[]>(
    '/api/v1/instructor/sessions',
    { params },
  );
  return data;
}

export async function getSessionDetail(sessionId: string): Promise<Session> {
  const { data } = await apiClient.get<Session>(
    `/api/v1/instructor/sessions/${sessionId}`,
  );
  return data;
}

export async function createSession(sessionData: {
  title: string;
  description: string;
  course_id?: string;
  scheduled_start: string;
  scheduled_end: string;
  max_participants?: number;
}): Promise<Session> {
  const { data } = await apiClient.post<Session>(
    '/api/v1/instructor/sessions',
    sessionData,
  );
  return data;
}
