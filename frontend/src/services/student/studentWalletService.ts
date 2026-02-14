/**
 * Student Wallet & Payment Service
 */
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_PREFIX = '/api/v1/student/wallet';

/**
 * Get wallet balance
 */
export const getWalletBalance = async () => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/balance`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

/**
 * Get transaction history
 */
export const getTransactionHistory = async (limit: number = 20, offset: number = 0) => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(
    `${API_BASE}${API_PREFIX}/transactions?limit=${limit}&offset=${offset}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

/**
 * Initiate Paystack payment
 */
export const initiatePaystackPayment = async (amount: number, metadata?: any) => {
  const token = localStorage.getItem('access_token');
  const response = await axios.post(
    `${API_BASE}${API_PREFIX}/topup/paystack`,
    { amount, metadata },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

/**
 * Verify Paystack payment
 */
export const verifyPaystackPayment = async (reference: string) => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/payment/verify/${reference}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

/**
 * Get payment methods
 */
export const getPaymentMethods = async () => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/payment-methods`, {
    headers: { Authorization: `Bearer ${token}` }
  });
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
  const token = localStorage.getItem('access_token');
  const response = await axios.post(`${API_BASE}${API_PREFIX}/payment-methods`,
    data,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

/**
 * Get subscription info
 */
export const getSubscriptionInfo = async () => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/subscription`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

/**
 * Get AI fund advisor
 */
export const getAIFundAdvisor = async () => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/ai-advisor`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
