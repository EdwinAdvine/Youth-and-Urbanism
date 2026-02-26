/**
 * Public Chat Service
 *
 * Unauthenticated API client for the homepage Bird Chat (/bot page).
 * Uses a plain fetch call — no JWT token, no apiClient interceptor.
 * Communicates with POST /api/v1/public/chat on the backend.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface PublicChatSuggestedCourse {
  name: string;
  learning_area: string;
  url: string;
}

export interface PublicChatResponse {
  message: string;
  suggested_course: PublicChatSuggestedCourse | null;
}

/**
 * Send a message to the public Bird AI chat.
 * No authentication required.
 *
 * @param message - User's message
 * @returns AI response with optional course suggestion
 * @throws Error on network failure or rate-limit (429)
 */
export async function publicChat(message: string): Promise<PublicChatResponse> {
  const response = await fetch(`${API_URL}/api/v1/public/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  if (response.status === 429) {
    throw new Error('Too many messages — please wait a moment before trying again.');
  }

  if (!response.ok) {
    throw new Error(`Chat request failed (${response.status}). Please try again.`);
  }

  return response.json() as Promise<PublicChatResponse>;
}
