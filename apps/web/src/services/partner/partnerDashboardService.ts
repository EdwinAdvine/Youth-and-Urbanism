/**
 * Partner Dashboard Service
 * API calls for partner dashboard overview and AI highlights
 */

import apiClient from '../api';
import type { PartnerDashboardOverview } from '../../types/partner';

const BASE_PATH = `/api/v1/partner/dashboard`;

/**
 * Get partner dashboard overview with aggregated stats
 */
export const getPartnerDashboardOverview = async (): Promise<PartnerDashboardOverview> => {
  const response = await apiClient.get(`${BASE_PATH}/overview`);
  return response.data;
};

/**
 * Get AI-generated daily highlights for partner
 */
export const getPartnerAIHighlights = async (): Promise<{
  highlights: Array<{
    id: string;
    type: 'insight' | 'alert' | 'recommendation' | 'celebration';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    action?: {
      label: string;
      url: string;
    };
    created_at: string;
  }>;
}> => {
  const response = await apiClient.get(`${BASE_PATH}/ai-highlights`);
  return response.data;
};

export default {
  getPartnerDashboardOverview,
  getPartnerAIHighlights,
};
