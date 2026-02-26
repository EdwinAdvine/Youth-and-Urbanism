/**
 * Staff Live Session Service
 *
 * Wraps API calls to /api/v1/staff/sessions endpoints for managing live
 * teaching sessions, generating LiveKit tokens, controlling recordings,
 * and configuring breakout rooms.
 */

import type {
  PaginatedResponse,
  LiveSession,
  LiveSessionRecording,
} from '../../types/staff';
import apiClient from '../api';

// ---------------------------------------------------------------------------
// Types local to this service
// ---------------------------------------------------------------------------

export interface SessionListParams {
  page?: number;
  page_size?: number;
  status?: string;
}

export interface CreateSessionPayload {
  title: string;
  description?: string;
  session_type: 'class' | 'tutoring' | 'meeting' | 'workshop';
  max_participants?: number;
  scheduled_at: string;
  recording_enabled?: boolean;
  screen_share_enabled?: boolean;
  course_id?: string;
  grade_level?: string;
}

export interface UpdateSessionPayload {
  title?: string;
  description?: string;
  session_type?: 'class' | 'tutoring' | 'meeting' | 'workshop';
  max_participants?: number;
  scheduled_at?: string;
  recording_enabled?: boolean;
  screen_share_enabled?: boolean;
  status?: 'scheduled' | 'live' | 'ended' | 'cancelled';
}

export interface BreakoutRoomConfig {
  rooms: {
    name: string;
    participant_ids: string[];
  }[];
  auto_close_minutes?: number;
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

/** Fetch a paginated list of live sessions with optional status filter. */
export async function getSessions(
  params: SessionListParams = {},
): Promise<PaginatedResponse<LiveSession>> {
  const { data } = await apiClient.get<{ status: string; data: PaginatedResponse<LiveSession> }>(
    '/api/v1/staff/sessions',
    { params },
  );
  return data.data;
}

/** Fetch a single session by ID. */
export async function getSession(sessionId: string): Promise<LiveSession> {
  const { data } = await apiClient.get<{ status: string; data: LiveSession }>(
    `/api/v1/staff/sessions/${sessionId}`,
  );
  return data.data;
}

/** Create a new live session. */
export async function createSession(
  payload: CreateSessionPayload,
): Promise<LiveSession> {
  const { data } = await apiClient.post<{ status: string; data: LiveSession }>(
    '/api/v1/staff/sessions',
    payload,
  );
  return data.data;
}

/** Update an existing session. */
export async function updateSession(
  sessionId: string,
  payload: UpdateSessionPayload,
): Promise<LiveSession> {
  const { data } = await apiClient.patch<{ status: string; data: LiveSession }>(
    `/api/v1/staff/sessions/${sessionId}`,
    payload,
  );
  return data.data;
}

/** Generate a LiveKit token for joining a session room. */
export async function getLiveKitToken(
  sessionId: string,
): Promise<{ token: string }> {
  const { data } = await apiClient.post<{ status: string; data: { token: string } }>(
    `/api/v1/staff/sessions/${sessionId}/token`,
  );
  return data.data;
}

/** Start recording a live session. */
export async function startRecording(sessionId: string): Promise<void> {
  await apiClient.post(`/api/v1/staff/sessions/${sessionId}/recording/start`);
}

/** Stop recording a live session. */
export async function stopRecording(sessionId: string): Promise<void> {
  await apiClient.post(`/api/v1/staff/sessions/${sessionId}/recording/stop`);
}

/** Fetch all recordings for a session. */
export async function getRecordings(
  sessionId: string,
): Promise<LiveSessionRecording[]> {
  const { data } = await apiClient.get<{ status: string; data: LiveSessionRecording[] }>(
    `/api/v1/staff/sessions/${sessionId}/recordings`,
  );
  return data.data;
}

/** Create or update breakout rooms within a live session. */
export async function manageBreakoutRooms(
  sessionId: string,
  config: BreakoutRoomConfig,
): Promise<void> {
  await apiClient.post(`/api/v1/staff/sessions/${sessionId}/breakout-rooms`, config);
}
