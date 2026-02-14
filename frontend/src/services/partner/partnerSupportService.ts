/**
 * Partner Support Service
 * API calls for support tickets and help resources
 */

import axios from 'axios';
import type { PartnerTicket, PaginatedResponse } from '../../types/partner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const BASE_PATH = `${API_URL}/api/v1/partner/support`;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
});

/**
 * Create support ticket
 */
export const createTicket = async (data: {
  subject: string;
  description: string;
  category: 'billing' | 'technical' | 'enrollment' | 'reporting' | 'general';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  attachments?: File[];
}): Promise<PartnerTicket> => {
  const formData = new FormData();
  formData.append('subject', data.subject);
  formData.append('description', data.description);
  formData.append('category', data.category);

  if (data.priority) {
    formData.append('priority', data.priority);
  }

  if (data.attachments) {
    data.attachments.forEach((file, index) => {
      formData.append(`attachments[${index}]`, file);
    });
  }

  const response = await axios.post(`${BASE_PATH}/tickets`, formData, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Get all tickets
 */
export const getTickets = async (params?: {
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  category?: string;
  priority?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<PartnerTicket>> => {
  const response = await axios.get(`${BASE_PATH}/tickets`, {
    headers: getAuthHeaders(),
    params,
  });
  return response.data;
};

/**
 * Get single ticket
 */
export const getTicket = async (ticketId: string): Promise<PartnerTicket> => {
  const response = await axios.get(`${BASE_PATH}/tickets/${ticketId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

/**
 * Update ticket
 */
export const updateTicket = async (
  ticketId: string,
  data: Partial<PartnerTicket>
): Promise<PartnerTicket> => {
  const response = await axios.put(`${BASE_PATH}/tickets/${ticketId}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export default {
  createTicket,
  getTickets,
  getTicket,
  updateTicket,
};
