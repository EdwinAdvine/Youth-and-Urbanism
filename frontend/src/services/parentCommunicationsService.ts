/**
 * Parent Communications Service
 *
 * API client for notifications, messages, and support.
 */

import api from './api';
import type {
  NotificationsListResponse,
  ParentNotificationResponse,
  NotificationCountsResponse,
  ConversationsListResponse,
  ConversationMessagesResponse,
  SendMessageRequest,
  SupportArticlesResponse,
  SupportTicketsListResponse,
  CreateSupportTicketRequest
} from '../types/parent';

/**
 * Get parent notifications
 */
export const getNotifications = async (params?: {
  notificationType?: string;
  isRead?: boolean;
  limit?: number;
  offset?: number;
}): Promise<NotificationsListResponse> => {
  const response = await api.get('/parent/communications/notifications', { params });
  return response.data;
};

/**
 * Mark notification as read
 */
export const markNotificationRead = async (notificationId: string): Promise<ParentNotificationResponse> => {
  const response = await api.put(`/parent/communications/notifications/${notificationId}/read`);
  return response.data;
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsRead = async (): Promise<void> => {
  await api.put('/parent/communications/notifications/read-all');
};

/**
 * Get notification counts by type
 */
export const getNotificationCounts = async (): Promise<NotificationCountsResponse> => {
  const response = await api.get('/parent/communications/notifications/counts');
  return response.data;
};

/**
 * Get list of conversations
 */
export const getConversations = async (channel?: string): Promise<ConversationsListResponse> => {
  const response = await api.get('/parent/communications/messages/conversations', {
    params: { channel }
  });
  return response.data;
};

/**
 * Get messages in a conversation
 */
export const getConversationMessages = async (conversationId: string): Promise<ConversationMessagesResponse> => {
  const response = await api.get(`/parent/communications/messages/conversations/${conversationId}`);
  return response.data;
};

/**
 * Send a message (REST fallback)
 */
export const sendMessage = async (request: SendMessageRequest): Promise<void> => {
  await api.post('/parent/communications/messages/send', request);
};

/**
 * Mark message as read
 */
export const markMessageRead = async (messageId: string): Promise<void> => {
  await api.put(`/parent/communications/messages/${messageId}/read`);
};

/**
 * Get support articles
 */
export const getSupportArticles = async (params?: {
  category?: string;
  search?: string;
}): Promise<SupportArticlesResponse> => {
  const response = await api.get('/parent/communications/support/articles', { params });
  return response.data;
};

/**
 * Get support tickets
 */
export const getSupportTickets = async (status?: string): Promise<SupportTicketsListResponse> => {
  const response = await api.get('/parent/communications/support/tickets', {
    params: { status }
  });
  return response.data;
};

/**
 * Create support ticket
 */
export const createSupportTicket = async (request: CreateSupportTicketRequest): Promise<void> => {
  await api.post('/parent/communications/support/tickets', request);
};

/**
 * Add message to support ticket
 */
export const addTicketMessage = async (ticketId: string, content: string): Promise<void> => {
  await api.post(`/parent/communications/support/tickets/${ticketId}/messages`, { content });
};
