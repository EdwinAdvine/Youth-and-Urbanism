/**
 * Parent Children Service
 *
 * API service for parent children endpoints.
 */

import api from './api';
import type {
  ChildrenListResponse,
  ChildProfileResponse,
  LearningJourneyResponse,
  ActivityResponse,
  AchievementsResponse,
  GoalsListResponse,
  FamilyGoalCreate,
  FamilyGoalUpdate,
  FamilyGoalResponse,
  AIPathwaysResponse,
} from '../types/parent';

const BASE_URL = '/api/v1/parent/children';

/**
 * Get list of all children for parent
 */
export const getChildrenList = async (): Promise<ChildrenListResponse> => {
  const response = await api.get(BASE_URL);
  return response.data;
};

/**
 * Get full child profile
 */
export const getChildProfile = async (childId: string): Promise<ChildProfileResponse> => {
  const response = await api.get(`${BASE_URL}/${childId}`);
  return response.data;
};

/**
 * Get child's learning journey
 */
export const getLearningJourney = async (childId: string): Promise<LearningJourneyResponse> => {
  const response = await api.get(`${BASE_URL}/${childId}/learning-journey`);
  return response.data;
};

/**
 * Get CBC competencies (alias for learning journey)
 */
export const getCBCCompetencies = async (childId: string): Promise<LearningJourneyResponse> => {
  const response = await api.get(`${BASE_URL}/${childId}/cbc-competencies`);
  return response.data;
};

/**
 * Get child's activity tracking data
 */
export const getActivity = async (childId: string): Promise<ActivityResponse> => {
  const response = await api.get(`${BASE_URL}/${childId}/activity`);
  return response.data;
};

/**
 * Get child's achievements and milestones
 */
export const getAchievements = async (childId: string): Promise<AchievementsResponse> => {
  const response = await api.get(`${BASE_URL}/${childId}/achievements`);
  return response.data;
};

/**
 * Get goals for specific child
 */
export const getChildGoals = async (childId: string): Promise<GoalsListResponse> => {
  const response = await api.get(`${BASE_URL}/${childId}/goals`);
  return response.data;
};

/**
 * Get all family goals
 */
export const getAllGoals = async (): Promise<GoalsListResponse> => {
  const response = await api.get(`${BASE_URL}/goals/all`);
  return response.data;
};

/**
 * Create a new family goal
 */
export const createGoal = async (data: FamilyGoalCreate): Promise<FamilyGoalResponse> => {
  const response = await api.post(`${BASE_URL}/goals`, data);
  return response.data;
};

/**
 * Update a family goal
 */
export const updateGoal = async (
  goalId: string,
  data: FamilyGoalUpdate
): Promise<FamilyGoalResponse> => {
  const response = await api.put(`${BASE_URL}/goals/${goalId}`, data);
  return response.data;
};

/**
 * Delete a family goal
 */
export const deleteGoal = async (goalId: string): Promise<void> => {
  await api.delete(`${BASE_URL}/goals/${goalId}`);
};

/**
 * Get AI-predicted learning pathways
 */
export const getAIPathways = async (childId: string): Promise<AIPathwaysResponse> => {
  const response = await api.get(`${BASE_URL}/${childId}/ai-pathways`);
  return response.data;
};

export default {
  getChildrenList,
  getChildProfile,
  getLearningJourney,
  getCBCCompetencies,
  getActivity,
  getAchievements,
  getChildGoals,
  getAllGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  getAIPathways,
};
