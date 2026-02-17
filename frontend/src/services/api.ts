import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { reportApiError } from './errorReporterService';

// ============================================================================
// API Configuration
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ============================================================================
// Token Refresh Mutex
// ============================================================================

// Prevents multiple concurrent 401 responses from triggering parallel refresh calls.
// The first 401 triggers the refresh; subsequent 401s wait for it to finish.
let refreshPromise: Promise<void> | null = null;

// ============================================================================
// Type Definitions
// ============================================================================

export interface ApiError {
  detail: string;
  status_code: number;
  path?: string;
  errors?: Array<{ loc: string[]; msg: string; type: string }>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// ============================================================================
// Axios Instance
// ============================================================================

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
  withCredentials: true, // Send httpOnly cookies with every request
});

// ============================================================================
// Request Interceptor
// ============================================================================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Cookies are sent automatically via withCredentials: true.
    // No need to manually attach Authorization header for browser clients.
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================================
// Response Interceptor
// ============================================================================

apiClient.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If no config, reject immediately
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Handle 401/403 auth errors — attempt silent refresh via cookie.
    // HTTPBearer returns 401 (with auto_error=False) when token is missing or invalid.
    const status = error.response?.status;
    if ((status === 401 || status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;

      // Use a mutex so only one refresh runs at a time; other errors wait for it
      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${API_BASE_URL}/api/v1/auth/refresh`, {}, { withCredentials: true })
          .then(() => {})
          .catch((refreshError) => {
            // Refresh failed — clear auth state and let ProtectedRoute handle redirect.
            // Avoid window.location.href which causes a full page reload and destroys
            // React state, making it impossible for the app to handle the transition.
            localStorage.removeItem('user');
            localStorage.removeItem('auth-storage');
            throw refreshError;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      try {
        await refreshPromise;
        // Retry original request — new access_token cookie is set by the refresh response
        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    // Report 5xx server errors to the error reporter
    if (error.response && error.response.status >= 500) {
      reportApiError(
        error.response.status,
        error.config?.url || 'unknown',
        error.config?.method || 'unknown',
        error.response.data,
      );
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

// ============================================================================
// Error Handler Utility
// ============================================================================

export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;

    if (axiosError.response?.data) {
      // Backend returned an error response
      return {
        detail: axiosError.response.data.detail || 'An error occurred',
        status_code: axiosError.response.status,
        path: axiosError.config?.url,
        errors: axiosError.response.data.errors,
      };
    } else if (axiosError.request) {
      // Request was made but no response received
      return {
        detail: 'No response from server. Please check your connection.',
        status_code: 0,
        path: axiosError.config?.url,
      };
    } else {
      // Error setting up the request
      return {
        detail: axiosError.message || 'Request setup failed',
        status_code: 0,
      };
    }
  }

  // Non-axios error
  return {
    detail: error instanceof Error ? error.message : 'An unknown error occurred',
    status_code: 0,
  };
};

// ============================================================================
// Exports
// ============================================================================

export default apiClient;
export { API_BASE_URL };
