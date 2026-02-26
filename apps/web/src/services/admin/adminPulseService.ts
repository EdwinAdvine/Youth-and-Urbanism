/**
 * Admin Platform Pulse API Service
 *
 * Fetches real-time monitoring data from the Platform Pulse backend endpoints.
 */

import apiClient from '../api';

const BASE = `/api/v1/admin/pulse`;

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface SessionDataPoint {
  time: string;
  sessions: number;
  ai_chats: number;
}

export interface RealtimeMetrics {
  active_users: number;
  concurrent_sessions: number;
  ai_conversations_per_hour: number;
  requests_per_minute: number;
  avg_response_time_ms: number;
  error_rate_percent: number;
  sessions_over_time: SessionDataPoint[];
  generated_at: string;
}

export interface ServiceHealth {
  name: string;
  key: string;
  status: 'healthy' | 'degraded' | 'down';
  response_time_ms: number;
  uptime_percent: number;
  last_checked: string;
  details: Record<string, unknown>;
}

export interface HealthStatusResponse {
  services: ServiceHealth[];
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    down: number;
  };
  generated_at: string;
}

export interface UrgentFlag {
  id: string;
  category: 'child_safety' | 'policy_violation' | 'escalated_ticket' | 'system_alert';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  student_grade?: string;
  subject?: string;
  flagged_at: string;
  status: string;
  action_url: string;
}

export interface UrgentFlagsResponse {
  flags: UrgentFlag[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    pending_review: number;
  };
  generated_at: string;
}

export interface MetricsDataPoint {
  timestamp: string;
  time_label: string;
  active_users: number;
  sessions: number;
  ai_chats: number;
  error_rate: number;
  response_time_ms: number;
}

export interface MetricsHistoryResponse {
  period: string;
  label: string;
  data_points: MetricsDataPoint[];
  summary: {
    peak_active_users: number;
    avg_response_time_ms: number;
    avg_error_rate: number;
    total_ai_chats: number;
  };
  generated_at: string;
}

export type MetricsPeriod = '1h' | '6h' | '24h' | '7d';

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

const adminPulseService = {
  getRealtimeMetrics: async (): Promise<RealtimeMetrics> => {
    const r = await apiClient.get(`${BASE}/realtime`);
    return r.data.data ?? r.data;
  },

  getHealthStatus: async (): Promise<HealthStatusResponse> => {
    const r = await apiClient.get(`${BASE}/health`);
    return r.data.data ?? r.data;
  },

  getUrgentFlags: async (): Promise<UrgentFlagsResponse> => {
    const r = await apiClient.get(`${BASE}/urgent-flags`);
    return r.data.data ?? r.data;
  },

  getMetricsHistory: async (period: MetricsPeriod = '24h'): Promise<MetricsHistoryResponse> => {
    const r = await apiClient.get(`${BASE}/metrics/${period}`);
    return r.data.data ?? r.data;
  },
};

export default adminPulseService;
