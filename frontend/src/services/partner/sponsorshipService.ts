/**
 * Sponsorship Service
 * API calls for managing sponsorship programs, children, and consents
 */

import axios from 'axios';
import type {
  SponsorshipProgram,
  SponsoredChild,
  SponsorshipConsent,
  ChildLearningJourney,
  ChildActivity,
  ChildAchievement,
  ChildGoal,
  ChildAIInsight,
  PaginatedResponse,
} from '../../types/partner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const BASE_PATH = `${API_URL}/api/v1/partner/sponsorships`;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
});

/**
 * Get all sponsorship programs
 */
export const getSponsorshipPrograms = async (
  params?: {
    status?: string;
    program_type?: string;
    page?: number;
    limit?: number;
  }
): Promise<PaginatedResponse<SponsorshipProgram>> => {
  const response = await axios.get(`${BASE_PATH}/programs`, {
    headers: getAuthHeaders(),
    params,
  });
  return response.data;
};

/**
 * Get single program detail
 */
export const getSponsorshipProgram = async (programId: string): Promise<SponsorshipProgram> => {
  const response = await axios.get(`${BASE_PATH}/programs/${programId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

/**
 * Create new sponsorship program
 */
export const createSponsorshipProgram = async (
  data: Partial<SponsorshipProgram>
): Promise<SponsorshipProgram> => {
  const response = await axios.post(`${BASE_PATH}/programs`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

/**
 * Update sponsorship program
 */
export const updateSponsorshipProgram = async (
  programId: string,
  data: Partial<SponsorshipProgram>
): Promise<SponsorshipProgram> => {
  const response = await axios.put(`${BASE_PATH}/programs/${programId}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

/**
 * Add children to program (bulk)
 */
export const addChildrenToProgram = async (
  programId: string,
  studentIds: string[]
): Promise<{ added: SponsoredChild[]; errors: any[] }> => {
  const response = await axios.post(
    `${BASE_PATH}/programs/${programId}/children`,
    { student_ids: studentIds },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Remove child from program
 */
export const removeChildFromProgram = async (
  programId: string,
  studentId: string
): Promise<{ success: boolean; message: string }> => {
  const response = await axios.delete(
    `${BASE_PATH}/programs/${programId}/children/${studentId}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Get all sponsored children across programs
 */
export const getSponsoredChildren = async (
  params?: {
    program_id?: string;
    status?: string;
    consent_status?: 'pending' | 'approved' | 'none';
    page?: number;
    limit?: number;
  }
): Promise<PaginatedResponse<SponsoredChild>> => {
  const response = await axios.get(`${BASE_PATH}/children`, {
    headers: getAuthHeaders(),
    params,
  });
  return response.data;
};

/**
 * Get child progress / learning journey
 */
export const getChildProgress = async (childId: string): Promise<ChildLearningJourney> => {
  const response = await axios.get(`${BASE_PATH}/children/${childId}/progress`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

/**
 * Get child activity data
 */
export const getChildActivity = async (
  childId: string,
  period: 'week' | 'month' | 'term' = 'week'
): Promise<ChildActivity> => {
  const response = await axios.get(`${BASE_PATH}/children/${childId}/activity`, {
    headers: getAuthHeaders(),
    params: { period },
  });
  return response.data;
};

/**
 * Get child achievements
 */
export const getChildAchievements = async (childId: string): Promise<ChildAchievement[]> => {
  const response = await axios.get(`${BASE_PATH}/children/${childId}/achievements`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

/**
 * Get child goals
 */
export const getChildGoals = async (childId: string): Promise<ChildGoal[]> => {
  const response = await axios.get(`${BASE_PATH}/children/${childId}/goals`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

/**
 * Get AI insights for child
 */
export const getChildAIInsights = async (childId: string): Promise<ChildAIInsight> => {
  const response = await axios.get(`${BASE_PATH}/children/${childId}/ai-insights`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

/**
 * Request parent consent
 */
export const requestConsent = async (
  sponsoredChildId: string
): Promise<{ success: boolean; consent_id: string }> => {
  const response = await axios.post(
    `${BASE_PATH}/consent/request`,
    { sponsored_child_id: sponsoredChildId },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Get consent status for all children
 */
export const getConsentStatus = async (): Promise<
  Array<{
    sponsored_child_id: string;
    consent_given: boolean;
    consented_at?: string;
    pending: boolean;
  }>
> => {
  const response = await axios.get(`${BASE_PATH}/consent/status`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export default {
  getSponsorshipPrograms,
  getSponsorshipProgram,
  createSponsorshipProgram,
  updateSponsorshipProgram,
  addChildrenToProgram,
  removeChildFromProgram,
  getSponsoredChildren,
  getChildProgress,
  getChildActivity,
  getChildAchievements,
  getChildGoals,
  getChildAIInsights,
  requestConsent,
  getConsentStatus,
};
