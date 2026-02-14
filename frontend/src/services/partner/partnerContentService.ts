/**
 * Partner Content Service
 * API calls for courses, resources, and AI content generation
 */

import axios from 'axios';
import type { PartnerResource, PaginatedResponse } from '../../types/partner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const BASE_PATH = `${API_URL}/api/v1/partner/content`;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
  'Content-Type': 'application/json',
});

const getMultipartHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
  'Content-Type': 'multipart/form-data',
});

/**
 * Get sponsored courses usage
 */
export const getSponsoredCourses = async (params?: {
  program_id?: string;
  page?: number;
  limit?: number;
}): Promise<{
  items: Array<{
    course_id: string;
    course_name: string;
    enrolled_students: number;
    completion_rate: number;
    avg_score: number;
  }>;
  total: number;
}> => {
  const response = await axios.get(`${BASE_PATH}/courses`, {
    headers: getAuthHeaders(),
    params,
  });
  return response.data;
};

/**
 * Upload resource
 */
export const uploadResource = async (data: {
  title: string;
  description: string;
  resource_type: 'lesson' | 'material' | 'video' | 'document';
  file: File;
  target_programs?: string[];
  branding_applied?: boolean;
}): Promise<PartnerResource> => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('resource_type', data.resource_type);
  formData.append('file', data.file);

  if (data.target_programs) {
    formData.append('target_programs', JSON.stringify(data.target_programs));
  }

  if (data.branding_applied !== undefined) {
    formData.append('branding_applied', String(data.branding_applied));
  }

  const response = await axios.post(`${BASE_PATH}/resources`, formData, {
    headers: getMultipartHeaders(),
  });
  return response.data;
};

/**
 * Get partner resources
 */
export const getResources = async (params?: {
  status?: 'pending_review' | 'approved' | 'rejected';
  resource_type?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<PartnerResource>> => {
  const response = await axios.get(`${BASE_PATH}/resources`, {
    headers: getAuthHeaders(),
    params,
  });
  return response.data;
};

/**
 * AI content generation
 */
export const generateAIContent = async (data: {
  content_type: 'lesson' | 'quiz' | 'material' | 'summary';
  topic: string;
  grade_level?: string;
  learning_area?: string;
  additional_instructions?: string;
}): Promise<{
  generated_content: string;
  metadata: {
    word_count: number;
    estimated_duration: number;
    difficulty_level: string;
  };
  suggestions: string[];
}> => {
  const response = await axios.post(`${BASE_PATH}/ai-generate`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export default {
  getSponsoredCourses,
  uploadResource,
  getResources,
  generateAIContent,
};
