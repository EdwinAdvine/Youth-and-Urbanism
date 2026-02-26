/**
 * Admin Operations & Control Service - Phase 8
 *
 * Provides typed API calls for support tickets, content moderation,
 * system configuration, and audit log search.
 */

import apiClient from '../api';

const BASE = `/api/v1/admin`;

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
  listTickets: async (params: TicketListParams = {}): Promise<TicketListResponse> => {
    const r = await apiClient.get(`${BASE}/operations/tickets`, { params });
    return r.data.data ?? r.data;
  },

  getTicketDetail: async (ticketId: string): Promise<TicketDetail> => {
    const r = await apiClient.get(`${BASE}/operations/tickets/${ticketId}`);
    return r.data.data ?? r.data;
  },

  updateTicket: async (
    ticketId: string,
    data: { status?: string; priority?: string; assigned_to?: string },
  ): Promise<{ success: boolean }> => {
    const r = await apiClient.put(`${BASE}/operations/tickets/${ticketId}`, data);
    return r.data.data ?? r.data;
  },

  // Moderation
  listModerationQueue: async (params: {
    page?: number;
    page_size?: number;
    severity?: string;
    content_type?: string;
  } = {}): Promise<ModerationQueueResponse> => {
    const r = await apiClient.get(`${BASE}/operations/moderation`, { params });
    return r.data.data ?? r.data;
  },

  moderateItem: async (
    itemId: string,
    decision: 'approved' | 'removed' | 'escalated',
    reason?: string,
  ): Promise<{ success: boolean }> => {
    const r = await apiClient.put(`${BASE}/operations/moderation/${itemId}`, { decision, reason });
    return r.data.data ?? r.data;
  },

  // System Config
  listSystemConfigs: async (category?: string): Promise<SystemConfigListResponse> => {
    const params = category ? { category } : undefined;
    const r = await apiClient.get(`${BASE}/operations/config`, { params });
    return r.data.data ?? r.data;
  },

  // Audit Logs
  searchAuditLogs: async (params: AuditLogParams = {}): Promise<AuditLogListResponse> => {
    const r = await apiClient.get(`${BASE}/operations/audit-logs`, { params });
    return r.data.data ?? r.data;
  },

  exportAuditLogs: async (params: {
    date_from?: string;
    date_to?: string;
    resource_type?: string;
  } = {}): Promise<string> => {
    const r = await apiClient.get(`${BASE}/operations/audit-logs/export`, {
      params,
      responseType: 'blob',
    });
    const blob = new Blob([r.data]);
    return URL.createObjectURL(blob);
  },
};

export default adminOperationsService;
