/**
 * Student Learning Service - Courses, Enrollments, Live Sessions
 */
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_PREFIX = '/api/v1/student/learning';

/**
 * Get enrolled courses with progress
 */
export const getEnrolledCourses = async () => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/courses/enrolled`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

/**
 * Get AI-recommended courses
 */
export const getAIRecommendedCourses = async (limit: number = 10) => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/courses/recommended?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` }
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
  const token = localStorage.getItem('access_token');
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) queryParams.append(key, String(value));
  });

  const response = await axios.get(`${API_BASE}${API_PREFIX}/browse?${queryParams}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

/**
 * Get course preview
 */
export const getCoursePreview = async (courseId: string) => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/course/${courseId}/preview`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

/**
 * Get wishlist
 */
export const getWishlist = async () => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/wishlist`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

/**
 * Add to wishlist
 */
export const addToWishlist = async (courseId: string) => {
  const token = localStorage.getItem('access_token');
  const response = await axios.post(`${API_BASE}${API_PREFIX}/wishlist`,
    { course_id: courseId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

/**
 * Remove from wishlist
 */
export const removeFromWishlist = async (courseId: string) => {
  const token = localStorage.getItem('access_token');
  const response = await axios.delete(`${API_BASE}${API_PREFIX}/wishlist/${courseId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

/**
 * Get upcoming live sessions
 */
export const getUpcomingLiveSessions = async () => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/live-sessions/upcoming`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

/**
 * Get session prep
 */
export const getSessionPrep = async (sessionId: string) => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/session/${sessionId}/prep`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
