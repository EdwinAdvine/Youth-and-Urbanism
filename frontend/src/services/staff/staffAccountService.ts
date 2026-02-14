/**
 * Staff Account Service
 *
 * Wraps API calls to /api/v1/staff/account endpoints for managing the staff
 * member's own profile, preferences, notification settings, security (password
 * changes and active sessions), and audit log.
 */

import type {
  PaginatedResponse,
  StaffProfile,
  NotificationPreferences,
  ActiveSession,
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

export interface UpdateProfilePayload {
  department?: string;
  position?: string;
  specializations?: string[];
  availability?: Record<string, unknown>;
}

export interface UpdatePreferencesPayload {
  view_mode?: 'teacher_focus' | 'operations_focus' | 'custom';
  theme?: 'light' | 'dark' | 'system';
  language?: 'en' | 'sw';
  timezone?: string;
  custom_layout?: Record<string, unknown>;
}

export interface UpdateNotificationPreferencesPayload {
  channels?: { push?: boolean; email?: boolean; in_app?: boolean };
  digest_frequency?: 'instant' | 'hourly' | 'daily' | 'weekly';
  quiet_hours?: { enabled?: boolean; start?: string; end?: string };
  categories?: Record<string, string>;
}

export interface AuditEntry {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AuditLogParams {
  page?: number;
  page_size?: number;
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

/** Fetch the current staff member's profile. */
export async function getProfile(): Promise<StaffProfile> {
  const response = await fetch(`${API_BASE}/account/profile`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<StaffProfile>(response);
}

/** Update the current staff member's profile. */
export async function updateProfile(
  data: UpdateProfilePayload,
): Promise<StaffProfile> {
  const response = await fetch(`${API_BASE}/account/profile`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<StaffProfile>(response);
}

/** Update the current staff member's UI/app preferences. */
export async function updatePreferences(
  data: UpdatePreferencesPayload,
): Promise<void> {
  const response = await fetch(`${API_BASE}/account/preferences`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<void>(response);
}

/** Fetch notification preferences. */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const response = await fetch(`${API_BASE}/account/notifications/preferences`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<NotificationPreferences>(response);
}

/** Update notification preferences. */
export async function updateNotificationPreferences(
  data: UpdateNotificationPreferencesPayload,
): Promise<void> {
  const response = await fetch(`${API_BASE}/account/notifications/preferences`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<void>(response);
}

/** Change the current staff member's password. */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const response = await fetch(`${API_BASE}/account/security/change-password`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });
  return handleResponse<void>(response);
}

/** Fetch active login sessions for the current staff member. */
export async function getActiveSessions(): Promise<ActiveSession[]> {
  const response = await fetch(`${API_BASE}/account/security/sessions`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<ActiveSession[]>(response);
}

/** Fetch the current staff member's audit log. */
export async function getAuditLog(
  params: AuditLogParams = {},
): Promise<PaginatedResponse<AuditEntry>> {
  const qs = new URLSearchParams();
  if (params.page != null) qs.set('page', String(params.page));
  if (params.page_size != null) qs.set('page_size', String(params.page_size));

  const response = await fetch(`${API_BASE}/account/audit-log?${qs.toString()}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<PaginatedResponse<AuditEntry>>(response);
}
