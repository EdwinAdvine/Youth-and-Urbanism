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
import apiClient from '../api';

/** Fetch aggregate dashboard statistics for the current staff member. */
export async function getDashboardStats(): Promise<StaffDashboardStats> {
  const { data } = await apiClient.get<StaffDashboardStats>('/api/v1/staff/dashboard/overview');
  return data;
}

/** Fetch the personalised "My Focus" view with urgent items and AI anomalies. */
export async function getMyFocus(): Promise<MyFocusData> {
  const { data } = await apiClient.get<MyFocusData>('/api/v1/staff/dashboard/my-focus');
  return data;
}

/** Fetch the AI-prioritised agenda for the current staff member. */
export async function getAIAgenda(): Promise<AIAgendaItem[]> {
  const { data } = await apiClient.get<AIAgendaItem[]>('/api/v1/staff/dashboard/ai-agenda');
  return data;
}
