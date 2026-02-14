/**
 * Staff Dashboard Service
 *
 * Wraps API calls to /api/v1/staff/dashboard endpoints for fetching
 * dashboard statistics, personalized focus data, and AI-generated agenda items.
 */

import type {
  StaffDashboardStats,
  MyFocusData,
  AIAgendaItem,
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

/** Fetch aggregate dashboard statistics for the current staff member. */
export async function getDashboardStats(): Promise<StaffDashboardStats> {
  const response = await fetch(`${API_BASE}/dashboard/overview`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<StaffDashboardStats>(response);
}

/** Fetch the personalised "My Focus" view with urgent items and AI anomalies. */
export async function getMyFocus(): Promise<MyFocusData> {
  const response = await fetch(`${API_BASE}/dashboard/my-focus`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<MyFocusData>(response);
}

/** Fetch the AI-prioritised agenda for the current staff member. */
export async function getAIAgenda(): Promise<AIAgendaItem[]> {
  const response = await fetch(`${API_BASE}/dashboard/ai-agenda`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<AIAgendaItem[]>(response);
}
