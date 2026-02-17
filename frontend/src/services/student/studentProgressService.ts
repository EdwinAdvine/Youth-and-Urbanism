/**
 * Student Progress & Gamification Service - API calls for XP, badges, goals
 */
import apiClient from '../api';
import type { Badge, LearningGoal } from '../../types/student';

/** XP and level data returned by the progress API */
export interface XPData {
  totalXp: number;
  currentLevel: number;
  nextLevelXp: number;
  percentToNext: number;
}

/** Single entry on the leaderboard */
export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  xp: number;
  level: number;
  avatar?: string;
}

const API_PREFIX = '/api/v1/student/progress';

/**
 * Get student's XP and level data
 */
export const getXPAndLevel = async (): Promise<XPData> => {
  const response = await apiClient.get(`${API_PREFIX}/xp`);
  return response.data;
};

/**
 * Get all badges earned by student
 */
export const getBadges = async (): Promise<Badge[]> => {
  const response = await apiClient.get(`${API_PREFIX}/badges`);
  return response.data;
};

/**
 * Get leaderboard data
 */
export const getLeaderboard = async (
  scope: 'class' | 'grade' | 'school' = 'class',
  limit: number = 10
): Promise<LeaderboardEntry[]> => {
  const response = await apiClient.get(
    `${API_PREFIX}/leaderboard?scope=${scope}&limit=${limit}`
  );
  return response.data;
};

/**
 * Get student's active learning goals
 */
export const getGoals = async (): Promise<LearningGoal[]> => {
  const response = await apiClient.get(`${API_PREFIX}/goals`);
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
  const response = await apiClient.post(`${API_PREFIX}/goals`, data);
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
  const response = await apiClient.get(`${API_PREFIX}/weekly-report`);
  return response.data;
};
