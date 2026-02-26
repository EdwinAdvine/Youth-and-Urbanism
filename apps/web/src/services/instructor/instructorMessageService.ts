/**
 * Instructor Message Service
 *
 * API calls to /api/v1/instructor/interactions/messages endpoints.
 */
import apiClient from '../api';

export interface Conversation {
  id: string;
  participant_name: string;
  participant_avatar?: string;
  participant_role: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  sent_at: string;
  is_read: boolean;
}

export async function getConversations(): Promise<Conversation[]> {
  const { data } = await apiClient.get<Conversation[]>(
    '/api/v1/instructor/interactions/messages',
  );
  return data;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data } = await apiClient.get<Message[]>(
    `/api/v1/instructor/interactions/messages/${conversationId}`,
  );
  return data;
}

export async function sendMessage(
  conversationId: string,
  content: string,
): Promise<Message> {
  const { data } = await apiClient.post<Message>(
    `/api/v1/instructor/interactions/messages/${conversationId}`,
    { content },
  );
  return data;
}
