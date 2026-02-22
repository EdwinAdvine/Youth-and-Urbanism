/**
 * Staff Content Studio Service
 *
 * Wraps API calls to /api/v1/staff/content endpoints for managing educational
 * content items, version history, publishing workflows, and real-time
 * collaborative editing sessions.
 */

import type {
  PaginatedResponse,
  ContentItem,
  ContentVersion,
  CollabSession,
} from '../../types/staff';
import apiClient from '../api';

// ---------------------------------------------------------------------------
// Types local to this service
// ---------------------------------------------------------------------------

export interface ContentListParams {
  page?: number;
  page_size?: number;
  status?: string;
  content_type?: string;
}

export interface CreateContentPayload {
  title: string;
  content_type: 'lesson' | 'quiz' | 'worksheet' | 'activity' | 'resource';
  body?: string;
  body_json?: Record<string, unknown>;
  course_id?: string;
  grade_levels?: string[];
  learning_area?: string;
  cbc_tags?: { strand: string; sub_strand: string; competency: string }[];
}

export interface UpdateContentPayload {
  title?: string;
  body?: string;
  body_json?: Record<string, unknown>;
  status?: string;
  grade_levels?: string[];
  learning_area?: string;
  cbc_tags?: { strand: string; sub_strand: string; competency: string }[];
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

/** Fetch a paginated list of content items with optional filters. */
export async function getContentItems(
  params: ContentListParams = {},
): Promise<PaginatedResponse<ContentItem>> {
  const { data } = await apiClient.get<{ status: string; data: PaginatedResponse<ContentItem> }>(
    '/api/v1/staff/content/items',
    { params },
  );
  return data.data;
}

/** Fetch a single content item by ID. */
export async function getContentItem(contentId: string): Promise<ContentItem> {
  const { data } = await apiClient.get<{ status: string; data: ContentItem }>(
    `/api/v1/staff/content/items/${contentId}`,
  );
  return data.data;
}

/** Create a new content item. */
export async function createContent(
  payload: CreateContentPayload,
): Promise<ContentItem> {
  const { data } = await apiClient.post<{ status: string; data: ContentItem }>(
    '/api/v1/staff/content/items',
    payload,
  );
  return data.data;
}

/** Update an existing content item. */
export async function updateContent(
  contentId: string,
  payload: UpdateContentPayload,
): Promise<ContentItem> {
  const { data } = await apiClient.patch<{ status: string; data: ContentItem }>(
    `/api/v1/staff/content/items/${contentId}`,
    payload,
  );
  return data.data;
}

/** Publish a content item (transitions status to published). */
export async function publishContent(contentId: string): Promise<void> {
  await apiClient.post(`/api/v1/staff/content/items/${contentId}/publish`);
}

/** Fetch the version history for a content item. */
export async function getVersionHistory(
  contentId: string,
): Promise<ContentVersion[]> {
  const { data } = await apiClient.get<{ status: string; data: ContentVersion[] }>(
    `/api/v1/staff/content/items/${contentId}/versions`,
  );
  return data.data;
}

/** Rollback a content item to a specific version number. */
export async function rollbackVersion(
  contentId: string,
  versionNumber: number,
): Promise<void> {
  await apiClient.post(
    `/api/v1/staff/content/items/${contentId}/rollback/${versionNumber}`,
  );
}

/** Start a real-time collaborative editing session for a content item. */
export async function startCollabSession(
  contentId: string,
): Promise<CollabSession> {
  const { data } = await apiClient.post<{ status: string; data: CollabSession }>(
    `/api/v1/staff/content/collab/start/${contentId}`,
  );
  return data.data;
}
