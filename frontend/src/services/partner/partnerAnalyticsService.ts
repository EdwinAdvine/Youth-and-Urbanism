/**
 * Partner Analytics Service
 * API calls for ROI metrics, custom reports, and student insights
 */

import axios from 'axios';
import type { PartnerImpactReport, ROIMetrics, CustomReport } from '../../types/partner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const BASE_PATH = `${API_URL}/api/v1/partner/analytics`;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
});

/**
 * Get ROI metrics
 */
export const getROIMetrics = async (params?: {
  program_id?: string;
  start_date?: string;
  end_date?: string;
}): Promise<ROIMetrics> => {
  const response = await axios.get(`${BASE_PATH}/roi`, {
    headers: getAuthHeaders(),
    params,
  });
  return response.data;
};

/**
 * Get custom reports
 */
export const getCustomReports = async (params?: {
  report_type?: string;
  program_id?: string;
  page?: number;
  limit?: number;
}): Promise<{
  items: CustomReport[];
  total: number;
  page: number;
  pages: number;
}> => {
  const response = await axios.get(`${BASE_PATH}/reports`, {
    headers: getAuthHeaders(),
    params,
  });
  return response.data;
};

/**
 * Generate new AI report
 */
export const generateReport = async (data: {
  program_id?: string;
  report_type: 'monthly' | 'termly' | 'annual' | 'custom';
  start_date?: string;
  end_date?: string;
  include_ai_insights?: boolean;
}): Promise<PartnerImpactReport> => {
  const response = await axios.post(`${BASE_PATH}/reports/generate`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

/**
 * Export report
 */
export const exportReport = async (
  reportId: string,
  format: 'pdf' | 'csv' | 'xlsx'
): Promise<{ url: string; filename: string }> => {
  const response = await axios.get(`${BASE_PATH}/reports/${reportId}/export`, {
    headers: getAuthHeaders(),
    params: { format },
  });
  return response.data;
};

/**
 * Get student AI insights
 */
export const getStudentInsights = async (studentId: string): Promise<{
  student_id: string;
  learning_style: string;
  strengths: string[];
  areas_for_improvement: string[];
  recommended_actions: string[];
  engagement_score: number;
  progress_trend: 'improving' | 'stable' | 'declining';
  ai_recommendations: Array<{
    category: string;
    recommendation: string;
    priority: 'low' | 'medium' | 'high';
  }>;
}> => {
  const response = await axios.get(`${BASE_PATH}/student-insights/${studentId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export default {
  getROIMetrics,
  getCustomReports,
  generateReport,
  exportReport,
  getStudentInsights,
};
