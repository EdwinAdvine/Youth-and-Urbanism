/**
 * Student Progress & Gamification Service - API calls for XP, badges, goals
 */
import axios from 'axios';
import type { XPData, Badge, LearningGoal, LeaderboardEntry } from '../../types/student';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_PREFIX = '/api/v1/student/progress';

/**
 * Get student's XP and level data
 */
export const getXPAndLevel = async (): Promise<XPData> => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/xp`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

/**
 * Get all badges earned by student
 */
export const getBadges = async (): Promise<Badge[]> => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/badges`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

/**
 * Get leaderboard data
 */
export const getLeaderboard = async (
  scope: 'class' | 'grade' | 'school' = 'class',
  limit: number = 10
): Promise<LeaderboardEntry[]> => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(
    `${API_BASE}${API_PREFIX}/leaderboard?scope=${scope}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};

/**
 * Get student's active learning goals
 */
export const getGoals = async (): Promise<LearningGoal[]> => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/goals`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

/**
 * Create a new learning goal
 */
export const createGoal = async (data: {
  title: string;
  target: number;
  unit?: string;
  deadline?: Date;
}): Promise<{
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline: Date | null;
  message: string;
}> => {
  const token = localStorage.getItem('access_token');
  const response = await axios.post(`${API_BASE}${API_PREFIX}/goals`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

/**
 * Get or generate AI-powered weekly learning report
 */
export const getWeeklyReport = async (): Promise<{
  id: string;
  week_start: Date;
  week_end: Date;
  ai_story: string;
  metrics: {
    total_xp_earned: number;
    activities_completed: number;
    lessons_completed: number;
    assignments_completed: number;
    quizzes_completed: number;
  };
  strongest_subject: string | null;
  improvement_area: string | null;
  shared_with_parent: boolean;
}> => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/weekly-report`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};
