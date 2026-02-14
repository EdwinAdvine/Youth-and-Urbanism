/**
 * Staff Moderation Service
 *
 * Wraps API calls to /api/v1/staff/moderation endpoints for managing the
 * content moderation queue, reviewing items, bulk actions, CBC alignment
 * checks, and safety flag monitoring.
 */

import type {
  PaginatedResponse,
  ModerationItem,
  BulkActionResult,
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

export interface ModerationQueueParams {
  page?: number;
  page_size?: number;
  content_type?: string;
  priority?: string;
  status?: string;
}

export interface ReviewDecisionPayload {
  decision: 'approved' | 'rejected' | 'changes_requested';
  feedback?: string;
}

export interface BulkModerationPayload {
  item_ids: string[];
  decision: 'approved' | 'rejected' | 'changes_requested';
  feedback?: string;
}

export interface CBCAlignmentResult {
  content_id: string;
  learning_area: string;
  grade_level: string;
  total_competencies: number;
  covered_competencies: number;
  coverage_percentage: number;
  gaps: { code: string; name: string; strand: string }[];
}

export interface SafetyFlag {
  id: string;
  content_type: string;
  content_id: string;
  flag_type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  ai_confidence: number;
  status: 'open' | 'reviewed' | 'dismissed';
  created_at: string;
}

export interface SafetyFlagParams {
  page?: number;
  page_size?: number;
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

/** Fetch the paginated moderation queue with optional filters. */
export async function getModerationQueue(
  params: ModerationQueueParams = {},
): Promise<PaginatedResponse<ModerationItem>> {
  const qs = new URLSearchParams();
  if (params.page != null) qs.set('page', String(params.page));
  if (params.page_size != null) qs.set('page_size', String(params.page_size));
  if (params.content_type) qs.set('content_type', params.content_type);
  if (params.priority) qs.set('priority', params.priority);
  if (params.status) qs.set('status', params.status);

  const response = await fetch(`${API_BASE}/moderation/queue?${qs.toString()}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<PaginatedResponse<ModerationItem>>(response);
}

/** Fetch a single moderation item by ID. */
export async function getModerationItem(itemId: string): Promise<ModerationItem> {
  const response = await fetch(`${API_BASE}/moderation/queue/${itemId}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<ModerationItem>(response);
}

/** Submit a review decision for a moderation item. */
export async function submitReview(
  itemId: string,
  decision: ReviewDecisionPayload,
): Promise<void> {
  const response = await fetch(`${API_BASE}/moderation/queue/${itemId}/review`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(decision),
  });
  return handleResponse<void>(response);
}

/** Perform a bulk moderation action on multiple items. */
export async function bulkModerate(
  action: BulkModerationPayload,
): Promise<BulkActionResult> {
  const response = await fetch(`${API_BASE}/moderation/queue/bulk`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(action),
  });
  return handleResponse<BulkActionResult>(response);
}

/** Get CBC alignment analysis for a specific piece of content. */
export async function getCBCAlignment(contentId: string): Promise<CBCAlignmentResult> {
  const response = await fetch(
    `${API_BASE}/moderation/cbc-alignment/${contentId}`,
    { headers: getAuthHeaders() },
  );
  return handleResponse<CBCAlignmentResult>(response);
}

/** Fetch paginated safety flags raised by the AI moderation pipeline. */
export async function getSafetyFlags(
  params: SafetyFlagParams = {},
): Promise<PaginatedResponse<SafetyFlag>> {
  const qs = new URLSearchParams();
  if (params.page != null) qs.set('page', String(params.page));
  if (params.page_size != null) qs.set('page_size', String(params.page_size));

  const response = await fetch(`${API_BASE}/moderation/safety-flags?${qs.toString()}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<PaginatedResponse<SafetyFlag>>(response);
}
