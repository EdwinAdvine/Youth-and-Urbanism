/**
 * Admin Finance & Partnerships Service - Phase 7
 *
 * Provides typed API calls for transactions, refund queue,
 * payout management, partner listing, invoices, and subscription plans.
 */

import apiClient from '../api';

const BASE = `/api/v1/admin`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Transaction {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  amount: number;
  currency: string;
  gateway: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  transaction_reference: string | null;
  payment_method?: string;
  description?: string;
  created_at: string | null;
  updated_at?: string | null;
}

export interface TransactionListResponse {
  items: Transaction[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface RefundRequest {
  id: string;
  transaction_id: string;
  user_name: string;
  user_email: string;
  amount: number;
  currency: string;
  gateway: string;
  reason: string;
  original_date: string;
  requested_at: string;
  status: string;
  priority: string;
}

export interface PayoutItem {
  id: string;
  recipient_name: string;
  recipient_type: 'instructor' | 'partner';
  amount: number;
  currency: string;
  gateway: string;
  description: string;
  status: string;
  requested_at: string;
}

export interface Partner {
  id: string;
  name: string;
  type: 'content' | 'business';
  contact_email: string;
  contact_phone: string;
  status: 'active' | 'pending' | 'expired';
  revenue_share_percent: number;
  students_referred: number;
  revenue_generated: number;
  api_usage: number;
  contract_start: string;
  contract_end: string;
  description: string;
}

export interface PartnerListResponse {
  items: Partner[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  recipient_name: string;
  recipient_email: string;
  type: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'overdue' | 'draft' | 'cancelled';
  issued_date: string;
  due_date: string;
  paid_date: string | null;
  description: string;
}

export interface InvoiceListResponse {
  items: Invoice[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  billing_cycle: string;
  features: string[];
  active_subscribers: number;
  is_active: boolean;
}

export interface TransactionListParams {
  page?: number;
  page_size?: number;
  status?: string;
  payment_method?: string;
  search?: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

const adminFinanceService = {
  listTransactions: async (params: TransactionListParams = {}): Promise<TransactionListResponse> => {
    const r = await apiClient.get(`${BASE}/finance/transactions`, { params });
    return r.data.data ?? r.data;
  },

  getRefundQueue: async (status?: string): Promise<{ items: RefundRequest[]; total: number }> => {
    const params = status ? { status } : undefined;
    const r = await apiClient.get(`${BASE}/finance/refunds`, { params });
    return r.data.data ?? r.data;
  },

  processRefund: async (refundId: string, decision: 'approved' | 'rejected'): Promise<{ success: boolean }> => {
    const r = await apiClient.put(`${BASE}/finance/refunds/${refundId}`, { decision });
    return r.data.data ?? r.data;
  },

  getPayoutQueue: async (status?: string): Promise<{ items: PayoutItem[]; total: number }> => {
    const params = status ? { status } : undefined;
    const r = await apiClient.get(`${BASE}/finance/payouts`, { params });
    return r.data.data ?? r.data;
  },

  listPartners: async (
    page = 1,
    pageSize = 20,
    typeFilter?: string,
  ): Promise<PartnerListResponse> => {
    const params: Record<string, string | number> = { page, page_size: pageSize };
    if (typeFilter) params.type = typeFilter;
    const r = await apiClient.get(`${BASE}/finance/partners`, { params });
    return r.data.data ?? r.data;
  },

  listInvoices: async (
    page = 1,
    pageSize = 20,
    status?: string,
  ): Promise<InvoiceListResponse> => {
    const params: Record<string, string | number> = { page, page_size: pageSize };
    if (status) params.status = status;
    const r = await apiClient.get(`${BASE}/finance/invoices`, { params });
    return r.data.data ?? r.data;
  },

  getSubscriptionPlans: async (): Promise<{ items: SubscriptionPlan[]; total: number }> => {
    const r = await apiClient.get(`${BASE}/finance/plans`);
    return r.data.data ?? r.data;
  },
};

export default adminFinanceService;
