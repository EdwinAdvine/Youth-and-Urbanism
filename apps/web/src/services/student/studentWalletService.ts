/**
 * Student Wallet & Payment Service
 */
import apiClient from '../api';

const API_PREFIX = '/api/v1/student/wallet';

/**
 * Get wallet balance
 */
export const getWalletBalance = async () => {
  const response = await apiClient.get(`${API_PREFIX}/balance`);
  return response.data;
};

/**
 * Get transaction history
 */
export const getTransactionHistory = async (limit: number = 20, offset: number = 0) => {
  const response = await apiClient.get(`${API_PREFIX}/transactions`, {
    params: { limit, offset },
  });
  return response.data;
};

/**
 * Initiate Paystack payment
 */
export const initiatePaystackPayment = async (amount: number, metadata?: unknown) => {
  const response = await apiClient.post(`${API_PREFIX}/topup/paystack`, { amount, metadata });
  return response.data;
};

/**
 * Verify Paystack payment
 */
export const verifyPaystackPayment = async (reference: string) => {
  const response = await apiClient.get(`${API_PREFIX}/payment/verify/${reference}`);
  return response.data;
};

/**
 * Get payment methods
 */
export const getPaymentMethods = async () => {
  const response = await apiClient.get(`${API_PREFIX}/payment-methods`);
  return response.data;
};

/**
 * Save payment method
 */
export const savePaymentMethod = async (data: {
  authorization_code: string;
  card_type: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  bank?: string;
}) => {
  const response = await apiClient.post(`${API_PREFIX}/payment-methods`, data);
  return response.data;
};

/**
 * Get subscription info
 */
export const getSubscriptionInfo = async () => {
  const response = await apiClient.get(`${API_PREFIX}/subscription`);
  return response.data;
};

/**
 * Get AI fund advisor
 */
export const getAIFundAdvisor = async () => {
  const response = await apiClient.get(`${API_PREFIX}/ai-advisor`);
  return response.data;
};
