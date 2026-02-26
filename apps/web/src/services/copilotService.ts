/**
 * CoPilot API Service
 *
 * Centralized client for all AI CoPilot API endpoints.
 * Handles chat requests, session management, agent profile customization,
 * and contextual insights for all user roles.
 *
 * Features:
 * - Text and voice response modes
 * - Server-Sent Events (SSE) streaming for real-time responses
 * - Session CRUD operations (list, get, update, delete)
 * - Agent profile management (get, update, reset)
 * - Role-specific contextual insights
 * - Automatic JWT authentication via apiClient interceptors
 */

import apiClient from './api';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

/** Chat request payload for sending a message to the AI CoPilot */
export interface CopilotChatRequest {
  /** User's message to the AI */
  message: string;
  /** Session ID (null creates a new session) */
  session_id?: string | null;
  /** Response format: text or voice */
  response_mode?: 'text' | 'voice';
  /** Whether to include conversation history in context */
  include_context?: boolean;
  /** Number of recent messages to include as context (1-50) */
  context_messages?: number;
}

/** Chat response from the AI CoPilot */
export interface CopilotChatResponse {
  /** AI's text response */
  message: string;
  /** Session ID for this conversation */
  session_id: string;
  /** Unique ID for this message */
  message_id: string;
  /** Actual response mode delivered */
  response_mode: string;
  /** URL to audio file (voice mode) */
  audio_url?: string | null;
  /** AI provider that generated the response */
  provider_used?: string | null;
  /** Response timestamp */
  timestamp: string;
}

/** Summary of a CoPilot session (list view) */
export interface CopilotSessionSummary {
  id: string;
  title: string;
  summary?: string | null;
  message_count: number;
  response_mode: string;
  is_pinned: boolean;
  last_message_at?: string | null;
  created_at: string;
  updated_at: string;
}

/** Paginated list of CoPilot sessions */
export interface CopilotSessionList {
  sessions: CopilotSessionSummary[];
  total: number;
  page: number;
  page_size: number;
}

/** Individual message in a session */
export interface CopilotMessageOut {
  id: string;
  /** "user" or "assistant" */
  role: string;
  content: string;
  audio_url?: string | null;
  provider_used?: string | null;
  created_at: string;
}

/** Detailed view of a session with all messages */
export interface CopilotSessionDetail {
  id: string;
  title: string;
  summary?: string | null;
  response_mode: string;
  is_pinned: boolean;
  message_count: number;
  messages: CopilotMessageOut[];
  created_at: string;
  updated_at: string;
}

/** Schema for updating session metadata */
export interface CopilotSessionUpdate {
  title?: string;
  is_pinned?: boolean;
  response_mode?: 'text' | 'voice';
}

/** Single contextual insight or tip for the user */
export interface CopilotInsight {
  /** Insight category: tip, reminder, alert, metric */
  type: string;
  /** Short insight title */
  title: string;
  /** Detailed insight message */
  body: string;
  /** Priority level (higher = more important) */
  priority: number;
  /** Frontend route to navigate to when clicked */
  action_url?: string | null;
  /** Additional insight metadata */
  metadata: Record<string, any>;
}

/** Response containing role-specific insights */
export interface CopilotInsightsResponse {
  /** User's role */
  role: string;
  /** Array of contextual insights */
  insights: CopilotInsight[];
  /** When insights were generated */
  generated_at: string;
}

/** AI Agent Profile (custom persona and settings) */
export interface AIAgentProfile {
  id: string;
  user_id: string;
  /** Agent's name (e.g., "Susie", "Professor Oak") */
  agent_name: string;
  /** Agent's personality and tone */
  persona: string;
  /** Agent's areas of expertise */
  expertise_focus: string;
  /** Agent avatar image URL */
  avatar_url?: string | null;
  /** Custom instructions for the agent */
  custom_instructions: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Payload for updating agent profile */
export interface AIAgentProfileUpdate {
  agent_name?: string;
  persona?: string;
  expertise_focus?: string;
  avatar_url?: string | null;
  custom_instructions?: string;
}

// ============================================================================
// CoPilot Service Class
// ============================================================================

class CopilotService {
  /**
   * Send a message to the AI CoPilot and receive a response.
   *
   * This is the main chat interface. It handles session creation automatically
   * if no session_id is provided, generates session titles from the first message,
   * and supports text and voice response modes.
   *
   * @param request - Chat request with message and optional session ID
   * @returns AI response with message, session ID, and metadata
   */
  async chat(request: CopilotChatRequest): Promise<CopilotChatResponse> {
    const response = await apiClient.post<CopilotChatResponse>(
      '/api/v1/copilot/chat',
      request
    );
    return response.data;
  }

