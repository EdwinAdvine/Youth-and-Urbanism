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
// API calls
// ---------------------------------------------------------------------------

/** Fetch platform health metrics for a given date range. */
export async function getPlatformHealth(
  dateFrom?: string,
  dateTo?: string,
): Promise<PlatformHealthMetrics> {
  const qs = new URLSearchParams();
  if (dateFrom) qs.set('date_from', dateFrom);
  if (dateTo) qs.set('date_to', dateTo);

  const query = qs.toString();
  const url = `${API_BASE}/insights/platform-health${query ? `?${query}` : ''}`;

  const response = await fetch(url, { headers: getAuthHeaders() });
  return handleResponse<PlatformHealthMetrics>(response);
}

/** Fetch content performance analytics for a given date range. */
export async function getContentPerformance(
  dateFrom?: string,
  dateTo?: string,
): Promise<ContentPerformanceData> {
  const qs = new URLSearchParams();
  if (dateFrom) qs.set('date_from', dateFrom);
  if (dateTo) qs.set('date_to', dateTo);

  const query = qs.toString();
  const url = `${API_BASE}/insights/content-performance${query ? `?${query}` : ''}`;

  const response = await fetch(url, { headers: getAuthHeaders() });
  return handleResponse<ContentPerformanceData>(response);
}

/** Fetch support effectiveness metrics for a given date range. */
export async function getSupportMetrics(
  dateFrom?: string,
  dateTo?: string,
): Promise<SupportMetrics> {
  const qs = new URLSearchParams();
  if (dateFrom) qs.set('date_from', dateFrom);
  if (dateTo) qs.set('date_to', dateTo);

  const query = qs.toString();
  const url = `${API_BASE}/insights/support-metrics${query ? `?${query}` : ''}`;

  const response = await fetch(url, { headers: getAuthHeaders() });
  return handleResponse<SupportMetrics>(response);
}
