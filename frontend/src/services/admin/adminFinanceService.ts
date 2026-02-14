/**
 * Admin Finance & Partnerships Service - Phase 7
 *
 * Provides typed API calls for transactions, refund queue,
 * payout management, partner listing, invoices, and subscription plans.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const BASE = `${API_URL}/api/v1/admin`;

function getAuthHeaders(): Record<string, string> {
  let jwt = '';
  const stored = localStorage.getItem('auth-store');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      jwt = parsed?.state?.token || parsed?.token || '';
    } catch {
      jwt = stored;
    }
  }
  return {
    Authorization: `Bearer ${jwt}`,
    'Content-Type': 'application/json',
  };
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: getAuthHeaders(),
    ...options,
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  const json = await response.json();
  return json.data ?? json;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '' && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return qs ? `?${qs}` : '';
}

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
  listTransactions: (params: TransactionListParams = {}): Promise<TransactionListResponse> =>
    fetchJson<TransactionListResponse>(
      `${BASE}/finance/transactions${buildQuery({
        page: params.page,
        page_size: params.page_size,
        status: params.status,
        payment_method: params.payment_method,
        search: params.search,
      })}`,
    ),

  getRefundQueue: (status?: string): Promise<{ items: RefundRequest[]; total: number }> => {
    let url = `${BASE}/finance/refunds`;
    if (status) url += `?status=${status}`;
    return fetchJson(url);
  },

  processRefund: (refundId: string, decision: 'approved' | 'rejected'): Promise<{ success: boolean }> =>
    fetchJson(`${BASE}/finance/refunds/${refundId}`, {
      method: 'PUT',
      body: JSON.stringify({ decision }),
    }),

  getPayoutQueue: (status?: string): Promise<{ items: PayoutItem[]; total: number }> => {
    let url = `${BASE}/finance/payouts`;
    if (status) url += `?status=${status}`;
    return fetchJson(url);
  },

  listPartners: (
    page = 1,
    pageSize = 20,
    typeFilter?: string,
  ): Promise<PartnerListResponse> => {
    const params: Record<string, string | number | undefined> = {
      page,
      page_size: pageSize,
    };
    if (typeFilter) params.type = typeFilter;
    return fetchJson<PartnerListResponse>(
      `${BASE}/finance/partners${buildQuery(params)}`,
    );
  },

  listInvoices: (
    page = 1,
    pageSize = 20,
    status?: string,
  ): Promise<InvoiceListResponse> => {
    const params: Record<string, string | number | undefined> = {
      page,
      page_size: pageSize,
    };
    if (status) params.status = status;
    return fetchJson<InvoiceListResponse>(
      `${BASE}/finance/invoices${buildQuery(params)}`,
    );
  },

  getSubscriptionPlans: (): Promise<{ items: SubscriptionPlan[]; total: number }> =>
    fetchJson(`${BASE}/finance/plans`),
};

export default adminFinanceService;
