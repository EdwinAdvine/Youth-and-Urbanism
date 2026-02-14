/**
 * Admin Operations & Control Service - Phase 8
 *
 * Provides typed API calls for support tickets, content moderation,
 * system configuration, and audit log search.
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

export interface SupportTicket {
  id: string;
  ticket_number: string;
  subject: string;
  description: string | null;
  category: string | null;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'escalated' | 'resolved' | 'closed';
  reporter_name: string;
  reporter_email: string;
  reporter_role: string;
  assigned_to: string | null;
  sla_deadline: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface TicketListResponse {
  items: SupportTicket[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  summary: {
    open: number;
    in_progress: number;
    escalated: number;
    resolved: number;
    closed: number;
  };
}

export interface TicketDetail extends SupportTicket {
  reporter_id: string | null;
  resolved_at: string | null;
  messages?: {
    id: string;
    sender_name: string;
    sender_role: string;
    content: string;
    created_at: string;
  }[];
}

export interface ModerationItem {
  id: string;
  content_type: string;
  content_preview: string | null;
  content_id: string | null;
  author_id: string | null;
  flag_reason: string;
  flagged_by: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: string;
  created_at: string | null;
}

export interface ModerationQueueResponse {
  items: ModerationItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  severity_counts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface SystemConfig {
  id: string;
  key: string;
  value: unknown;
  description: string;
  category: string;
  is_sensitive: boolean;
  editable: boolean;
  last_modified: string | null;
  modified_by: string | null;
}

export interface SystemConfigListResponse {
  items: SystemConfig[];
  total: number;
  categories: string[];
}

export interface AuditLogEntry {
  id: string;
  actor_id: string | null;
  actor_email: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown>;
  ip_address: string;
  status: string;
  created_at: string;
}

export interface AuditLogListResponse {
  items: AuditLogEntry[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface TicketListParams {
  page?: number;
  page_size?: number;
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
}

export interface AuditLogParams {
  page?: number;
  page_size?: number;
  actor_email?: string;
  action?: string;
  resource_type?: string;
  status?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

const adminOperationsService = {
  // Tickets
  listTickets: (params: TicketListParams = {}): Promise<TicketListResponse> =>
    fetchJson<TicketListResponse>(
      `${BASE}/operations/tickets${buildQuery({
        page: params.page,
        page_size: params.page_size,
        status: params.status,
        priority: params.priority,
        category: params.category,
        search: params.search,
      })}`,
    ),

  getTicketDetail: (ticketId: string): Promise<TicketDetail> =>
    fetchJson<TicketDetail>(`${BASE}/operations/tickets/${ticketId}`),

  updateTicket: (
    ticketId: string,
    data: { status?: string; priority?: string; assigned_to?: string },
  ): Promise<{ success: boolean }> =>
    fetchJson(`${BASE}/operations/tickets/${ticketId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Moderation
  listModerationQueue: (params: {
    page?: number;
    page_size?: number;
    severity?: string;
    content_type?: string;
  } = {}): Promise<ModerationQueueResponse> =>
    fetchJson<ModerationQueueResponse>(
      `${BASE}/operations/moderation${buildQuery({
        page: params.page,
        page_size: params.page_size,
        severity: params.severity,
        content_type: params.content_type,
      })}`,
    ),

  moderateItem: (
    itemId: string,
    decision: 'approved' | 'removed' | 'escalated',
    reason?: string,
  ): Promise<{ success: boolean }> =>
    fetchJson(`${BASE}/operations/moderation/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ decision, reason }),
    }),

  // System Config
  listSystemConfigs: (category?: string): Promise<SystemConfigListResponse> => {
    let url = `${BASE}/operations/config`;
    if (category) url += `?category=${category}`;
    return fetchJson<SystemConfigListResponse>(url);
  },

  // Audit Logs
  searchAuditLogs: (params: AuditLogParams = {}): Promise<AuditLogListResponse> =>
    fetchJson<AuditLogListResponse>(
      `${BASE}/operations/audit-logs${buildQuery({
        page: params.page,
        page_size: params.page_size,
        actor_email: params.actor_email,
        action: params.action,
        resource_type: params.resource_type,
        status: params.status,
        search: params.search,
        date_from: params.date_from,
        date_to: params.date_to,
      })}`,
    ),

  exportAuditLogs: async (params: {
    date_from?: string;
    date_to?: string;
    resource_type?: string;
  } = {}): Promise<string> => {
    const qs = buildQuery(params);
    const response = await fetch(`${BASE}/operations/audit-logs/export${qs}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  },
};

export default adminOperationsService;
