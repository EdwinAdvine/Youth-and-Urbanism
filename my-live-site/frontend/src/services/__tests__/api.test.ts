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
    it('should add JWT token from localStorage to request headers', async () => {
      localStorage.setItem('access_token', 'test-jwt-token');

      // Use the interceptor manager to test the request interceptor directly
      const config: InternalAxiosRequestConfig = {
        headers: new AxiosHeaders(),
        url: '/api/v1/test',
        method: 'get',
      };

      // Access the request interceptor handlers
      const interceptors = (apiClient.interceptors.request as any).handlers;
      const requestInterceptor = interceptors[0];
      const result = requestInterceptor.fulfilled(config);

      expect(result.headers.Authorization).toBe('Bearer test-jwt-token');
    });

    it('should not add Authorization header when no token exists', () => {
      const config: InternalAxiosRequestConfig = {
        headers: new AxiosHeaders(),
        url: '/api/v1/test',
        method: 'get',
      };

      const interceptors = (apiClient.interceptors.request as any).handlers;
      const requestInterceptor = interceptors[0];
      const result = requestInterceptor.fulfilled(config);

      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  // ---------- Response Interceptor ----------

  describe('response interceptor', () => {
    it('should attempt token refresh on 401 response when refresh_token exists', async () => {
      localStorage.setItem('refresh_token', 'my-refresh-token');

      const refreshResponse = {
        data: {
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
        },
      };

      // Mock axios.post for the refresh call
      const postSpy = vi.spyOn(axios, 'post').mockResolvedValueOnce(refreshResponse);

      // Get the response error interceptor
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

      // Invoke the rejected handler -- it should try to refresh
      try {
        await responseInterceptor.rejected(axiosError);
      } catch {
        // May throw because apiClient retry will fail without a real server
      }

      expect(postSpy).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/auth/refresh'),
        { refresh_token: 'my-refresh-token' },
      );

      postSpy.mockRestore();
    });

    it('should store new tokens after successful refresh', async () => {
      localStorage.setItem('refresh_token', 'old-refresh');

      const refreshResponse = {
        data: {
          access_token: 'fresh-access',
          refresh_token: 'fresh-refresh',
        },
      };

      const postSpy = vi.spyOn(axios, 'post').mockResolvedValueOnce(refreshResponse);

      const interceptors = (apiClient.interceptors.response as any).handlers;
      const responseInterceptor = interceptors[0];

      const axiosError = {
        response: { status: 401 },
        config: {
          headers: new AxiosHeaders(),
          url: '/api/v1/data',
          method: 'get',
          _retry: false,
        },
      } as unknown as AxiosError;

      try {
        await responseInterceptor.rejected(axiosError);
      } catch {
        // Retry will fail without a real server, but tokens should be stored
      }

      expect(localStorage.getItem('access_token')).toBe('fresh-access');
      expect(localStorage.getItem('refresh_token')).toBe('fresh-refresh');

      postSpy.mockRestore();
    });

    it('should clear auth data and redirect when refresh token is absent on 401', async () => {
      localStorage.setItem('access_token', 'stale-token');
      // No refresh_token set

      Object.defineProperty(window, 'location', {
        value: { href: '/', reload: vi.fn() },
        writable: true,
        configurable: true,
      });

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

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
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
