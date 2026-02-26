/**
 * Partner Wallet Service
 *
 * API client for partner wallet operations.
 */

import apiClient from '../api';

export interface WalletBalance {
  balance: number;
  currency: string;
  total_credited: number;
  total_debited: number;
  total_withdrawn: number;
}

export interface WalletTransaction {
  id: string;
  amount: number;
  currency: string;
  transaction_type: string;
  status: string;
  description: string;
  reference: string;
  created_at: string;
}

class PartnerWalletService {
  async getBalance(): Promise<WalletBalance> {
    const response = await apiClient.get('/api/v1/partner/wallet/balance');
    return response.data.data;
  }

  async getTransactions(limit = 50, offset = 0): Promise<{ items: WalletTransaction[]; total: number }> {
    const response = await apiClient.get('/api/v1/partner/wallet/transactions', {
      params: { limit, offset },
    });
    return response.data.data;
  }

  async topUp(amount: number, paymentMethod = 'paystack') {
    const response = await apiClient.post('/api/v1/partner/wallet/top-up', {
      amount,
      payment_method: paymentMethod,
    });
    return response.data.data;
  }

  async requestWithdrawal(amount: number, payoutMethod: string, payoutDetails: Record<string, string>) {
    const response = await apiClient.post('/api/v1/partner/wallet/withdraw', {
      amount,
      payout_method: payoutMethod,
      payout_details: payoutDetails,
    });
    return response.data.data;
  }
}

export default new PartnerWalletService();
