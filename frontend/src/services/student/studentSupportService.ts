/**
 * Student Support Service - Help, Guides, Tickets
 */
import apiClient from '../api';

const API_PREFIX = '/api/v1/student/support';

/**
 * Get help guides
 */
export const getHelpGuides = async (category?: string) => {
  const url = category
    ? `${API_PREFIX}/guides?category=${category}`
    : `${API_PREFIX}/guides`;

  const response = await apiClient.get(url);
  return response.data;
};

/**
 * Get specific guide
 */
export const getGuide = async (guideId: string) => {
  const response = await apiClient.get(`${API_PREFIX}/guides/${guideId}`);
  return response.data;
};

/**
 * Get FAQ
 */
export const getFAQ = async () => {
  const response = await apiClient.get(`${API_PREFIX}/faq`);
  return response.data;
};

/**
 * Create support ticket
 */
export const createSupportTicket = async (data: {
  subject: string;
  description: string;
  priority?: 'normal' | 'high' | 'urgent';
}) => {
  const response = await apiClient.post(`${API_PREFIX}/tickets`, data);
  return response.data;
};

/**
 * Get student tickets
 */
export const getStudentTickets = async () => {
  const response = await apiClient.get(`${API_PREFIX}/tickets`);
  return response.data;
};

/**
 * Get AI help
 */
export const getAIHelp = async (question: string) => {
  const response = await apiClient.post(`${API_PREFIX}/ai-help`, { question });
  return response.data;
};

/**
 * Report problem
 */
export const reportProblem = async (data: {
  problem_type: string;
  description: string;
  urgency?: 'normal' | 'high' | 'critical';
}) => {
  const response = await apiClient.post(`${API_PREFIX}/report`, data);
  return response.data;
};
