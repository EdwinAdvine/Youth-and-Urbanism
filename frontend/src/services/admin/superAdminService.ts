/**
 * Super Admin Service
 *
 * API client for super-admin-only endpoints:
 * - Financial access management (grant/revoke permissions)
 * - Revenue split configuration
 */

import apiClient from '../api';

export interface FinancialAccessUser {
  id: string;
  email: string;
  role: string;
  full_name: string;
  is_super_admin: boolean;
  granted_permissions: string[];
}

export interface RevenueSplit {
  instructor_pct: number;
  platform_pct: number;
  partner_pct: number;
}

export const FINANCIAL_PERMISSIONS = [
  { key: 'finance.transactions.read', label: 'View Transactions' },
  { key: 'finance.transactions.manage', label: 'Manage Transactions & Refunds' },
  { key: 'finance.wallets.read', label: 'View Wallets' },
  { key: 'finance.wallets.manage', label: 'Manage Wallets' },
  { key: 'finance.payouts.read', label: 'View Payouts' },
  { key: 'finance.payouts.approve', label: 'Approve Payouts' },
  { key: 'finance.reports.read', label: 'View Reports & Invoices' },
  { key: 'finance.settings.manage', label: 'Manage Financial Settings' },
  { key: 'finance.withdrawals.approve', label: 'Approve Withdrawals' },
] as const;

class SuperAdminService {
  async listFinancialAccess(): Promise<FinancialAccessUser[]> {
    const response = await apiClient.get('/api/v1/admin/super-admin/financial-access');
    return response.data.data;
  }

  async grantFinancialAccess(
    userId: string,
    permissionNames: string[],
    reason?: string,
  ): Promise<{ user_id: string; granted_permissions: string[] }> {
    const response = await apiClient.post(
      `/api/v1/admin/super-admin/financial-access/${userId}`,
      { permission_names: permissionNames, reason },
    );
    return response.data.data;
  }

  async revokeFinancialAccess(
    userId: string,
    permissionName: string,
  ): Promise<{ user_id: string; revoked_permission: string }> {
    const response = await apiClient.delete(
      `/api/v1/admin/super-admin/financial-access/${userId}/${permissionName}`,
    );
    return response.data.data;
  }

  async getRevenueSplit(): Promise<RevenueSplit> {
    const response = await apiClient.get('/api/v1/admin/super-admin/revenue-split');
    return response.data.data;
  }

  async updateRevenueSplit(split: RevenueSplit): Promise<RevenueSplit> {
    const response = await apiClient.put('/api/v1/admin/super-admin/revenue-split', split);
    return response.data.data;
  }
}

export default new SuperAdminService();
