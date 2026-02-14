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
  const qs = new URLSearchParams();
  if (params.page != null) qs.set('page', String(params.page));
  if (params.page_size != null) qs.set('page_size', String(params.page_size));

  const response = await fetch(`${API_BASE}/notifications?${qs.toString()}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<PaginatedResponse<StaffNotification>>(response);
}

/** Mark specific notifications as read. */
export async function markRead(notificationIds: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/notifications/mark-read`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ notification_ids: notificationIds }),
  });
  return handleResponse<void>(response);
}

/** Mark all notifications as read. */
export async function markAllRead(): Promise<void> {
  const response = await fetch(`${API_BASE}/notifications/mark-all-read`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return handleResponse<void>(response);
}

/** Subscribe the current device for push notifications. */
export async function subscribePush(
  subscription: PushSubscriptionPayload,
): Promise<void> {
  const response = await fetch(`${API_BASE}/notifications/push/subscribe`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(subscription),
  });
  return handleResponse<void>(response);
}

/** Unsubscribe a device endpoint from push notifications. */
export async function unsubscribePush(endpoint: string): Promise<void> {
  const response = await fetch(`${API_BASE}/notifications/push/unsubscribe`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ endpoint }),
  });
  return handleResponse<void>(response);
}

/** Delete a single notification. */
export async function deleteNotification(notificationId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/notifications/${notificationId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse<void>(response);
}
