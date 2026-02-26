import apiClient from '../api';

export interface StaffAccountRequest {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  department?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  rejection_reason?: string;
}

export interface CreateStaffAccountData {
  email: string;
  full_name: string;
  phone?: string;
  department?: string;
}

const staffAccountService = {
  create: (data: CreateStaffAccountData) =>
    apiClient.post('/admin/staff-accounts', data),

  list: (statusFilter?: string) =>
    apiClient.get<StaffAccountRequest[]>('/admin/staff-accounts', {
      params: statusFilter ? { status_filter: statusFilter } : {},
    }),

  approve: (requestId: string) =>
    apiClient.put(`/admin/staff-accounts/${requestId}/approve`),

  reject: (requestId: string, reason?: string) =>
    apiClient.put(`/admin/staff-accounts/${requestId}/reject`, { rejection_reason: reason }),
};

export default staffAccountService;
