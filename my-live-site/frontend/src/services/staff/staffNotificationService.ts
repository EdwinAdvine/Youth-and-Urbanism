/**
 * Staff Notification Service
 *
 * Wraps API calls to /api/v1/staff/notifications endpoints for managing
 * in-app notifications, read states, push subscription management, and
 * individual notification deletion.
 */

import type {
  PaginatedResponse,
  StaffNotification,
} from '../../types/staff';
import apiClient from '../api';

// ---------------------------------------------------------------------------
// Types local to this service
// ---------------------------------------------------------------------------

export interface NotificationListParams {
  page?: number;
  page_size?: number;
}

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

/** Fetch a paginated list of notifications for the current staff member. */
export async function getNotifications(
  params: NotificationListParams = {},
): Promise<PaginatedResponse<StaffNotification>> {
  const { data } = await apiClient.get<PaginatedResponse<StaffNotification>>(
    '/api/v1/staff/notifications',
    { params },
  );
  return data;
}

/** Mark specific notifications as read. */
export async function markRead(notificationIds: string[]): Promise<void> {
  await apiClient.post('/api/v1/staff/notifications/mark-read', {
    notification_ids: notificationIds,
  });
}

/** Mark all notifications as read. */
export async function markAllRead(): Promise<void> {
  await apiClient.post('/api/v1/staff/notifications/mark-all-read');
}

/** Subscribe the current device for push notifications. */
export async function subscribePush(
  subscription: PushSubscriptionPayload,
): Promise<void> {
  await apiClient.post('/api/v1/staff/notifications/push/subscribe', subscription);
}

/** Unsubscribe a device endpoint from push notifications. */
export async function unsubscribePush(endpoint: string): Promise<void> {
  await apiClient.post('/api/v1/staff/notifications/push/unsubscribe', { endpoint });
}

/** Delete a single notification. */
export async function deleteNotification(notificationId: string): Promise<void> {
  await apiClient.delete(`/api/v1/staff/notifications/${notificationId}`);
}
