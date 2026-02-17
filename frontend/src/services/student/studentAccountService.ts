/**
 * Student Account Service - Notifications, Profile, Preferences, Privacy
 */
import apiClient from '../api';

const API_PREFIX = '/api/v1/student/account';

/**
 * Get notifications
 */
export const getNotifications = async (params?: {
  category?: string;
  unread_only?: boolean;
  limit?: number;
}) => {
  const response = await apiClient.get(`${API_PREFIX}/notifications`, { params });
  return response.data;
};

/**
 * Mark notification as read
 */
export const markNotificationRead = async (notificationId: string) => {
  const response = await apiClient.put(`${API_PREFIX}/notifications/${notificationId}/read`, {});
  return response.data;
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsRead = async () => {
  const response = await apiClient.put(`${API_PREFIX}/notifications/read-all`, {});
  return response.data;
};

/**
 * Get notification settings
 */
export const getNotificationSettings = async () => {
  const response = await apiClient.get(`${API_PREFIX}/notifications/settings`);
  return response.data;
};

/**
 * Update notification settings
 */
export const updateNotificationSettings = async (settings: Record<string, unknown>) => {
  const response = await apiClient.put(`${API_PREFIX}/notifications/settings`, settings);
  return response.data;
};

/**
 * Get student profile
 */
export const getProfile = async () => {
  const response = await apiClient.get(`${API_PREFIX}/profile`);
  return response.data;
};

/**
 * Update student profile
 */
export const updateProfile = async (data: {
  first_name?: string;
  last_name?: string;
  bio?: string;
  avatar_url?: string;
  learning_style?: string;
  interests?: string[];
}) => {
  const response = await apiClient.put(`${API_PREFIX}/profile`, data);
  return response.data;
};

/**
 * Get student preferences
 */
export const getPreferences = async () => {
  const response = await apiClient.get(`${API_PREFIX}/preferences`);
  return response.data;
};

/**
 * Update student preferences
 */
export const updatePreferences = async (data: {
  theme?: string;
  language?: string;
  age_ui_mode?: string;
  ai_personality?: string;
  font_size?: string;
  animations_enabled?: boolean;
  sound_effects?: boolean;
  auto_play_voice?: boolean;
  daily_goal_minutes?: number;
}) => {
  const response = await apiClient.put(`${API_PREFIX}/preferences`, data);
  return response.data;
};

/**
 * Get privacy settings
 */
export const getPrivacySettings = async () => {
  const response = await apiClient.get(`${API_PREFIX}/privacy`);
  return response.data;
};

/**
 * Update privacy settings
 */
export const updatePrivacySettings = async (data: Record<string, unknown>) => {
  const response = await apiClient.put(`${API_PREFIX}/privacy`, data);
  return response.data;
};

/**
 * Submit COPPA consent
 */
export const submitCOPPAConsent = async (data: {
  consent_type: string;
  is_granted: boolean;
  parent_id?: string;
}) => {
  const response = await apiClient.post(`${API_PREFIX}/privacy/consent`, data);
  return response.data;
};

/**
 * Get privacy audit
 */
export const getPrivacyAudit = async () => {
  const response = await apiClient.get(`${API_PREFIX}/privacy/audit`);
  return response.data;
};

/**
 * Get teacher access controls
 */
export const getTeacherAccess = async () => {
  const response = await apiClient.get(`${API_PREFIX}/teacher-access`);
  return response.data;
};

/**
 * Update teacher access permissions
 */
export const updateTeacherAccess = async (teacherId: string, data: {
  can_view_progress?: boolean;
  can_view_mood?: boolean;
  can_view_ai_chats?: boolean;
  can_view_journal?: boolean;
  can_message?: boolean;
  can_view_community_activity?: boolean;
}) => {
  const response = await apiClient.put(`${API_PREFIX}/teacher-access/${teacherId}`, data);
  return response.data;
};
