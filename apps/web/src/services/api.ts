import { createApiClient } from '@uhs/api-client';
import { reportApiError } from './errorReporterService';

// ============================================================================
// API Configuration
// ============================================================================

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ============================================================================
// Axios Instance (shared by all 80+ service files)
// ============================================================================

const apiClient = createApiClient({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000,
  onAuthFailure: async () => {
    // Clear localStorage and Zustand state to prevent zombie authenticated state
    localStorage.removeItem('user');
    localStorage.removeItem('auth-storage');
    try {
      const { useAuthStore } = await import('@/store/authStore');
      useAuthStore.getState().logout();
    } catch (e) {
      console.error('Failed to clear auth store:', e);
    }
  },
  onServerError: (status, url, method, data) => {
    reportApiError(status, url, method, data);
  },
});

// ============================================================================
// Re-exports for backwards compatibility with all service files
// ============================================================================

export type { ApiError, ApiResponse } from '@uhs/api-client';
export { handleApiError } from '@uhs/api-client';
export default apiClient;
