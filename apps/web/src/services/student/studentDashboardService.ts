/**
 * Student Dashboard Service - API calls for dashboard data
 */
import apiClient from '../api';
import type { DailyPlan, MoodType, DailyQuote, UrgentItem } from '../../types/student';

const API_PREFIX = '/api/v1/student/dashboard';

/**
 * Get comprehensive dashboard data for today
 */
export const getTodayDashboard = async (): Promise<{
  greeting: string;
  student_name: string;
  daily_plan: DailyPlan;
  streak: { current_streak: number; longest_streak: number; last_activity: Date | null };
  mood: { mood_type: string; energy_level: number; note: string | null; timestamp: Date } | null;
  urgent_items: UrgentItem[];
  daily_quote: DailyQuote;
  xp_data: { current_xp: number; level: number; next_level_xp: number; progress_to_next_level: number };
  timestamp: Date;
}> => {
  const response = await apiClient.get(`${API_PREFIX}/today`);
  return response.data;
};

/**
 * Submit mood check-in
 */
export const submitMoodCheckIn = async (data: {
  mood_type: MoodType;
  energy_level: number;
  note?: string;
}): Promise<{
  id: string;
  mood_type: string;
  energy_level: number;
  note: string | null;
  timestamp: Date;
  message: string;
}> => {
  const response = await apiClient.post(`${API_PREFIX}/mood`, data);
  return response.data;
};

/**
 * Get teacher sync notes
 */
export const getTeacherSyncNotes = async (): Promise<Array<{
  id: string;
  note: string;
  teacher_name: string;
  created_at: Date;
}>> => {
  const response = await apiClient.get(`${API_PREFIX}/teacher-sync`);
  return response.data;
};

/**
 * Get daily quote/micro-lesson
 */
export const getDailyQuote = async (): Promise<DailyQuote> => {
  const response = await apiClient.get(`${API_PREFIX}/quote`);
  return response.data;
};

/**
 * Update daily plan (drag-drop reorder, mark complete)
 */
export const updateDailyPlan = async (items: Array<any>): Promise<{
  date: Date;
  items: Array<any>;
  manually_edited: boolean;
  message: string;
}> => {
  const response = await apiClient.put(`${API_PREFIX}/daily-plan`, { items });
  return response.data;
};
