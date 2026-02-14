/**
 * Student Account Service - Notifications, Profile, Preferences, Privacy
 */
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_PREFIX = '/api/v1/student/account';

/**
 * Get notifications
 */
export const getNotifications = async (params?: {
  category?: string;
  unread_only?: boolean;
  limit?: number;
}) => {
  const token = localStorage.getItem('access_token');
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, String(value));
    });
  }

  const response = await axios.get(`${API_BASE}${API_PREFIX}/notifications?${queryParams}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

/**
 * Mark notification as read
 */
export const markNotificationRead = async (notificationId: string) => {
  const token = localStorage.getItem('access_token');
  const response = await axios.put(`${API_BASE}${API_PREFIX}/notifications/${notificationId}/read`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsRead = async () => {
  const token = localStorage.getItem('access_token');
  const response = await axios.put(`${API_BASE}${API_PREFIX}/notifications/read-all`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

/**
 * Get notification settings
 */
export const getNotificationSettings = async () => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/notifications/settings`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

/**
 * Update notification settings
 */
export const updateNotificationSettings = async (settings: Record<string, unknown>) => {
  const token = localStorage.getItem('access_token');
  const response = await axios.put(`${API_BASE}${API_PREFIX}/notifications/settings`,
    settings,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

/**
 * Get student profile
 */
export const getProfile = async () => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });
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
  const token = localStorage.getItem('access_token');
  const response = await axios.put(`${API_BASE}${API_PREFIX}/profile`,
    data,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

/**
 * Get student preferences
 */
export const getPreferences = async () => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/preferences`, {
    headers: { Authorization: `Bearer ${token}` }
  });
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
  const token = localStorage.getItem('access_token');
  const response = await axios.put(`${API_BASE}${API_PREFIX}/preferences`,
    data,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

/**
 * Get privacy settings
 */
export const getPrivacySettings = async () => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/privacy`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

/**
 * Update privacy settings
 */
export const updatePrivacySettings = async (data: Record<string, unknown>) => {
  const token = localStorage.getItem('access_token');
  const response = await axios.put(`${API_BASE}${API_PREFIX}/privacy`,
    data,
    { headers: { Authorization: `Bearer ${token}` } }
  );
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
  const token = localStorage.getItem('access_token');
  const response = await axios.post(`${API_BASE}${API_PREFIX}/privacy/consent`,
    data,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

/**
 * Get privacy audit
 */
export const getPrivacyAudit = async () => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/privacy/audit`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

/**
 * Get teacher access controls
 */
export const getTeacherAccess = async () => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/teacher-access`, {
    headers: { Authorization: `Bearer ${token}` }
  });
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
  const token = localStorage.getItem('access_token');
  const response = await axios.put(`${API_BASE}${API_PREFIX}/teacher-access/${teacherId}`,
    data,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};
