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
import apiClient from '../api';

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
  const { data } = await apiClient.get<{ status: string; data: MyPerformanceData }>(
    '/api/v1/staff/team/my-performance',
  );
  return data.data;
}

/** Fetch team pulse data including member metrics and workload balance. */
export async function getTeamPulse(): Promise<TeamPulseData> {
  const { data } = await apiClient.get<{ status: string; data: TeamPulseData }>(
    '/api/v1/staff/team/pulse',
  );
  return data.data;
}

/** Request AI-generated workload rebalancing suggestions. */
export async function getWorkloadSuggestions(
  params: WorkloadRebalanceParams = {},
): Promise<WorkloadRebalanceResponse> {
  const { data } = await apiClient.post<{ status: string; data: WorkloadRebalanceResponse }>(
    '/api/v1/staff/team/workload/rebalance',
    params,
  );
  return data.data;
}

/** Fetch available learning resources for professional development. */
export async function getLearningResources(): Promise<LearningResource[]> {
  const { data } = await apiClient.get<{ status: string; data: LearningResource[] }>(
    '/api/v1/staff/team/learning-resources',
  );
  return data.data;
}

/** Fetch all team members. */
export async function getTeamMembers(): Promise<TeamMember[]> {
  const { data } = await apiClient.get<{ status: string; data: TeamMember[] }>(
    '/api/v1/staff/team/members',
  );
  return data.data;
}
