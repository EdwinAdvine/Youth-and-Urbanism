import axios, { AxiosError } from 'axios';
import type { ApiError } from './types';

export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;

    if (axiosError.response?.data) {
      return {
        detail: axiosError.response.data.detail || 'An error occurred',
        status_code: axiosError.response.status,
        path: axiosError.config?.url,
        errors: axiosError.response.data.errors,
      };
    } else if (axiosError.request) {
      return {
        detail: 'No response from server. Please check your connection.',
        status_code: 0,
        path: axiosError.config?.url,
      };
    } else {
      return {
        detail: axiosError.message || 'Request setup failed',
        status_code: 0,
      };
    }
  }

  return {
    detail: error instanceof Error ? error.message : 'An unknown error occurred',
    status_code: 0,
  };
};
