/**
 * Admin Analytics & Intelligence Service - Phase 6
 *
 * Provides typed API calls for learning impact, business metrics,
 * compliance data, custom NL queries, and scheduled reports.
 */

import apiClient from '../api';

const ANALYTICS_BASE = `/api/v1/admin/analytics`;
const ADVANCED_BASE = `/api/v1/admin/advanced-analytics`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DashboardSummary {
  total_users: number;
  total_courses: number;
  total_enrollments: number;
  total_revenue: number;
  active_users_today: number;
  new_users_this_month: number;
}

export interface RevenueMetrics {
  total_revenue: number;
  revenue_by_period: { date: string; amount: number }[];
  revenue_by_gateway: { gateway: string; amount: number }[];
}

export interface UserGrowth {
  total_users: number;
  new_users_by_day: { date: string; count: number }[];
  users_by_role: { role: string; count: number }[];
}

export interface CoursePerformance {
  top_courses: {
    id: string;
    title: string;
    enrollment_count: number;
    avg_completion: number;
    average_rating: number;
  }[];
  avg_completion_rate: number;
}

export interface NLQueryResult {
  query: string;
  sql_generated: string | null;
  results: Record<string, unknown>[];
  chart_config: {
    type: 'bar' | 'line' | 'pie';
    x_key: string;
    y_key: string;
    title: string;
  } | null;
  row_count: number;
  execution_time_ms: number;
  error?: string;
}

export interface QueryExample {
  query: string;
  description: string;
}

export interface ComplianceIncident {
  id: string;
  incident_type: string;
  severity: string;
  description: string;
  affected_users_count: number;
  status: string;
  created_at: string;
}

export interface ScheduledReport {
  id: string;
  name: string;
  report_type: string;
  schedule_cron: string;
  recipients: string[];
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

const adminAnalyticsService = {
  // Standard analytics (existing routes)
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const r = await apiClient.get(`${ANALYTICS_BASE}/dashboard`);
    return r.data.data ?? r.data;
  },

  getRevenueMetrics: async (startDate?: string, endDate?: string): Promise<RevenueMetrics> => {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const r = await apiClient.get(`${ANALYTICS_BASE}/revenue`, { params });
    return r.data.data ?? r.data;
  },

  getUserGrowth: async (startDate?: string, endDate?: string): Promise<UserGrowth> => {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const r = await apiClient.get(`${ANALYTICS_BASE}/users`, { params });
    return r.data.data ?? r.data;
  },

  getCoursePerformance: async (): Promise<CoursePerformance> => {
    const r = await apiClient.get(`${ANALYTICS_BASE}/courses`);
    return r.data.data ?? r.data;
  },

  // Advanced analytics (NL queries)
  submitCustomQuery: async (query: string): Promise<NLQueryResult> => {
    const r = await apiClient.post(`${ADVANCED_BASE}/nl-query`, { query });
    return r.data.data ?? r.data;
  },

  getAvailableQueries: async (): Promise<QueryExample[]> => {
    const r = await apiClient.get(`${ADVANCED_BASE}/nl-query/examples`);
    return r.data.data ?? r.data;
  },

  // Compliance
  getComplianceIncidents: async (
    page = 1,
    pageSize = 20,
  ): Promise<{ items: ComplianceIncident[]; total: number }> => {
    const r = await apiClient.get(`${ADVANCED_BASE}/compliance/incidents`, {
      params: { page, page_size: pageSize },
    });
    return r.data.data ?? r.data;
  },

  // Scheduled reports
  getScheduledReports: async (): Promise<ScheduledReport[]> => {
    const r = await apiClient.get(`${ADVANCED_BASE}/reports/scheduled`);
    return r.data.data ?? r.data;
  },

  createScheduledReport: async (data: {
    name: string;
    report_type: string;
    schedule_cron: string;
    recipients: string[];
    parameters?: Record<string, unknown>;
  }): Promise<{ success: boolean; id: string }> => {
    const r = await apiClient.post(`${ADVANCED_BASE}/reports/scheduled`, data);
    return r.data.data ?? r.data;
  },
};

export default adminAnalyticsService;
