/**
 * Staff Insights Service
 *
 * Wraps API calls to /api/v1/staff/insights endpoints for retrieving
 * platform health metrics, content performance analytics, and support
 * effectiveness metrics over configurable date ranges.
 */

import type {
  PlatformHealthMetrics,
  ContentPerformanceData,
  SupportMetrics,
} from '../../types/staff';
import apiClient from '../api';

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

/** Fetch platform health metrics for a given date range. */
export async function getPlatformHealth(
  dateFrom?: string,
  dateTo?: string,
): Promise<PlatformHealthMetrics> {
  const params: Record<string, string> = {};
  if (dateFrom) params.date_from = dateFrom;
  if (dateTo) params.date_to = dateTo;

  const { data } = await apiClient.get<PlatformHealthMetrics>(
    '/api/v1/staff/insights/platform-health',
    { params },
  );
  return data;
}

/** Fetch content performance analytics for a given date range. */
export async function getContentPerformance(
  dateFrom?: string,
  dateTo?: string,
): Promise<ContentPerformanceData> {
  const params: Record<string, string> = {};
  if (dateFrom) params.date_from = dateFrom;
  if (dateTo) params.date_to = dateTo;

  const { data } = await apiClient.get<ContentPerformanceData>(
    '/api/v1/staff/insights/content-performance',
    { params },
  );
  return data;
}

/** Fetch support effectiveness metrics for a given date range. */
export async function getSupportMetrics(
  dateFrom?: string,
  dateTo?: string,
): Promise<SupportMetrics> {
  const params: Record<string, string> = {};
  if (dateFrom) params.date_from = dateFrom;
  if (dateTo) params.date_to = dateTo;

  const { data } = await apiClient.get<SupportMetrics>(
    '/api/v1/staff/insights/support-metrics',
    { params },
  );
  return data;
}
