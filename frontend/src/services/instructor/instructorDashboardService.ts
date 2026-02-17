/**
 * Instructor Dashboard Service
 *
 * API calls to /api/v1/instructor/dashboard endpoints.
 */
import apiClient from '../api';

export interface DashboardOverview {
  stats: {
    total_students: number;
    active_students_today: number;
    total_courses: number;
    published_courses: number;
    upcoming_sessions_count: number;
    earnings_this_month: number;
    earnings_total: number;
    average_rating: number;
    total_reviews: number;
    pending_submissions: number;
    ai_flagged_students: string[];
    current_streak: number;
    total_points: number;
    level: number;
  };
  upcoming_sessions: unknown[];
  pending_submissions: unknown[];
  ai_flagged_students: unknown[];
  quick_actions: unknown[];
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const { data } = await apiClient.get<DashboardOverview>(
    '/api/v1/instructor/dashboard/overview',
  );
  return data;
}
