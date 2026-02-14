/**
 * Admin User Management API Service - Phase 3 (People & Access)
 *
 * Provides typed API calls for the admin user management endpoints.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const BASE = `${API_URL}/api/v1/admin/users`;

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

function buildQuery(params: Record<string, string | number | undefined>): string {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '' && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return qs ? `?${qs}` : '';
}

const adminUserService = {
  /** Paginated, filterable user list */
  listUsers: (params: UserListParams = {}): Promise<UserListResponse> =>
    fetchJson<UserListResponse>(
      `${BASE}/${buildQuery({
        page: params.page,
        page_size: params.page_size,
        search: params.search,
        role: params.role,
        status: params.status,
        sort_by: params.sort_by,
        sort_dir: params.sort_dir,
      })}`,
    ),

  /** Full user detail */
  getUserDetail: (userId: string): Promise<UserDetail> =>
    fetchJson<UserDetail>(`${BASE}/${userId}`),

  /** Deactivate a user */
  deactivateUser: (userId: string): Promise<AdminUser> =>
    fetchJson<AdminUser>(`${BASE}/${userId}/deactivate`, { method: 'PUT' }),

  /** Reactivate a user */
  reactivateUser: (userId: string): Promise<AdminUser> =>
    fetchJson<AdminUser>(`${BASE}/${userId}/reactivate`, { method: 'PUT' }),

  /** Update user role */
  updateUserRole: (userId: string, role: string): Promise<AdminUser> =>
    fetchJson<AdminUser>(`${BASE}/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),

  /** User activity timeline */
  getUserActivity: (userId: string, limit = 50): Promise<UserActivity[]> =>
    fetchJson<UserActivity[]>(`${BASE}/${userId}/activity?limit=${limit}`),

  /** Bulk action (deactivate / reactivate) */
  bulkAction: (userIds: string[], action: string): Promise<BulkActionResult> =>
    fetchJson<BulkActionResult>(`${BASE}/bulk`, {
      method: 'POST',
      body: JSON.stringify({ user_ids: userIds, action }),
    }),

  /** Export users as CSV - returns blob URL */
  exportUsers: async (params: {
    role?: string;
    status?: string;
    search?: string;
  } = {}): Promise<string> => {
    const qs = buildQuery(params);
    const response = await fetch(`${BASE}/export${qs}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  },
};

export default adminUserService;
