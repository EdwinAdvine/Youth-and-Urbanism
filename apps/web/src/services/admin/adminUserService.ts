/**
 * Admin User Management API Service - Phase 3 (People & Access)
 *
 * Provides typed API calls for the admin user management endpoints.
 */

import apiClient from '../api';

const BASE = `/api/v1/admin/users`;

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'parent' | 'instructor' | 'admin' | 'partner' | 'staff';
  is_active: boolean;
  is_deleted: boolean;
  is_verified: boolean;
  profile_data: Record<string, unknown>;
  created_at: string | null;
  updated_at: string | null;
  last_login: string | null;
}

export interface UserListResponse {
  items: AdminUser[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface UserDetail extends AdminUser {}

export interface UserActivity {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown>;
  ip_address: string;
  status: string;
  created_at: string | null;
}

export interface BulkActionResult {
  success: boolean;
  action: string;
  affected: number;
  total_requested: number;
}

export interface UserListParams {
  page?: number;
  page_size?: number;
  search?: string;
  role?: string;
  status?: string;
  sort_by?: string;
  sort_dir?: string;
}

// ------------------------------------------------------------------
// API calls
// ------------------------------------------------------------------

const adminUserService = {
  /** Paginated, filterable user list */
  listUsers: async (params: UserListParams = {}): Promise<UserListResponse> => {
    const r = await apiClient.get(`${BASE}/`, { params });
    return r.data.data ?? r.data;
  },

  /** Full user detail */
  getUserDetail: async (userId: string): Promise<UserDetail> => {
    const r = await apiClient.get(`${BASE}/${userId}`);
    return r.data.data ?? r.data;
  },

  /** Deactivate a user */
  deactivateUser: async (userId: string): Promise<AdminUser> => {
    const r = await apiClient.put(`${BASE}/${userId}/deactivate`);
    return r.data.data ?? r.data;
  },

  /** Reactivate a user */
  reactivateUser: async (userId: string): Promise<AdminUser> => {
    const r = await apiClient.put(`${BASE}/${userId}/reactivate`);
    return r.data.data ?? r.data;
  },

  /** Update user role */
  updateUserRole: async (userId: string, role: string): Promise<AdminUser> => {
    const r = await apiClient.put(`${BASE}/${userId}/role`, { role });
    return r.data.data ?? r.data;
  },

  /** User activity timeline */
  getUserActivity: async (userId: string, limit = 50): Promise<UserActivity[]> => {
    const r = await apiClient.get(`${BASE}/${userId}/activity`, { params: { limit } });
    return r.data.data ?? r.data;
  },

  /** Bulk action (deactivate / reactivate) */
  bulkAction: async (userIds: string[], action: string): Promise<BulkActionResult> => {
    const r = await apiClient.post(`${BASE}/bulk`, { user_ids: userIds, action });
    return r.data.data ?? r.data;
  },

  /** Export users as CSV - returns blob URL */
  exportUsers: async (params: {
    role?: string;
    status?: string;
    search?: string;
  } = {}): Promise<string> => {
    const r = await apiClient.get(`${BASE}/export`, {
      params,
      responseType: 'blob',
    });
    const blob = new Blob([r.data]);
    return URL.createObjectURL(blob);
  },
};

export default adminUserService;
