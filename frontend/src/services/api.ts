import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// ============================================================================
// API Configuration
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
  withCredentials: false, // Set to true if using cookies for auth
});

// ============================================================================
// Request Interceptor
// ============================================================================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add JWT token to request headers if available
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request errors
    console.error('Request error:', error);
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

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          // Attempt to refresh the access token
          const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token: newRefreshToken } = response.data;

          // Store new tokens
          localStorage.setItem('access_token', access_token);
          if (newRefreshToken) {
            localStorage.setItem('refresh_token', newRefreshToken);
          }

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }

          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed - clear auth data and redirect to login
          console.error('Token refresh failed:', refreshError);

          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');

          // Redirect to login page
          window.location.href = '/';

          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available - clear auth data and redirect
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');

        window.location.href = '/';
      }
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
