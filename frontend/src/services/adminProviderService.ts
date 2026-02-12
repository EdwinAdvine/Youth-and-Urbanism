import apiClient from './api';

/**
 * AI Provider Interface
 * Represents an AI provider in the system
 */
export interface AIProvider {
  id: string;
  name: string;
  provider_type: 'text' | 'voice' | 'video' | 'multimodal';
  api_endpoint: string;
  specialization?: string;
  is_active: boolean;
  is_recommended: boolean;
  cost_per_request?: number;
  configuration: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * AI Provider Create Interface
 * Data required to create a new AI provider
 */
export interface AIProviderCreate {
  name: string;
  provider_type: 'text' | 'voice' | 'video' | 'multimodal';
  api_endpoint: string;
  api_key: string;
  specialization?: string;
  is_recommended?: boolean;
  cost_per_request?: number;
  configuration?: Record<string, any>;
}

/**
 * AI Provider Update Interface
 * Data that can be updated for an existing AI provider
 */
export interface AIProviderUpdate {
  name?: string;
  provider_type?: 'text' | 'voice' | 'video' | 'multimodal';
  api_endpoint?: string;
  api_key?: string;
  specialization?: string;
  is_active?: boolean;
  is_recommended?: boolean;
  cost_per_request?: number;
  configuration?: Record<string, any>;
}

/**
 * AI Provider List Response Interface
 * Response format for list providers endpoint
 */
export interface AIProviderListResponse {
  items: AIProvider[];
  total: number;
}

/**
 * Recommended Provider Interface
 * Represents a recommended AI provider template
 */
export interface RecommendedProvider {
  name: string;
  provider_type: string;
  description: string;
  specialization: string;
}

/**
 * Admin Provider Service Class
 * Handles all admin AI provider management API calls
 *
 * Backend API Endpoints:
 * - GET /api/v1/admin/ai-providers/ - List all AI providers
 * - GET /api/v1/admin/ai-providers/recommended - Get recommended providers
 * - POST /api/v1/admin/ai-providers/ - Create new provider
 * - GET /api/v1/admin/ai-providers/{id} - Get provider details
 * - PUT /api/v1/admin/ai-providers/{id} - Update provider
 * - DELETE /api/v1/admin/ai-providers/{id} - Deactivate provider
 */
class AdminProviderService {
  /**
   * List all AI providers
   * @param activeOnly - If true, only return active providers
   * @returns Promise with list of providers and total count
   */
  async listProviders(activeOnly: boolean = false): Promise<AIProviderListResponse> {
    const response = await apiClient.get<AIProviderListResponse>(
      `/api/v1/admin/ai-providers/?active_only=${activeOnly}`
    );
    return response.data;
  }

  /**
   * Get recommended AI providers
   * Returns a list of recommended provider templates that admins can use
   * @returns Promise with array of recommended providers
   */
  async getRecommended(): Promise<RecommendedProvider[]> {
    const response = await apiClient.get<RecommendedProvider[]>(
      '/api/v1/admin/ai-providers/recommended'
    );
    return response.data;
  }

  /**
   * Create a new AI provider
   * @param data - Provider creation data including API key
   * @returns Promise with newly created provider
   */
  async createProvider(data: AIProviderCreate): Promise<AIProvider> {
    const response = await apiClient.post<AIProvider>('/api/v1/admin/ai-providers/', data);
    return response.data;
  }

  /**
   * Get details of a specific AI provider
   * @param id - Provider UUID
   * @returns Promise with provider details
   */
  async getProvider(id: string): Promise<AIProvider> {
    const response = await apiClient.get<AIProvider>(`/api/v1/admin/ai-providers/${id}`);
    return response.data;
  }

  /**
   * Update an existing AI provider
   * @param id - Provider UUID
   * @param data - Provider update data (partial updates supported)
   * @returns Promise with updated provider
   */
  async updateProvider(id: string, data: AIProviderUpdate): Promise<AIProvider> {
    const response = await apiClient.put<AIProvider>(`/api/v1/admin/ai-providers/${id}`, data);
    return response.data;
  }

  /**
   * Deactivate an AI provider
   * Soft delete - sets is_active to false
   * @param id - Provider UUID
   * @returns Promise with success message
   */
  async deactivateProvider(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/api/v1/admin/ai-providers/${id}`);
    return response.data;
  }
}

// Export singleton instance
export default new AdminProviderService();
