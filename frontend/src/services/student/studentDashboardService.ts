/**
 * Student Dashboard Service - API calls for dashboard data
 */
import axios from 'axios';
import type { DailyPlan, MoodType, DailyQuote, UrgentItem } from '../../types/student';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
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
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/today`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
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
  const token = localStorage.getItem('access_token');
  const response = await axios.post(`${API_BASE}${API_PREFIX}/mood`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
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
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/teacher-sync`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

/**
 * Get daily quote/micro-lesson
 */
export const getDailyQuote = async (): Promise<DailyQuote> => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/quote`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
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
  const token = localStorage.getItem('access_token');
  const response = await axios.put(`${API_BASE}${API_PREFIX}/daily-plan`, { items }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};
