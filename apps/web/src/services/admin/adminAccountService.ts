/**
 * Admin Account Service - Phase 9
 *
 * Provides typed API calls for admin profile management,
 * preferences, and notification settings.
 *
 * Uses the existing users table + profile_data JSONB column.
 */

import apiClient from '../api';

const BASE = `/api/v1/admin/account`;

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
  getProfile: async (): Promise<AdminProfile> => {
    const r = await apiClient.get(`${BASE}/profile`);
    return r.data.data ?? r.data;
  },

  updateProfile: async (data: UpdateProfileData): Promise<AdminProfile> => {
    const r = await apiClient.put(`${BASE}/profile`, data);
    return r.data.data ?? r.data;
  },

  getPreferences: async (): Promise<AdminPreferences> => {
    const r = await apiClient.get(`${BASE}/preferences`);
    return r.data.data ?? r.data;
  },

  updatePreferences: async (data: Partial<AdminPreferences>): Promise<AdminPreferences> => {
    const r = await apiClient.put(`${BASE}/preferences`, data);
    return r.data.data ?? r.data;
  },

  getNotifications: async (
    page = 1,
    pageSize = 20,
    unreadOnly = false,
  ): Promise<NotificationListResponse> => {
    const params: Record<string, string | number | boolean> = { page, page_size: pageSize };
    if (unreadOnly) params.unread_only = true;
    const r = await apiClient.get(`${BASE}/notifications`, { params });
    return r.data.data ?? r.data;
  },

  markNotificationRead: async (notificationId: string): Promise<{ success: boolean }> => {
    const r = await apiClient.put(`${BASE}/notifications/${notificationId}/read`);
    return r.data.data ?? r.data;
  },

  markAllNotificationsRead: async (): Promise<{ success: boolean }> => {
    const r = await apiClient.put(`${BASE}/notifications/read-all`);
    return r.data.data ?? r.data;
  },

  changePassword: async (data: {
    current_password: string;
    new_password: string;
  }): Promise<{ success: boolean }> => {
    const r = await apiClient.put(`${BASE}/password`, data);
    return r.data.data ?? r.data;
  },
};

export default adminAccountService;
