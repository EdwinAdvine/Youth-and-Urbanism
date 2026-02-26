/**
 * Partner Support Service
 * API calls for support tickets and help resources
 */

import apiClient from '../api';
import type { PartnerTicket, PaginatedResponse } from '../../types/partner';

const BASE_PATH = `/api/v1/partner/support`;

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

  const response = await apiClient.post(`${BASE_PATH}/tickets`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
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
  const response = await apiClient.get(`${BASE_PATH}/tickets`, { params });
  return response.data;
};

/**
 * Get single ticket
 */
export const getTicket = async (ticketId: string): Promise<PartnerTicket> => {
  const response = await apiClient.get(`${BASE_PATH}/tickets/${ticketId}`);
  return response.data;
};

/**
 * Update ticket
 */
export const updateTicket = async (
  ticketId: string,
  data: Partial<PartnerTicket>
): Promise<PartnerTicket> => {
  const response = await apiClient.put(`${BASE_PATH}/tickets/${ticketId}`, data);
  return response.data;
};

export default {
  createTicket,
  getTickets,
  getTicket,
  updateTicket,
};
