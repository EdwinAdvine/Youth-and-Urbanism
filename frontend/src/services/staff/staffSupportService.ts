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
import apiClient from '../api';

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
  const { data } = await apiClient.get<{ status: string; data: PaginatedResponse<StaffTicket> }>(
    '/api/v1/staff/support/tickets',
    { params },
  );
  return data.data;
}

/** Fetch a single ticket by ID. */
export async function getTicket(ticketId: string): Promise<StaffTicket> {
  const { data } = await apiClient.get<{ status: string; data: StaffTicket }>(
    `/api/v1/staff/support/tickets/${ticketId}`,
  );
  return data.data;
}

/** Create a new support ticket. */
export async function createTicket(payload: CreateTicketPayload): Promise<StaffTicket> {
  const { data } = await apiClient.post<{ status: string; data: StaffTicket }>(
    '/api/v1/staff/support/tickets',
    payload,
  );
  return data.data;
}

/** Update an existing ticket. */
export async function updateTicket(
  ticketId: string,
  payload: UpdateTicketPayload,
): Promise<StaffTicket> {
  const { data } = await apiClient.patch<{ status: string; data: StaffTicket }>(
    `/api/v1/staff/support/tickets/${ticketId}`,
    payload,
  );
  return data.data;
}

/** Add a message (reply or internal note) to a ticket. */
export async function addMessage(
  ticketId: string,
  payload: AddMessagePayload,
): Promise<TicketMessage> {
  const { data } = await apiClient.post<{ status: string; data: TicketMessage }>(
    `/api/v1/staff/support/tickets/${ticketId}/messages`,
    payload,
  );
  return data.data;
}

/** Assign a ticket to a staff member. */
export async function assignTicket(
  ticketId: string,
  assignedTo: string,
): Promise<void> {
  await apiClient.post(`/api/v1/staff/support/tickets/${ticketId}/assign`, {
    assigned_to: assignedTo,
  });
}

/** Escalate a ticket with a reason. */
export async function escalateTicket(
  ticketId: string,
  reason: string,
): Promise<void> {
  await apiClient.post(`/api/v1/staff/support/tickets/${ticketId}/escalate`, {
    reason,
  });
}

/** Fetch SLA compliance dashboard statistics. */
export async function getSLAStatus(): Promise<SLADashboardStats> {
  const { data } = await apiClient.get<{ status: string; data: SLADashboardStats }>(
    '/api/v1/staff/support/sla/status',
  );
  return data.data;
}
