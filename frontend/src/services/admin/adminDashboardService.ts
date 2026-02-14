/**
 * Admin Dashboard API Service
 *
 * Fetches dashboard data from the backend API endpoints.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const BASE = `${API_URL}/api/v1/admin/dashboard`;

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

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: getAuthHeaders() });
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  const json = await response.json();
  return json.data ?? json;
}

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
  getOverview: () => fetchJson<DashboardOverview>(`${BASE}/overview`),
  getAlerts: () => fetchJson<DashboardAlert[]>(`${BASE}/alerts`),
  getPendingItems: () => fetchJson<PendingItems>(`${BASE}/pending-items`),
  getRevenueSnapshot: () => fetchJson<RevenueSnapshot>(`${BASE}/revenue-snapshot`),
  getAIAnomalies: () => fetchJson<AIAnomaly[]>(`${BASE}/ai-anomalies`),
};

export default adminDashboardService;
