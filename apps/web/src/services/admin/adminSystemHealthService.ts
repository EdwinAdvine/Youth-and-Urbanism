/**
 * Admin System Health Service
 *
 * API client for the System Health dashboard — error logs, test runner,
 * and AI-powered error diagnosis.
 */

import apiClient from '../api';

const BASE = `/api/v1/admin/system-health`;

// ─── Types ───────────────────────────────────────────────────────────

export interface HealthOverview {
  database: { status: string; latency_ms: number };
  errors_24h: {
    total: number;
    unresolved: number;
    by_level: Record<string, number>;
    by_source: Record<string, number>;
    top_error_types: { type: string; count: number }[];
    top_failing_endpoints: { endpoint: string; count: number }[];
  };
  latest_test_run: TestRun | null;
}

export interface ErrorLogEntry {
  id: string;
  level: string;
  source: string;
  error_type: string;
  message: string;
  stack_trace: string | null;
  endpoint: string | null;
  method: string | null;
  user_id: string | null;
  user_role: string | null;
  request_data: Record<string, unknown> | null;
  context: Record<string, unknown> | null;
  ai_diagnosis: string | null;
  ai_diagnosed_at: string | null;
  is_resolved: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
  created_at: string;
}

export interface ErrorsPage {
  items: ErrorLogEntry[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface DiagnosisResult {
  error_id: string;
  diagnosis: string;
  diagnosed_at: string;
  model_used: string;
}

export interface TestRun {
  id: string;
  run_type: string;
  status: string;
  output: string | null;
  summary: Record<string, number> | null;
  triggered_by: string;
  started_at: string;
  completed_at: string | null;
  duration_seconds: string | null;
}

export interface TestRunsPage {
  items: TestRun[];
  total: number;
  page: number;
  page_size: number;
}

// ─── API Methods ─────────────────────────────────────────────────────

export const adminSystemHealthService = {
  /** System health overview: DB status, error stats, latest test */
  async getOverview(): Promise<HealthOverview> {
    const response = await apiClient.get(`${BASE}/overview`);
    return response.data.data ?? response.data;
  },

  /** Paginated, filterable error log list */
  async getErrors(params?: {
    page?: number;
    page_size?: number;
    level?: string;
    source?: string;
    is_resolved?: boolean;
    endpoint?: string;
    error_type?: string;
    hours?: number;
  }): Promise<ErrorsPage> {
    const response = await apiClient.get(`${BASE}/errors`, { params });
    return response.data.data ?? response.data;
  },

  /** Single error detail */
  async getError(errorId: string): Promise<ErrorLogEntry> {
    const response = await apiClient.get(`${BASE}/errors/${errorId}`);
    return response.data.data ?? response.data;
  },

  /** Trigger AI diagnosis for an error */
  async diagnoseError(errorId: string): Promise<DiagnosisResult> {
    const response = await apiClient.post(`${BASE}/errors/${errorId}/diagnose`);
    return response.data.data ?? response.data;
  },

  /** Mark an error as resolved */
  async resolveError(errorId: string, notes?: string): Promise<ErrorLogEntry> {
    const response = await apiClient.patch(`${BASE}/errors/${errorId}/resolve`, { notes });
    return response.data.data ?? response.data;
  },

  /** Trigger a test run */
  async runTests(runType: 'backend' | 'frontend' | 'all'): Promise<TestRun> {
    const response = await apiClient.post(`${BASE}/tests/run`, { run_type: runType });
    return response.data.data ?? response.data;
  },

  /** Paginated test run history */
  async getTestRuns(params?: {
    page?: number;
    page_size?: number;
    run_type?: string;
  }): Promise<TestRunsPage> {
    const response = await apiClient.get(`${BASE}/tests/results`, { params });
    return response.data.data ?? response.data;
  },

  /** Single test run detail */
  async getTestRun(runId: string): Promise<TestRun> {
    const response = await apiClient.get(`${BASE}/tests/results/${runId}`);
    return response.data.data ?? response.data;
  },
};
