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
import apiClient from '../api';

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
  const { data } = await apiClient.get<PaginatedResponse<ModerationItem>>(
    '/api/v1/staff/moderation/queue',
    { params },
  );
  return data;
}

/** Fetch a single moderation item by ID. */
export async function getModerationItem(itemId: string): Promise<ModerationItem> {
  const { data } = await apiClient.get<ModerationItem>(
    `/api/v1/staff/moderation/queue/${itemId}`,
  );
  return data;
}

/** Submit a review decision for a moderation item. */
export async function submitReview(
  itemId: string,
  decision: ReviewDecisionPayload,
): Promise<void> {
  await apiClient.post(`/api/v1/staff/moderation/queue/${itemId}/review`, decision);
}

/** Perform a bulk moderation action on multiple items. */
export async function bulkModerate(
  action: BulkModerationPayload,
): Promise<BulkActionResult> {
  const { data } = await apiClient.post<BulkActionResult>(
    '/api/v1/staff/moderation/queue/bulk',
    action,
  );
  return data;
}

/** Get CBC alignment analysis for a specific piece of content. */
export async function getCBCAlignment(contentId: string): Promise<CBCAlignmentResult> {
  const { data } = await apiClient.get<CBCAlignmentResult>(
    `/api/v1/staff/moderation/cbc-alignment/${contentId}`,
  );
  return data;
}

/** Fetch paginated safety flags raised by the AI moderation pipeline. */
export async function getSafetyFlags(
  params: SafetyFlagParams = {},
): Promise<PaginatedResponse<SafetyFlag>> {
  const { data } = await apiClient.get<PaginatedResponse<SafetyFlag>>(
    '/api/v1/staff/moderation/safety-flags',
    { params },
  );
  return data;
}
