/**
 * Withdrawal Service
 *
 * API client for withdrawal request operations.
 */

import apiClient from './api';

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  payout_method: string;
  payout_details: Record<string, any>;
  status: string;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  transaction_reference?: string;
  processed_at?: string;
  failure_reason?: string;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_name?: string;
  user_role?: string;
}

export interface WithdrawalListResponse {
  items: WithdrawalRequest[];
  total: number;
  page: number;
  page_size: number;
}

class WithdrawalService {
  async createRequest(data: {
    amount: number;
    currency?: string;
    payout_method: string;
    payout_details: Record<string, any>;
  }) {
    const response = await apiClient.post('/api/v1/withdrawals/request', data);
    return response.data.data;
  }

  async getMyRequests(page = 1, pageSize = 20): Promise<WithdrawalListResponse> {
    const response = await apiClient.get('/api/v1/withdrawals/my-requests', {
      params: { page, page_size: pageSize },
    });
    return response.data.data;
  }

  async getWithdrawalQueue(
    page = 1,
    pageSize = 20,
    status?: string,
  ): Promise<WithdrawalListResponse> {
    const response = await apiClient.get('/api/v1/admin/withdrawals/queue', {
      params: { page, page_size: pageSize, status },
    });
    return response.data.data;
  }

  async approveWithdrawal(requestId: string) {
    const response = await apiClient.post(`/api/v1/admin/withdrawals/${requestId}/approve`);
    return response.data.data;
  }

  async rejectWithdrawal(requestId: string, reason: string) {
    const response = await apiClient.post(`/api/v1/admin/withdrawals/${requestId}/reject`, {
      reason,
    });
    return response.data.data;
  }
}

export default new WithdrawalService();
