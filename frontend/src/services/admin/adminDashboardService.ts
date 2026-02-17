/**
 * Admin Dashboard API Service
 *
 * Fetches dashboard data from the backend API endpoints.
 */

import apiClient from '../api';

const BASE = `/api/v1/admin/dashboard`;

export interface DashboardOverview {
  total_users: number;
  active_users_today: number;
  revenue_today: number;
  new_enrollments_today: number;
  ai_sessions_today: number;
  total_courses: number;
  active_courses: number;
}

export interface DashboardAlert {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  action_url: string;
}

export interface PendingItems {
  total: number;
  categories: {
    pending_enrollments: number;
    pending_courses: number;
    open_tickets: number;
    moderation_items: number;
  };
}

export interface RevenueSnapshot {
  total_today: number;
  total_yesterday: number;
  total_week: number;
  total_month: number;
  trend_percentage: number;
  recent_transactions: Array<{
    id: string;
    amount: number;
    currency: string;
    gateway: string;
    created_at: string;
  }>;
}

export interface AIAnomaly {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  detected_at: string;
  affected_model: string;
  status: string;
}

const adminDashboardService = {
  getOverview: async (): Promise<DashboardOverview> => {
    const r = await apiClient.get(`${BASE}/overview`);
    return r.data.data ?? r.data;
  },
  getAlerts: async (): Promise<DashboardAlert[]> => {
    const r = await apiClient.get(`${BASE}/alerts`);
    return r.data.data ?? r.data;
  },
  getPendingItems: async (): Promise<PendingItems> => {
    const r = await apiClient.get(`${BASE}/pending-items`);
    return r.data.data ?? r.data;
  },
  getRevenueSnapshot: async (): Promise<RevenueSnapshot> => {
    const r = await apiClient.get(`${BASE}/revenue-snapshot`);
    return r.data.data ?? r.data;
  },
  getAIAnomalies: async (): Promise<AIAnomaly[]> => {
    const r = await apiClient.get(`${BASE}/ai-anomalies`);
    return r.data.data ?? r.data;
  },
};

export default adminDashboardService;
