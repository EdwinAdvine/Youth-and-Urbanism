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
import apiClient from '../api';

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
// API calls -- Report definitions
// ---------------------------------------------------------------------------

/** Fetch a paginated list of report definitions. */
export async function getReports(
  params: ReportListParams = {},
): Promise<PaginatedResponse<ReportDefinition>> {
  const { data } = await apiClient.get<PaginatedResponse<ReportDefinition>>(
    '/api/v1/staff/reports',
    { params },
  );
  return data;
}

/** Fetch a single report definition by ID. */
export async function getReport(reportId: string): Promise<ReportDefinition> {
  const { data } = await apiClient.get<ReportDefinition>(`/api/v1/staff/reports/${reportId}`);
  return data;
}

/** Create a new report definition. */
export async function createReport(
  payload: CreateReportPayload,
): Promise<ReportDefinition> {
  const { data } = await apiClient.post<ReportDefinition>('/api/v1/staff/reports', payload);
  return data;
}

/** Update an existing report definition. */
export async function updateReport(
  reportId: string,
  payload: UpdateReportPayload,
): Promise<ReportDefinition> {
  const { data } = await apiClient.patch<ReportDefinition>(
    `/api/v1/staff/reports/${reportId}`,
    payload,
  );
  return data;
}

/** Delete a report definition. */
export async function deleteReport(reportId: string): Promise<void> {
  await apiClient.delete(`/api/v1/staff/reports/${reportId}`);
}

/** Export a report in the specified format. Returns a download URL. */
export async function exportReport(
  reportId: string,
  format: string,
  filters?: ExportReportFilters,
): Promise<{ download_url: string }> {
  const { data } = await apiClient.post<{ download_url: string }>(
    `/api/v1/staff/reports/${reportId}/export`,
    { format, ...(filters ? { filters } : {}) },
  );
  return data;
}

// ---------------------------------------------------------------------------
// API calls -- Report schedules
// ---------------------------------------------------------------------------

/** Fetch all report delivery schedules. */
export async function getSchedules(): Promise<ReportSchedule[]> {
  const { data } = await apiClient.get<ReportSchedule[]>('/api/v1/staff/reports/schedules');
  return data;
}

/** Create a new report delivery schedule. */
export async function createSchedule(
  payload: CreateSchedulePayload,
): Promise<ReportSchedule> {
  const { data } = await apiClient.post<ReportSchedule>(
    '/api/v1/staff/reports/schedules',
    payload,
  );
  return data;
}

/** Update an existing report delivery schedule. */
export async function updateSchedule(
  scheduleId: string,
  payload: UpdateSchedulePayload,
): Promise<ReportSchedule> {
  const { data } = await apiClient.patch<ReportSchedule>(
    `/api/v1/staff/reports/schedules/${scheduleId}`,
    payload,
  );
  return data;
}

/** Delete a report delivery schedule. */
export async function deleteSchedule(scheduleId: string): Promise<void> {
  await apiClient.delete(`/api/v1/staff/reports/schedules/${scheduleId}`);
}
