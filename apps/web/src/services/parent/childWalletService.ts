/**
 * Child Wallet Service
 *
 * API client for parent-child wallet operations.
 */

import apiClient from '../api';

export interface ChildWalletBalance {
  balance: number;
  currency: string;
  total_credited: number;
  total_debited: number;
}

export interface ApprovalSettings {
  mode: 'realtime' | 'spending_limit';
  daily_limit: number | null;
  monthly_limit: number | null;
  per_purchase_limit: number | null;
}

export interface PurchaseRequest {
  id: string;
  child_id: string;
  purchase_type: string;
  item_name: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  expires_at: string;
}

class ChildWalletService {
  async topUpChildWallet(childId: string, amount: number) {
    const response = await apiClient.post(
      `/api/v1/parent/children/${childId}/wallet/top-up`,
      { amount },
    );
    return response.data.data;
  }

  async getChildWalletBalance(childId: string): Promise<ChildWalletBalance> {
    const response = await apiClient.get(
      `/api/v1/parent/children/${childId}/wallet/balance`,
    );
    return response.data.data;
  }

  async getApprovalSettings(childId: string): Promise<ApprovalSettings> {
    const response = await apiClient.get(
      `/api/v1/parent/children/${childId}/wallet/approval-settings`,
    );
    return response.data.data;
  }

  async updateApprovalSettings(childId: string, settings: ApprovalSettings) {
    const response = await apiClient.put(
      `/api/v1/parent/children/${childId}/wallet/approval-settings`,
      settings,
    );
    return response.data.data;
  }

  async getPendingApprovals(): Promise<PurchaseRequest[]> {
    const response = await apiClient.get('/api/v1/parent/purchase-requests');
    return response.data.data;
  }

  async approvePurchase(requestId: string) {
    const response = await apiClient.post(
      `/api/v1/parent/purchase-requests/${requestId}/approve`,
    );
    return response.data.data;
  }

  async rejectPurchase(requestId: string, reason?: string) {
    const response = await apiClient.post(
      `/api/v1/parent/purchase-requests/${requestId}/reject`,
      { reason },
    );
    return response.data.data;
  }
}

export default new ChildWalletService();
