/**
 * Admin AI Monitoring Service - Phase 5
 *
 * Provides typed API calls for AI conversation flags, content review,
 * personalization audits, performance metrics, and safety dashboard.
 */

import apiClient from '../api';

const BASE = `/api/v1/admin/ai-monitoring`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ConversationFlag {
  id: string;
  student_name: string;
  student_grade: string;
  subject: string;
  flag_type: 'safety' | 'bias' | 'hallucination' | 'quality';
  severity: 'critical' | 'high' | 'medium' | 'low';
  snippet: string;
  model_used: string;
  status: string;
  flagged_at: string;
  conversation_id: string;
}

export interface ConversationFlagListResponse {
  items: ConversationFlag[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  summary: {
    total_flags_today: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    pending_review: number;
    safety_incidents: number;
    avg_quality_score: number;
    total_conversations_today: number;
  };
}

export interface ContentReviewItem {
  id: string;
  content_type: string;
  subject: string;
  title: string;
  generated_text: string;
  model_used: string;
  accuracy_score: number;
  status: 'pending' | 'approved' | 'rejected' | 'override';
  generated_at: string;
  reviewed_by: string | null;
}

export interface ContentReviewListResponse {
  items: ContentReviewItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  summary: {
    pending_review: number;
    approved_today: number;
    rejected_today: number;
    overridden_today: number;
    approval_rate: number;
    override_rate: number;
    avg_accuracy_score: number;
  };
}

export interface PersonalizationAuditData {
  learning_path_diversity: {
    subject: string;
    unique_paths: number;
    students: number;
    avg_adaptation: number;
  }[];
  bias_metrics: {
    gender: Record<string, number>;
    grade_level: Record<string, Record<string, number>>;
    location: Record<string, Record<string, number>>;
  };
  adaptation_timeline: {
    week: string;
    effectiveness: number;
    students_adapted: number;
  }[];
  over_customization_flags: {
    id: string;
    student_name: string;
    grade: string;
    issue: string;
    severity: string;
    detected_at: string;
  }[];
  summary: {
    students_with_personalized_paths: number;
    avg_adaptation_score: number;
    over_customization_count: number;
    total_unique_paths: number;
    paths_updated_today: number;
  };
}

export interface AIProvider {
  id: string;
  name: string;
  provider: string;
  avg_response_time_ms: number;
  p50_latency_ms: number;
  p95_latency_ms: number;
  p99_latency_ms: number;
  error_rate: number;
  satisfaction_score: number;
  total_requests_today: number;
  successful_requests: number;
  failed_requests: number;
  status: 'healthy' | 'degraded' | 'down';
  last_error: string | null;
  cost_today_kes: number;
}

export interface PerformanceOverview {
  providers: AIProvider[];
  response_time_trends: Record<string, number | string>[];
  error_patterns: {
    type: string;
    count: number;
    affected_provider: string;
    trend: string;
    first_seen: string;
    last_seen: string;
  }[];
  summary: {
    total_requests_today: number;
    avg_response_time_ms: number;
    overall_error_rate: number;
    avg_satisfaction: number;
    total_cost_today_kes: number;
    active_providers: number;
    degraded_providers: number;
  };
}

export interface SafetyIncident {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  model: string;
  action_taken: string;
  reported_at: string;
  resolved: boolean;
}

export interface SafetyDashboard {
  incidents_today: SafetyIncident[];
  safety_trends: {
    date: string;
    incidents: number;
    blocked: number;
    reviewed: number;
  }[];
  summary: {
    total_incidents_today: number;
    total_blocked_today: number;
    total_reviewed_today: number;
    resolution_rate: number;
    avg_resolution_time_minutes: number;
    safety_score: number;
  };
  generated_at: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

const adminAIMonitoringService = {
  getConversationFlags: async (
    page = 1,
    pageSize = 10,
    severity?: string,
  ): Promise<ConversationFlagListResponse> => {
    const params: Record<string, string | number> = { page, page_size: pageSize };
    if (severity) params.severity = severity;
    const r = await apiClient.get(`${BASE}/conversations/flags`, { params });
    return r.data.data ?? r.data;
  },

  getContentReviewQueue: async (
    page = 1,
    pageSize = 10,
  ): Promise<ContentReviewListResponse> => {
    const r = await apiClient.get(`${BASE}/content/review-queue`, {
      params: { page, page_size: pageSize },
    });
    return r.data.data ?? r.data;
  },

  getPersonalizationAudits: async (): Promise<PersonalizationAuditData> => {
    const r = await apiClient.get(`${BASE}/personalization/audits`);
    return r.data.data ?? r.data;
  },

  getPerformanceOverview: async (): Promise<PerformanceOverview> => {
    const r = await apiClient.get(`${BASE}/performance/overview`);
    return r.data.data ?? r.data;
  },

  getSafetyDashboard: async (): Promise<SafetyDashboard> => {
    const r = await apiClient.get(`${BASE}/safety/dashboard`);
    return r.data.data ?? r.data;
  },
};

export default adminAIMonitoringService;
