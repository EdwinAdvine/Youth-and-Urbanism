/**
 * Partner Account Service
 * API calls for profile, notifications, and settings
 */

import apiClient from '../api';
import type { PartnerProfile, PartnerNotification } from '../../types/partner';

const BASE_PATH = `/api/v1/partner/account`;

/**
 * Get partner profile
 */
export const getPartnerProfile = async (): Promise<PartnerProfile> => {
  const response = await apiClient.get(`${BASE_PATH}/profile`);
  return response.data;
};

/**
 * Update partner profile
 */
export const updatePartnerProfile = async (
  data: Partial<PartnerProfile>
): Promise<PartnerProfile> => {
  const response = await apiClient.put(`${BASE_PATH}/profile`, data);
  return response.data;
};

/**
 * Get notifications
 */
export const getNotifications = async (params?: {
  read?: boolean;
  category?: string;
  page?: number;
  limit?: number;
}): Promise<{
  items: PartnerNotification[];
  total: number;
  unread_count: number;
}> => {
  const response = await apiClient.get(`${BASE_PATH}/notifications`, { params });
  return response.data;
};

/**
 * Mark notification as read
 */
export const markNotificationRead = async (
  notificationId: string
): Promise<{ success: boolean }> => {
  const response = await apiClient.put(
    `${BASE_PATH}/notifications/${notificationId}/read`,
    {}
  );
  return response.data;
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsRead = async (): Promise<{ success: boolean; count: number }> => {
  const response = await apiClient.put(
    `${BASE_PATH}/notifications/read-all`,
    {}
  );
  return response.data;
};

/**
 * Update settings
 */
export const updateSettings = async (data: {
  email_notifications?: boolean;
  push_notifications?: boolean;
  weekly_reports?: boolean;
  ai_insights?: boolean;
  notification_preferences?: {
    child_alerts: boolean;
    payment_reminders: boolean;
    program_updates: boolean;
    impact_reports: boolean;
  };
}): Promise<{ success: boolean; settings: unknown }> => {
  const response = await apiClient.put(`${BASE_PATH}/settings`, data);
  return response.data;
};

/**
 * Get team members
 */
export const getTeamMembers = async (): Promise<
  Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    permissions: string[];
    added_at: string;
  }>
> => {
  const response = await apiClient.get(`${BASE_PATH}/team`);
  return response.data;
};

/**
 * Add team member
 */
export const addTeamMember = async (data: {
  name: string;
  email: string;
  role: string;
  permissions: string[];
}): Promise<{ success: boolean; member: unknown }> => {
  const response = await apiClient.post(`${BASE_PATH}/team`, data);
  return response.data;
};

export default {
  getPartnerProfile,
  updatePartnerProfile,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  updateSettings,
  getTeamMembers,
  addTeamMember,
};