  /**
   * Send a message with Server-Sent Events streaming.
   *
   * This provides real-time token-by-token streaming of AI responses.
   * Use the callbacks to handle incoming tokens and completion.
   *
   * @param request - Chat request
   * @param onToken - Callback for each token received
   * @param onDone - Callback when streaming is complete
   * @param onError - Callback for errors
   */
  async chatStream(
    request: CopilotChatRequest,
    onToken: (token: string) => void,
    onDone: (response: CopilotChatResponse) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/copilot/chat/stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is null');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            try {
              const event = JSON.parse(data);

              if (event.error) {
                onError(event.error);
                return;
              }

              if (event.done) {
                onDone(event as CopilotChatResponse);
                return;
              }

              if (event.token) {
                onToken(event.token);
              }
            } catch (e) {
              console.error('Failed to parse SSE event:', e);
            }
          }
        }
      }
    } catch (error: any) {
      onError(error.message || 'Streaming failed');
    }
  }

  /**
   * List user's conversation sessions with pagination.
   *
   * Returns sessions ordered by most recently updated first.
   * Only non-deleted sessions with at least one message are returned.
   *
   * @param page - Page number (1-indexed), default 1
   * @param page_size - Items per page (max 100), default 20
   * @returns Paginated list of sessions
   */
  async listSessions(
    page: number = 1,
    page_size: number = 20
  ): Promise<CopilotSessionList> {
    const response = await apiClient.get<CopilotSessionList>(
      '/api/v1/copilot/sessions',
      {
        params: { page, page_size },
      }
    );
    return response.data;
  }

  /**
   * Get detailed session information with all messages.
   *
   * Loads the complete conversation history for a session.
   *
   * @param sessionId - UUID of the session
   * @returns Session details with messages
   */
  async getSession(sessionId: string): Promise<CopilotSessionDetail> {
    const response = await apiClient.get<CopilotSessionDetail>(
      `/api/v1/copilot/sessions/${sessionId}`
    );
    return response.data;
  }

  /**
   * Update session metadata (title, pinned status, response mode).
   *
   * @param sessionId - UUID of the session
   * @param updateData - Fields to update
   * @returns Updated session details
   */
  async updateSession(
    sessionId: string,
    updateData: CopilotSessionUpdate
  ): Promise<CopilotSessionDetail> {
    const response = await apiClient.patch<CopilotSessionDetail>(
      `/api/v1/copilot/sessions/${sessionId}`,
      updateData
    );
    return response.data;
  }

  /**
   * Soft-delete a conversation session.
   *
   * Marks the session as deleted without actually removing it.
   * Deleted sessions are hidden from session lists.
   *
   * @param sessionId - UUID of the session to delete
   */
  async deleteSession(sessionId: string): Promise<void> {
    await apiClient.delete(`/api/v1/copilot/sessions/${sessionId}`);
  }

  /**
   * Get role-specific contextual insights and tips.
   *
   * Generates personalized insights by querying relevant data based on
   * the user's role and current activity.
   *
   * @returns Role-specific insights
   */
  async getInsights(): Promise<CopilotInsightsResponse> {
    const response = await apiClient.get<CopilotInsightsResponse>(
      '/api/v1/copilot/insights'
    );
    return response.data;
  }

  /**
   * Get user's AI agent profile (persona, name, expertise).
   *
   * @returns Agent profile settings
   */
  async getAgentProfile(): Promise<AIAgentProfile> {
    const response = await apiClient.get<AIAgentProfile>(
      '/api/v1/ai-agent/profile'
    );
    return response.data;
  }

  /**
   * Update user's AI agent profile settings.
   *
   * @param updateData - Fields to update
   * @returns Updated agent profile
   */
  async updateAgentProfile(
    updateData: AIAgentProfileUpdate
  ): Promise<AIAgentProfile> {
    const response = await apiClient.patch<AIAgentProfile>(
      '/api/v1/ai-agent/profile',
      updateData
    );
    return response.data;
  }

  /**
   * Reset agent profile to role-specific defaults.
   *
   * @returns Reset agent profile
   */
  async resetAgentProfile(): Promise<AIAgentProfile> {
    const response = await apiClient.post<AIAgentProfile>(
      '/api/v1/ai-agent/profile/reset'
    );
    return response.data;
  }
}

// Export singleton instance
const copilotService = new CopilotService();
export default copilotService;
