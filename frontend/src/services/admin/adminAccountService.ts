/**
 * Admin Account Service - Phase 9
 *
 * Provides typed API calls for admin profile management,
 * preferences, and notification settings.
 *
 * Uses the existing users table + profile_data JSONB column.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const BASE = `${API_URL}/api/v1/admin/account`;

function getAuthHeaders(): Record<string, string> {
  let jwt = '';
  const stored = localStorage.getItem('auth-store');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      jwt = parsed?.state?.token || parsed?.token || '';
    } catch {
      jwt = stored;
    }
  }
  return {
    Authorization: `Bearer ${jwt}`,
    'Content-Type': 'application/json',
  };
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: getAuthHeaders(),
    ...options,
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  const json = await response.json();
  return json.data ?? json;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AdminProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone_number: string | null;
  avatar_url: string | null;
  is_active: boolean;
  is_verified: boolean;
  two_factor_enabled: boolean;
  created_at: string;
  last_login: string | null;
}

export interface AdminPreferences {
  theme: 'dark' | 'light' | 'system';
  language: string;
  timezone: string;
  notifications: {
    email_alerts: boolean;
    push_notifications: boolean;
    weekly_digest: boolean;
    critical_only: boolean;
  };
  dashboard: {
    default_page: string;
    auto_refresh_interval: number;
    compact_mode: boolean;
  };
}

export interface AdminNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

export interface NotificationListResponse {
  items: AdminNotification[];
  total: number;
  unread_count: number;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

const adminAccountService = {
  getProfile: (): Promise<AdminProfile> =>
    fetchJson<AdminProfile>(`${BASE}/profile`),

  updateProfile: (data: UpdateProfileData): Promise<AdminProfile> =>
    fetchJson<AdminProfile>(`${BASE}/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getPreferences: (): Promise<AdminPreferences> =>
    fetchJson<AdminPreferences>(`${BASE}/preferences`),

  updatePreferences: (data: Partial<AdminPreferences>): Promise<AdminPreferences> =>
    fetchJson<AdminPreferences>(`${BASE}/preferences`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getNotifications: (
    page = 1,
    pageSize = 20,
    unreadOnly = false,
  ): Promise<NotificationListResponse> => {
    let url = `${BASE}/notifications?page=${page}&page_size=${pageSize}`;
    if (unreadOnly) url += '&unread_only=true';
    return fetchJson<NotificationListResponse>(url);
  },

  markNotificationRead: (notificationId: string): Promise<{ success: boolean }> =>
    fetchJson(`${BASE}/notifications/${notificationId}/read`, {
      method: 'PUT',
    }),

  markAllNotificationsRead: (): Promise<{ success: boolean }> =>
    fetchJson(`${BASE}/notifications/read-all`, {
      method: 'PUT',
    }),

  changePassword: (data: {
    current_password: string;
    new_password: string;
  }): Promise<{ success: boolean }> =>
    fetchJson(`${BASE}/password`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export default adminAccountService;
