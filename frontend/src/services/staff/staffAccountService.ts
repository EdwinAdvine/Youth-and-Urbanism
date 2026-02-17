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
import apiClient from '../api';

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
  const { data } = await apiClient.get<StaffProfile>('/api/v1/staff/account/profile');
  return data;
}

/** Update the current staff member's profile. */
export async function updateProfile(
  payload: UpdateProfilePayload,
): Promise<StaffProfile> {
  const { data } = await apiClient.patch<StaffProfile>(
    '/api/v1/staff/account/profile',
    payload,
  );
  return data;
}

/** Update the current staff member's UI/app preferences. */
export async function updatePreferences(
  payload: UpdatePreferencesPayload,
): Promise<void> {
  await apiClient.patch('/api/v1/staff/account/preferences', payload);
}

/** Fetch notification preferences. */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const { data } = await apiClient.get<NotificationPreferences>(
    '/api/v1/staff/account/notifications/preferences',
  );
  return data;
}

/** Update notification preferences. */
export async function updateNotificationPreferences(
  payload: UpdateNotificationPreferencesPayload,
): Promise<void> {
  await apiClient.patch('/api/v1/staff/account/notifications/preferences', payload);
}

/** Change the current staff member's password. */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await apiClient.post('/api/v1/staff/account/security/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  });
}

/** Fetch active login sessions for the current staff member. */
export async function getActiveSessions(): Promise<ActiveSession[]> {
  const { data } = await apiClient.get<ActiveSession[]>(
    '/api/v1/staff/account/security/sessions',
  );
  return data;
}

/** Fetch the current staff member's audit log. */
export async function getAuditLog(
  params: AuditLogParams = {},
): Promise<PaginatedResponse<AuditEntry>> {
  const { data } = await apiClient.get<PaginatedResponse<AuditEntry>>(
    '/api/v1/staff/account/audit-log',
    { params },
  );
  return data;
}
