/**
 * Admin Analytics & Intelligence Service - Phase 6
 *
 * Provides typed API calls for learning impact, business metrics,
 * compliance data, custom NL queries, and scheduled reports.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const ANALYTICS_BASE = `${API_URL}/api/v1/admin/analytics`;
const ADVANCED_BASE = `${API_URL}/api/v1/admin/advanced-analytics`;

function getAuthHeaders(): Record<string, string> {
  let jwt = '';
  const stored = localStorage.getItem('auth-store');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      jwt = parsed?.state?.token || parsed?.token || '';
    } catch {
      jwt = stored;
    }
  }
  return {
    Authorization: `Bearer ${jwt}`,
    'Content-Type': 'application/json',
  };
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: getAuthHeaders(),
    ...options,
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  const json = await response.json();
  return json.data ?? json;
}

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
  getDashboardSummary: (): Promise<DashboardSummary> =>
    fetchJson<DashboardSummary>(`${ANALYTICS_BASE}/dashboard`),

  getRevenueMetrics: (startDate?: string, endDate?: string): Promise<RevenueMetrics> => {
    let url = `${ANALYTICS_BASE}/revenue`;
    const params: string[] = [];
    if (startDate) params.push(`start_date=${startDate}`);
    if (endDate) params.push(`end_date=${endDate}`);
    if (params.length) url += `?${params.join('&')}`;
    return fetchJson<RevenueMetrics>(url);
  },

  getUserGrowth: (startDate?: string, endDate?: string): Promise<UserGrowth> => {
    let url = `${ANALYTICS_BASE}/users`;
    const params: string[] = [];
    if (startDate) params.push(`start_date=${startDate}`);
    if (endDate) params.push(`end_date=${endDate}`);
    if (params.length) url += `?${params.join('&')}`;
    return fetchJson<UserGrowth>(url);
  },

  getCoursePerformance: (): Promise<CoursePerformance> =>
    fetchJson<CoursePerformance>(`${ANALYTICS_BASE}/courses`),

  // Advanced analytics (NL queries)
  submitCustomQuery: (query: string): Promise<NLQueryResult> =>
    fetchJson<NLQueryResult>(`${ADVANCED_BASE}/nl-query`, {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),

  getAvailableQueries: (): Promise<QueryExample[]> =>
    fetchJson<QueryExample[]>(`${ADVANCED_BASE}/nl-query/examples`),

  // Compliance
  getComplianceIncidents: (
    page = 1,
    pageSize = 20,
  ): Promise<{ items: ComplianceIncident[]; total: number }> =>
    fetchJson(`${ADVANCED_BASE}/compliance/incidents?page=${page}&page_size=${pageSize}`),

  // Scheduled reports
  getScheduledReports: (): Promise<ScheduledReport[]> =>
    fetchJson<ScheduledReport[]>(`${ADVANCED_BASE}/reports/scheduled`),

  createScheduledReport: (data: {
    name: string;
    report_type: string;
    schedule_cron: string;
    recipients: string[];
    parameters?: Record<string, unknown>;
  }): Promise<{ success: boolean; id: string }> =>
    fetchJson(`${ADVANCED_BASE}/reports/scheduled`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export default adminAnalyticsService;
