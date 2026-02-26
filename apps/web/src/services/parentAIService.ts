/**
 * Parent AI Insights Service
 *
 * API client for AI companion insights and parent coaching.
 */

import api from './api';
import type {
  AITutorSummary,
  LearningStyleAnalysis,
  SupportTipsResponse,
  AIPlanningResponse,
  CuriosityPatternsResponse,
  WarningSignsResponse,
  AlertsListResponse,
  AlertDetailResponse,
  ParentCoachingResponse
} from '../types/parent';

/**
 * Get AI tutor summary for a child
 */
export const getAITutorSummary = async (childId: string): Promise<AITutorSummary> => {
  const response = await api.get(`/api/v1/parent/ai/summary/${childId}`);
  return response.data;
};

/**
 * Get learning style analysis for a child
 */
export const getLearningStyleAnalysis = async (childId: string): Promise<LearningStyleAnalysis> => {
  const response = await api.get(`/api/v1/parent/ai/learning-style/${childId}`);
  return response.data;
};

/**
 * Get practical home support tips
 */
export const getSupportTips = async (childId: string): Promise<SupportTipsResponse> => {
  const response = await api.get(`/api/v1/parent/ai/support-tips/${childId}`);
  return response.data;
};

/**
 * Get AI planning (upcoming topics)
 */
export const getAIPlanning = async (childId: string): Promise<AIPlanningResponse> => {
  const response = await api.get(`/api/v1/parent/ai/planning/${childId}`);
  return response.data;
};

/**
 * Get curiosity patterns analysis
 */
export const getCuriosityPatterns = async (childId: string): Promise<CuriosityPatternsResponse> => {
  const response = await api.get(`/api/v1/parent/ai/patterns/${childId}`);
  return response.data;
};

/**
 * Get early warning signs analysis
 */
export const getWarningSignsAnalysis = async (childId: string): Promise<WarningSignsResponse> => {
  const response = await api.get(`/api/v1/parent/ai/warnings/${childId}`);
  return response.data;
};

/**
 * Get list of AI alerts
 */
export const getAlertsList = async (params?: {
  childId?: string;
  severity?: string;
  isRead?: boolean;
}): Promise<AlertsListResponse> => {
  const response = await api.get('/api/v1/parent/ai/alerts', { params });
  return response.data;
};

/**
 * Get detailed alert information
 */
export const getAlertDetail = async (alertId: string): Promise<AlertDetailResponse> => {
  const response = await api.get(`/api/v1/parent/ai/alerts/${alertId}`);
  return response.data;
};

/**
 * Mark an alert as read
 */
export const markAlertRead = async (alertId: string): Promise<AlertDetailResponse> => {
  const response = await api.put(`/api/v1/parent/ai/alerts/${alertId}/read`);
  return response.data;
};

/**
 * Dismiss an alert
 */
export const dismissAlert = async (alertId: string): Promise<void> => {
  await api.put(`/api/v1/parent/ai/alerts/${alertId}/dismiss`);
};

/**
 * Get AI parent coaching content
 */
export const getParentCoaching = async (childId: string): Promise<ParentCoachingResponse> => {
  const response = await api.get(`/api/v1/parent/ai/coaching/${childId}`);
  return response.data;
};
