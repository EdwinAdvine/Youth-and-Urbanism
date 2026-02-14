/**
 * Parent Dashboard Service
 *
 * API service for parent dashboard home endpoints.
 */

import api from './api';
import type {
  FamilyOverviewResponse,
  TodayHighlightsResponse,
  UrgentItemsResponse,
  MoodEntryCreate,
  MoodEntryResponse,
  MoodHistoryResponse,
  AIFamilySummaryResponse,
} from '../types/parent';

const BASE_URL = '/api/v1/parent/dashboard';

/**
 * Get comprehensive family overview for dashboard home
 */
export const getFamilyOverview = async (): Promise<FamilyOverviewResponse> => {
  const response = await api.get(`${BASE_URL}/overview`);
  return response.data;
};

/**
 * Get AI-generated today's highlights
 */
export const getTodayHighlights = async (): Promise<TodayHighlightsResponse> => {
  const response = await api.get(`${BASE_URL}/highlights`);
  return response.data;
};

/**
 * Get urgent items requiring parent attention
 */
export const getUrgentItems = async (): Promise<UrgentItemsResponse> => {
  const response = await api.get(`${BASE_URL}/urgent`);
  return response.data;
};

/**
 * Record a mood entry
 */
export const createMoodEntry = async (data: MoodEntryCreate): Promise<MoodEntryResponse> => {
  const response = await api.post(`${BASE_URL}/mood`, data);
  return response.data;
};

/**
 * Get mood entry history with insights
 */
export const getMoodHistory = async (params?: {
  child_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
}): Promise<MoodHistoryResponse> => {
  const response = await api.get(`${BASE_URL}/mood/history`, { params });
  return response.data;
};

/**
 * Get AI weekly family forecast and tips
 */
export const getAIFamilySummary = async (): Promise<AIFamilySummaryResponse> => {
  const response = await api.get(`${BASE_URL}/ai-summary`);
  return response.data;
};

export default {
  getFamilyOverview,
  getTodayHighlights,
  getUrgentItems,
  createMoodEntry,
  getMoodHistory,
  getAIFamilySummary,
};
