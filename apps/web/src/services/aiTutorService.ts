import apiClient from './api';

// ============================================================================
// Type Definitions
// ============================================================================

export interface ChatRequest {
  message: string;
  include_context?: boolean;
  context_messages?: number;
}

export interface ChatResponse {
  message: string;
  response_mode: 'text' | 'voice';
  audio_url?: string;
  timestamp: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  response_mode?: string;
  audio_url?: string;
}

export interface ConversationHistoryResponse {
  messages: ConversationMessage[];
  total_interactions: number;
}

export interface ResponseModeUpdate {
  response_mode: 'text' | 'voice';
}

export interface TutorStatusResponse {
  total_interactions: number;
  last_interaction?: string;
  performance_metrics: Record<string, any>;
  learning_path: Record<string, any>;
  response_mode: string;
}

// ============================================================================
// AI Tutor Service Class
// ============================================================================

class AITutorService {
  /**
   * Send a message to the AI tutor
   * @param request - Chat request with message and optional context
   * @returns AI tutor's response
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await apiClient.post<ChatResponse>('/api/v1/ai-tutor/chat', request);
    return response.data;
  }

  /**
   * Get conversation history with pagination
   * @param limit - Maximum number of messages to retrieve (default: 50)
   * @param offset - Number of messages to skip (default: 0)
   * @returns Conversation history and total interaction count
   */
  async getHistory(limit: number = 50, offset: number = 0): Promise<ConversationHistoryResponse> {
    const response = await apiClient.get<ConversationHistoryResponse>(
      `/api/v1/ai-tutor/history?limit=${limit}&offset=${offset}`
    );
    return response.data;
  }

  /**
   * Update the AI tutor's response mode
   * @param mode - Response mode (text or voice)
   */
  async updateResponseMode(mode: 'text' | 'voice'): Promise<void> {
    await apiClient.put('/api/v1/ai-tutor/response-mode', {
      response_mode: mode
    });
  }

  /**
   * Get the current status of the AI tutor
   * @returns Tutor status including metrics and learning path
   */
  async getStatus(): Promise<TutorStatusResponse> {
    const response = await apiClient.get<TutorStatusResponse>('/api/v1/ai-tutor/status');
    return response.data;
  }

  /**
   * Reset the conversation history
   * Clears all previous interactions with the AI tutor
   */
  async resetConversation(): Promise<void> {
    await apiClient.post('/api/v1/ai-tutor/reset');
  }

  /**
   * Check the health status of the AI tutor service
   * @returns Health check response
   */
  async healthCheck(): Promise<{ status: string }> {
    const response = await apiClient.get<{ status: string }>('/api/v1/ai-tutor/health');
    return response.data;
  }
}

// ============================================================================
// Exports
// ============================================================================

export default new AITutorService();
