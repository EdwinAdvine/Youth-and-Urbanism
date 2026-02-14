/**
 * Staff Team & Performance Service
 *
 * Wraps API calls to /api/v1/staff/team endpoints for retrieving individual
 * performance metrics, team pulse data, AI-driven workload rebalancing
 * suggestions, learning resources, and team member listings.
 */

import type {
  MyPerformanceData,
  TeamPulseData,
  WorkloadSuggestion,
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

export interface WorkloadRebalanceParams {
  team_id?: string;
  period?: '7d' | '30d' | '90d';
}

export interface WorkloadRebalanceResponse {
  current_balance_score: number;
  suggestions: WorkloadSuggestion[];
}

export interface LearningResource {
  id: string;
  title: string;
  description: string;
  url: string;
  resource_type: 'article' | 'video' | 'course' | 'document';
  tags: string[];
  estimated_duration_minutes: number;
  created_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  position: string;
  avatar: string | null;
  is_active: boolean;
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

/** Fetch the current staff member's performance metrics. */
export async function getMyPerformance(): Promise<MyPerformanceData> {
  const response = await fetch(`${API_BASE}/team/my-performance`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<MyPerformanceData>(response);
}

/** Fetch team pulse data including member metrics and workload balance. */
export async function getTeamPulse(): Promise<TeamPulseData> {
  const response = await fetch(`${API_BASE}/team/pulse`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<TeamPulseData>(response);
}

/** Request AI-generated workload rebalancing suggestions. */
export async function getWorkloadSuggestions(
  params: WorkloadRebalanceParams = {},
): Promise<WorkloadRebalanceResponse> {
  const response = await fetch(`${API_BASE}/team/workload/rebalance`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });
  return handleResponse<WorkloadRebalanceResponse>(response);
}

/** Fetch available learning resources for professional development. */
export async function getLearningResources(): Promise<LearningResource[]> {
  const response = await fetch(`${API_BASE}/team/learning-resources`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<LearningResource[]>(response);
}

/** Fetch all team members. */
export async function getTeamMembers(): Promise<TeamMember[]> {
  const response = await fetch(`${API_BASE}/team/members`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<TeamMember[]>(response);
}
