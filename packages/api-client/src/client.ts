import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

export interface ApiClientConfig {
  baseURL: string;
  withCredentials?: boolean;
  timeout?: number;
  /** Called on auth failure after refresh attempt — typically calls logout() */
  onAuthFailure?: () => void;
  /** Called on 5xx errors — typically calls your error reporter */
  onServerError?: (status: number, url: string, method: string, data: unknown) => void;
}

/**
 * Factory function that creates a fully configured Axios instance.
 * Keeps import.meta.env out of this package — the calling app supplies baseURL.
 */
export function createApiClient(config: ApiClientConfig): AxiosInstance {
  const {
    baseURL,
    withCredentials = true,
    timeout = 30000,
    onAuthFailure,
    onServerError,
  } = config;

  const client = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
    timeout,
    withCredentials,
  });

  // Pass-through request interceptor.
  // Cookies are sent automatically via withCredentials: true.
  // No Authorization header manipulation needed.
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => config,
    (error) => Promise.reject(error),
  );

  // Mutex: prevents parallel refresh calls on multiple simultaneous 401s
  let refreshPromise: Promise<void> | null = null;

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      if (!originalRequest) return Promise.reject(error);

      const status = error.response?.status;

      // 401 → attempt silent token refresh (cookie-based)
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${baseURL}/api/v1/auth/refresh`, {}, { withCredentials: true })
            .then(() => {})
            .catch(async (refreshError) => {
              localStorage.removeItem('user');
              localStorage.removeItem('auth-storage');
              onAuthFailure?.();
              throw refreshError;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        try {
          await refreshPromise;
          return client(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }

      // Report 5xx errors
      if (error.response && error.response.status >= 500) {
        onServerError?.(
          error.response.status,
          error.config?.url || 'unknown',
          error.config?.method || 'unknown',
          error.response.data,
        );
      }

      return Promise.reject(error);
    },
  );

  return client;
}
