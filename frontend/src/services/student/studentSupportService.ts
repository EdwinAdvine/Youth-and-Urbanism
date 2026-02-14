/**
 * Student Support Service - Help, Guides, Tickets
 */
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_PREFIX = '/api/v1/student/support';

/**
 * Get help guides
 */
export const getHelpGuides = async (category?: string) => {
  const token = localStorage.getItem('access_token');
  const url = category
    ? `${API_BASE}${API_PREFIX}/guides?category=${category}`
    : `${API_BASE}${API_PREFIX}/guides`;

  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

/**
 * Get specific guide
 */
export const getGuide = async (guideId: string) => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/guides/${guideId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

/**
 * Get FAQ
 */
export const getFAQ = async () => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/faq`, {
    headers: { Authorization: `Bearer ${token}` }
  });
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
  const token = localStorage.getItem('access_token');
  const response = await axios.post(`${API_BASE}${API_PREFIX}/tickets`,
    data,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

/**
 * Get student tickets
 */
export const getStudentTickets = async () => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/tickets`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

/**
 * Get AI help
 */
export const getAIHelp = async (question: string) => {
  const token = localStorage.getItem('access_token');
  const response = await axios.post(`${API_BASE}${API_PREFIX}/ai-help`,
    { question },
    { headers: { Authorization: `Bearer ${token}` } }
  );
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
  const token = localStorage.getItem('access_token');
  const response = await axios.post(`${API_BASE}${API_PREFIX}/report`,
    data,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};
