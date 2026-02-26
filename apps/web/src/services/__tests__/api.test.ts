import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios, { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';

// Mock the errorReporterService before importing api module
vi.mock('../errorReporterService', () => ({
  reportApiError: vi.fn(),
}));

import apiClient, { handleApiError } from '../api';
import { reportApiError } from '../errorReporterService';

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // ---------- Request Interceptor ----------

  describe('request interceptor', () => {
    it('should return config as-is (cookie-based auth uses withCredentials)', () => {
      const config: InternalAxiosRequestConfig = {
        headers: new AxiosHeaders(),
        url: '/api/v1/test',
        method: 'get',
      };

      // Access the request interceptor handlers
      const interceptors = (apiClient.interceptors.request as any).handlers;
      const requestInterceptor = interceptors[0];
      const result = requestInterceptor.fulfilled(config);

      // Cookie-based auth doesn't add Authorization header
      expect(result.headers.Authorization).toBeUndefined();
      expect(result.url).toBe('/api/v1/test');
    });

    it('should pass through request config without modification', () => {
      const config: InternalAxiosRequestConfig = {
        headers: new AxiosHeaders({ 'X-Custom': 'value' }),
        url: '/api/v1/test',
        method: 'post',
      };

      const interceptors = (apiClient.interceptors.request as any).handlers;
      const requestInterceptor = interceptors[0];
      const result = requestInterceptor.fulfilled(config);

      expect(result.headers.get('X-Custom')).toBe('value');
    });
  });

  // ---------- Response Interceptor ----------

  describe('response interceptor', () => {
    it('should attempt token refresh on 401 response via cookie-based endpoint', async () => {
      const postSpy = vi.spyOn(axios, 'post').mockResolvedValueOnce({ data: {} });

      const interceptors = (apiClient.interceptors.response as any).handlers;
      const responseInterceptor = interceptors[0];

      const axiosError = {
        response: { status: 401 },
        config: {
          headers: new AxiosHeaders(),
          url: '/api/v1/protected',
          method: 'get',
          _retry: false,
        },
      } as unknown as AxiosError;

      try {
        await responseInterceptor.rejected(axiosError);
      } catch {
        // May throw because apiClient retry will fail without a real server
      }

      expect(postSpy).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/auth/refresh'),
        {},
        { withCredentials: true },
      );

      postSpy.mockRestore();
    });

    it('should clear auth data when refresh fails', async () => {
      localStorage.setItem('user', 'some-user');
      localStorage.setItem('auth-storage', 'some-data');

      const postSpy = vi.spyOn(axios, 'post').mockRejectedValueOnce(new Error('refresh failed'));

      const interceptors = (apiClient.interceptors.response as any).handlers;
      const responseInterceptor = interceptors[0];

      const axiosError = {
        response: { status: 401 },
        config: {
          headers: new AxiosHeaders(),
          url: '/api/v1/private',
          method: 'get',
          _retry: false,
        },
      } as unknown as AxiosError;

      try {
        await responseInterceptor.rejected(axiosError);
      } catch {
        // Expected to reject
      }

      expect(localStorage.getItem('user')).toBeNull();
      // auth-storage is removed by the interceptor, but Zustand's persist middleware
      // may re-write it with an empty/logged-out state during the logout() call
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        expect(parsed.state.user).toBeNull();
        expect(parsed.state.isAuthenticated).toBe(false);
      }

      postSpy.mockRestore();
    });

    it('should report 5xx errors to errorReporterService', async () => {
      const interceptors = (apiClient.interceptors.response as any).handlers;
      const responseInterceptor = interceptors[0];

      const axiosError = {
        response: {
          status: 500,
          data: { detail: 'Internal Server Error' },
        },
        config: {
          headers: new AxiosHeaders(),
          url: '/api/v1/crash',
          method: 'post',
        },
      } as unknown as AxiosError;

      try {
        await responseInterceptor.rejected(axiosError);
      } catch {
        // Expected to reject
      }

      expect(reportApiError).toHaveBeenCalledWith(
        500,
        '/api/v1/crash',
        'post',
        { detail: 'Internal Server Error' },
      );
    });

    it('should not report 4xx errors to errorReporterService', async () => {
      const interceptors = (apiClient.interceptors.response as any).handlers;
      const responseInterceptor = interceptors[0];

      const axiosError = {
        response: {
          status: 404,
          data: { detail: 'Not found' },
        },
        config: {
          headers: new AxiosHeaders(),
          url: '/api/v1/missing',
          method: 'get',
        },
      } as unknown as AxiosError;

      try {
        await responseInterceptor.rejected(axiosError);
      } catch {
        // Expected to reject
      }

      expect(reportApiError).not.toHaveBeenCalled();
    });

    it('should reject immediately when config is missing', async () => {
      const interceptors = (apiClient.interceptors.response as any).handlers;
      const responseInterceptor = interceptors[0];

      const axiosError = {
        response: { status: 500 },
        config: undefined,
      } as unknown as AxiosError;

      await expect(responseInterceptor.rejected(axiosError)).rejects.toBeDefined();
    });
  });

  // ---------- handleApiError ----------

  describe('handleApiError', () => {
    it('should format axios error with response data', () => {
      const error = new AxiosError(
        'Bad Request',
        'ERR_BAD_REQUEST',
        { headers: new AxiosHeaders() } as InternalAxiosRequestConfig,
        {},
        {
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: { headers: new AxiosHeaders() } as InternalAxiosRequestConfig,
          data: {
            detail: 'Validation failed',
            errors: [{ loc: ['body', 'email'], msg: 'invalid email', type: 'value_error' }],
          },
        },
      );

      const result = handleApiError(error);

      expect(result.detail).toBe('Validation failed');
      expect(result.status_code).toBe(400);
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0].msg).toBe('invalid email');
    });

    it('should format network error (request made but no response)', () => {
      const error = new AxiosError(
        'Network Error',
        'ERR_NETWORK',
        { headers: new AxiosHeaders(), url: '/api/v1/data' } as InternalAxiosRequestConfig,
        { /* XMLHttpRequest */ },
        undefined,
      );
      // request exists but response is undefined
      (error as any).request = {};

      const result = handleApiError(error);

      expect(result.detail).toBe('No response from server. Please check your connection.');
      expect(result.status_code).toBe(0);
    });

    it('should format request setup errors', () => {
      const error = new AxiosError(
        'Invalid URL',
        'ERR_BAD_REQUEST',
      );

      const result = handleApiError(error);

      expect(result.detail).toBe('Invalid URL');
      expect(result.status_code).toBe(0);
    });

    it('should handle non-axios Error objects', () => {
      const error = new TypeError('Cannot read properties of null');

      const result = handleApiError(error);

      expect(result.detail).toBe('Cannot read properties of null');
      expect(result.status_code).toBe(0);
    });

    it('should handle unknown non-error values', () => {
      const result = handleApiError('just a string');

      expect(result.detail).toBe('An unknown error occurred');
      expect(result.status_code).toBe(0);
    });
  });
});
