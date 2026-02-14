/**
 * Partner Finance Service
 * API calls for subscriptions, payments, and billing
 */

import axios from 'axios';
import type {
  PartnerSubscription,
  PartnerPayment,
  PaginatedResponse,
} from '../../types/partner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const BASE_PATH = `${API_URL}/api/v1/partner/finance`;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
});

/**
 * Get all subscriptions
 */
export const getSubscriptions = async (
  params?: {
    status?: string;
    program_id?: string;
    page?: number;
    limit?: number;
  }
): Promise<PaginatedResponse<PartnerSubscription>> => {
  const response = await axios.get(`${BASE_PATH}/subscriptions`, {
    headers: getAuthHeaders(),
    params,
  });
  return response.data;
};

/**
 * Create new subscription
 */
export const createSubscription = async (data: {
  program_id: string;
  billing_period: 'monthly' | 'termly' | 'annual';
  payment_method_id?: string;
  auto_renew?: boolean;
}): Promise<PartnerSubscription> => {
  const response = await axios.post(`${BASE_PATH}/subscriptions`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

/**
 * Update subscription
 */
export const updateSubscription = async (
  subscriptionId: string,
  data: Partial<PartnerSubscription>
): Promise<PartnerSubscription> => {
  const response = await axios.put(`${BASE_PATH}/subscriptions/${subscriptionId}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

/**
 * Cancel subscription
 */
export const cancelSubscription = async (
  subscriptionId: string,
  reason?: string
): Promise<{ success: boolean; message: string }> => {
  const response = await axios.delete(`${BASE_PATH}/subscriptions/${subscriptionId}`, {
    headers: getAuthHeaders(),
    data: { reason },
  });
  return response.data;
};

/**
 * Process payment
 */
export const processPayment = async (data: {
  subscription_id: string;
  payment_gateway: 'mpesa' | 'stripe' | 'paypal';
  phone_number?: string;
  card_token?: string;
}): Promise<PartnerPayment> => {
  const response = await axios.post(`${BASE_PATH}/payments`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

/**
 * Get billing history
 */
export const getBillingHistory = async (
  params?: {
    subscription_id?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  }
): Promise<PaginatedResponse<PartnerPayment>> => {
  const response = await axios.get(`${BASE_PATH}/payments`, {
    headers: getAuthHeaders(),
    params,
  });
  return response.data;
};

/**
 * Download receipt
 */
export const downloadReceipt = async (paymentId: string): Promise<{ url: string }> => {
  const response = await axios.get(`${BASE_PATH}/payments/${paymentId}/receipt`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

/**
 * Get budget overview
 */
export const getBudgetOverview = async (): Promise<{
  total_monthly_spend: number;
  total_annual_spend: number;
  allocations: Array<{
    program_id: string;
    program_name: string;
    monthly_amount: number;
    children_count: number;
  }>;
  forecasts: {
    next_month: number;
    next_quarter: number;
    next_year: number;
  };
}> => {
  const response = await axios.get(`${BASE_PATH}/budget`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

/**
 * Get grant tracking
 */
export const getGrants = async (): Promise<
  Array<{
    id: string;
    name: string;
    amount: number;
    utilized: number;
    remaining: number;
    start_date: string;
    end_date: string;
    status: string;
  }>
> => {
  const response = await axios.get(`${BASE_PATH}/grants`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export default {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  processPayment,
  getBillingHistory,
  downloadReceipt,
  getBudgetOverview,
  getGrants,
};
