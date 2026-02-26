/**
 * Parent Finance Service
 *
 * API service for parent finance endpoints:
 * subscriptions, payment history, add-ons, and M-Pesa.
 */

import api from './api';

// ============================================================================
// SUBSCRIPTION
// ============================================================================

export const getCurrentSubscription = () =>
  api.get('/api/v1/parent/finance/subscription').then((r) => r.data);

export const getAvailablePlans = () =>
  api.get('/api/v1/parent/finance/plans').then((r) => r.data);

export const changeSubscription = (data: {
  new_plan_id: string;
  billing_cycle: string;
}) => api.post('/api/v1/parent/finance/subscription/change', data).then((r) => r.data);

export const pauseSubscription = (data: {
  reason: string;
  resume_date?: string;
}) => api.post('/api/v1/parent/finance/subscription/pause', data).then((r) => r.data);

export const resumeSubscription = () =>
  api.post('/api/v1/parent/finance/subscription/resume').then((r) => r.data);

// ============================================================================
// PAYMENT HISTORY
// ============================================================================

export const getPaymentHistory = () =>
  api.get('/api/v1/parent/finance/history').then((r) => r.data);

// ============================================================================
// ADD-ONS
// ============================================================================

export const getAvailableAddons = () =>
  api.get('/api/v1/parent/finance/addons').then((r) => r.data);

export const purchaseAddon = (data: {
  addon_id: string;
  payment_method: string;
  phone_number?: string;
}) => api.post('/api/v1/parent/finance/addons/purchase', data).then((r) => r.data);

// ============================================================================
// M-PESA
// ============================================================================

export const initiateMpesaPayment = (data: {
  phone_number: string;
  amount: number;
  account_reference: string;
  transaction_desc: string;
}) => api.post('/api/v1/parent/mpesa/stk-push', data).then((r) => r.data);

export const checkMpesaStatus = (checkoutId: string) =>
  api.get(`/api/v1/parent/mpesa/status/${checkoutId}`).then((r) => r.data);

export default {
  getCurrentSubscription,
  getAvailablePlans,
  changeSubscription,
  pauseSubscription,
  resumeSubscription,
  getPaymentHistory,
  getAvailableAddons,
  purchaseAddon,
  initiateMpesaPayment,
  checkMpesaStatus,
};
