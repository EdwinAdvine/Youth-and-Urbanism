/**
 * Staff Support / Tickets Service
 *
 * Wraps API calls to /api/v1/staff/support endpoints for ticket management,
 * messaging, assignment, escalation, and SLA monitoring.
 */

import type {
  PaginatedResponse,
  StaffTicket,
  TicketMessage,
} from '../../types/staff';

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/staff`;

function getAuthHeaders(): HeadersInit {
  const token =
    localStorage.getItem('access_token') ||
    JSON.parse(localStorage.getItem('auth-store') || '{}')?.state?.token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

// ---------------------------------------------------------------------------
// Types local to this service
// ---------------------------------------------------------------------------

export interface TicketListParams {
  page?: number;
  page_size?: number;
  status?: string;
  priority?: string;
  assigned_to?: string;
}

export interface CreateTicketPayload {
  subject: string;
  description: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  tags?: string[];
}

export interface UpdateTicketPayload {
  subject?: string;
  description?: string;
  category?: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  status?: string;
  tags?: string[];
}

export interface AddMessagePayload {
  content: string;
  is_internal?: boolean;
  attachments?: Record<string, unknown>[];
}

export interface SLADashboardStats {
  total_tickets: number;
  within_sla: number;
  at_risk: number;
  breached: number;
  compliance_rate: number;
  avg_first_response_minutes: number;
  avg_resolution_minutes: number;
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

/** Fetch a paginated list of support tickets with optional filters. */
export async function getTickets(
  params: TicketListParams = {},
): Promise<PaginatedResponse<StaffTicket>> {
  const qs = new URLSearchParams();
  if (params.page != null) qs.set('page', String(params.page));
  if (params.page_size != null) qs.set('page_size', String(params.page_size));
  if (params.status) qs.set('status', params.status);
  if (params.priority) qs.set('priority', params.priority);
  if (params.assigned_to) qs.set('assigned_to', params.assigned_to);

  const response = await fetch(`${API_BASE}/support/tickets?${qs.toString()}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<PaginatedResponse<StaffTicket>>(response);
}

/** Fetch a single ticket by ID. */
export async function getTicket(ticketId: string): Promise<StaffTicket> {
  const response = await fetch(`${API_BASE}/support/tickets/${ticketId}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<StaffTicket>(response);
}

/** Create a new support ticket. */
export async function createTicket(data: CreateTicketPayload): Promise<StaffTicket> {
  const response = await fetch(`${API_BASE}/support/tickets`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<StaffTicket>(response);
}

/** Update an existing ticket. */
export async function updateTicket(
  ticketId: string,
  data: UpdateTicketPayload,
): Promise<StaffTicket> {
  const response = await fetch(`${API_BASE}/support/tickets/${ticketId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<StaffTicket>(response);
}

/** Add a message (reply or internal note) to a ticket. */
export async function addMessage(
  ticketId: string,
  data: AddMessagePayload,
): Promise<TicketMessage> {
  const response = await fetch(`${API_BASE}/support/tickets/${ticketId}/messages`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<TicketMessage>(response);
}

/** Assign a ticket to a staff member. */
export async function assignTicket(
  ticketId: string,
  assignedTo: string,
): Promise<void> {
  const response = await fetch(`${API_BASE}/support/tickets/${ticketId}/assign`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ assigned_to: assignedTo }),
  });
  return handleResponse<void>(response);
}

/** Escalate a ticket with a reason. */
export async function escalateTicket(
  ticketId: string,
  reason: string,
): Promise<void> {
  const response = await fetch(`${API_BASE}/support/tickets/${ticketId}/escalate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ reason }),
  });
  return handleResponse<void>(response);
}

/** Fetch SLA compliance dashboard statistics. */
export async function getSLAStatus(): Promise<SLADashboardStats> {
  const response = await fetch(`${API_BASE}/support/sla/status`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<SLADashboardStats>(response);
}
