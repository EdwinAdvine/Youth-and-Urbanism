/**
 * Student Learning Service - Courses, Enrollments, Live Sessions
 */
import apiClient from '../api';

const API_PREFIX = '/api/v1/student/learning';

/**
 * Get enrolled courses with progress
 */
export const getEnrolledCourses = async () => {
  const response = await apiClient.get(`${API_PREFIX}/courses/enrolled`);
  return response.data;
};

/**
 * Get AI-recommended courses
 */
export const getAIRecommendedCourses = async (limit: number = 10) => {
  const response = await apiClient.get(`${API_PREFIX}/courses/recommended`, {
    params: { limit },
  });
  return response.data;
};

/**
 * Browse courses marketplace
 */
export const browseCourses = async (params: {
  search?: string;
  grade_level?: number;
  subject?: string;
  sort_by?: string;
  limit?: number;
  offset?: number;
}) => {
  const response = await apiClient.get(`${API_PREFIX}/browse`, { params });
  return response.data;
};

/**
 * Get course preview
 */
export const getCoursePreview = async (courseId: string) => {
  const response = await apiClient.get(`${API_PREFIX}/course/${courseId}/preview`);
  return response.data;
};

/**
 * Get wishlist
 */
export const getWishlist = async () => {
  const response = await apiClient.get(`${API_PREFIX}/wishlist`);
  return response.data;
};

/**
 * Add to wishlist
 */
export const addToWishlist = async (courseId: string) => {
  const response = await apiClient.post(`${API_PREFIX}/wishlist`, { course_id: courseId });
  return response.data;
};

/**
 * Remove from wishlist
 */
export const removeFromWishlist = async (courseId: string) => {
  const response = await apiClient.delete(`${API_PREFIX}/wishlist/${courseId}`);
  return response.data;
};

/**
 * Get upcoming live sessions
 */
export const getUpcomingLiveSessions = async () => {
  const response = await apiClient.get(`${API_PREFIX}/live-sessions/upcoming`);
  return response.data;
};

/**
 * Get session prep
 */
export const getSessionPrep = async (sessionId: string) => {
  const response = await apiClient.get(`${API_PREFIX}/session/${sessionId}/prep`);
  return response.data;
};
