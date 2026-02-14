/**
 * Staff Report Builder Service
 *
 * Wraps API calls to /api/v1/staff/reports endpoints for managing custom
 * report definitions, exporting reports in various formats, and configuring
 * automated report delivery schedules.
 */

import type {
  PaginatedResponse,
  ReportDefinition,
  ReportSchedule,
} from '../../types/staff';

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/staff`;

function getAuthHeaders(): HeadersInit {
  const token =
    localStorage.getItem('access_token') ||
    JSON.parse(localStorage.getItem('auth-store') || '{}')?.state?.token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

// ---------------------------------------------------------------------------
// Types local to this service
// ---------------------------------------------------------------------------

export interface ReportListParams {
  page?: number;
  page_size?: number;
}

export interface CreateReportPayload {
  name: string;
  description?: string;
  report_type: 'dashboard' | 'table' | 'chart' | 'mixed';
  config: {
    widgets: {
      id: string;
      type: string;
      data_source: string;
      position: { x: number; y: number; w: number; h: number };
      config: Record<string, unknown>;
    }[];
    layout: { columns: number; row_height: number };
  };
  filters?: Record<string, unknown>;
  is_template?: boolean;
  is_shared?: boolean;
}

export interface UpdateReportPayload {
  name?: string;
  description?: string;
  report_type?: 'dashboard' | 'table' | 'chart' | 'mixed';
  config?: {
    widgets: {
      id: string;
      type: string;
      data_source: string;
      position: { x: number; y: number; w: number; h: number };
      config: Record<string, unknown>;
    }[];
    layout: { columns: number; row_height: number };
  };
  filters?: Record<string, unknown>;
  is_template?: boolean;
  is_shared?: boolean;
}

export interface ExportReportFilters {
  date_from?: string;
  date_to?: string;
  [key: string]: unknown;
}

export interface CreateSchedulePayload {
  report_id: string;
  schedule_cron: string;
  format: 'csv' | 'excel' | 'pdf';
  recipients: { email: string; name: string }[];
  is_active?: boolean;
}

export interface UpdateSchedulePayload {
  schedule_cron?: string;
  format?: 'csv' | 'excel' | 'pdf';
  recipients?: { email: string; name: string }[];
  is_active?: boolean;
}

// ---------------------------------------------------------------------------
// API calls — Report definitions
// ---------------------------------------------------------------------------

/** Fetch a paginated list of report definitions. */
export async function getReports(
  params: ReportListParams = {},
): Promise<PaginatedResponse<ReportDefinition>> {
  const qs = new URLSearchParams();
  if (params.page != null) qs.set('page', String(params.page));
  if (params.page_size != null) qs.set('page_size', String(params.page_size));

  const response = await fetch(`${API_BASE}/reports?${qs.toString()}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<PaginatedResponse<ReportDefinition>>(response);
}

/** Fetch a single report definition by ID. */
export async function getReport(reportId: string): Promise<ReportDefinition> {
  const response = await fetch(`${API_BASE}/reports/${reportId}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<ReportDefinition>(response);
}

/** Create a new report definition. */
export async function createReport(
  data: CreateReportPayload,
): Promise<ReportDefinition> {
  const response = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ReportDefinition>(response);
}

/** Update an existing report definition. */
export async function updateReport(
  reportId: string,
  data: UpdateReportPayload,
): Promise<ReportDefinition> {
  const response = await fetch(`${API_BASE}/reports/${reportId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ReportDefinition>(response);
}

/** Delete a report definition. */
export async function deleteReport(reportId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/reports/${reportId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse<void>(response);
}

/** Export a report in the specified format. Returns a download URL. */
export async function exportReport(
  reportId: string,
  format: string,
  filters?: ExportReportFilters,
): Promise<{ download_url: string }> {
  const response = await fetch(`${API_BASE}/reports/${reportId}/export`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ format, ...(filters ? { filters } : {}) }),
  });
  return handleResponse<{ download_url: string }>(response);
}

// ---------------------------------------------------------------------------
// API calls — Report schedules
// ---------------------------------------------------------------------------

/** Fetch all report delivery schedules. */
export async function getSchedules(): Promise<ReportSchedule[]> {
  const response = await fetch(`${API_BASE}/reports/schedules`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<ReportSchedule[]>(response);
}

/** Create a new report delivery schedule. */
export async function createSchedule(
  data: CreateSchedulePayload,
): Promise<ReportSchedule> {
  const response = await fetch(`${API_BASE}/reports/schedules`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ReportSchedule>(response);
}

/** Update an existing report delivery schedule. */
export async function updateSchedule(
  scheduleId: string,
  data: UpdateSchedulePayload,
): Promise<ReportSchedule> {
  const response = await fetch(`${API_BASE}/reports/schedules/${scheduleId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ReportSchedule>(response);
}

/** Delete a report delivery schedule. */
export async function deleteSchedule(scheduleId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/reports/schedules/${scheduleId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse<void>(response);
}
