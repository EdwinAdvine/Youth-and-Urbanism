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
  const qs = new URLSearchParams();
  if (params.page != null) qs.set('page', String(params.page));
  if (params.page_size != null) qs.set('page_size', String(params.page_size));
  if (params.status) qs.set('status', params.status);

  const response = await fetch(`${API_BASE}/sessions?${qs.toString()}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<PaginatedResponse<LiveSession>>(response);
}

/** Fetch a single session by ID. */
export async function getSession(sessionId: string): Promise<LiveSession> {
  const response = await fetch(`${API_BASE}/sessions/${sessionId}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<LiveSession>(response);
}

/** Create a new live session. */
export async function createSession(
  data: CreateSessionPayload,
): Promise<LiveSession> {
  const response = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<LiveSession>(response);
}

/** Update an existing session. */
export async function updateSession(
  sessionId: string,
  data: UpdateSessionPayload,
): Promise<LiveSession> {
  const response = await fetch(`${API_BASE}/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<LiveSession>(response);
}

/** Generate a LiveKit token for joining a session room. */
export async function getLiveKitToken(
  sessionId: string,
): Promise<{ token: string }> {
  const response = await fetch(`${API_BASE}/sessions/${sessionId}/token`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return handleResponse<{ token: string }>(response);
}

/** Start recording a live session. */
export async function startRecording(sessionId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE}/sessions/${sessionId}/recording/start`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
    },
  );
  return handleResponse<void>(response);
}

/** Stop recording a live session. */
export async function stopRecording(sessionId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE}/sessions/${sessionId}/recording/stop`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
    },
  );
  return handleResponse<void>(response);
}

/** Fetch all recordings for a session. */
export async function getRecordings(
  sessionId: string,
): Promise<LiveSessionRecording[]> {
  const response = await fetch(`${API_BASE}/sessions/${sessionId}/recordings`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<LiveSessionRecording[]>(response);
}

/** Create or update breakout rooms within a live session. */
export async function manageBreakoutRooms(
  sessionId: string,
  config: BreakoutRoomConfig,
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/sessions/${sessionId}/breakout-rooms`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(config),
    },
  );
  return handleResponse<void>(response);
}
