/**
 * Partner Dashboard Service
 * API calls for partner dashboard overview and AI highlights
 */

import axios from 'axios';
import type { PartnerDashboardOverview } from '../../types/partner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const BASE_PATH = `${API_URL}/api/v1/partner/dashboard`;

/**
 * Get partner dashboard overview with aggregated stats
 */
export const getPartnerDashboardOverview = async (): Promise<PartnerDashboardOverview> => {
  const response = await axios.get(`${BASE_PATH}/overview`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });
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
  const response = await axios.get(`${BASE_PATH}/ai-highlights`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });
  return response.data;
};

export default {
  getPartnerDashboardOverview,
  getPartnerAIHighlights,
};
