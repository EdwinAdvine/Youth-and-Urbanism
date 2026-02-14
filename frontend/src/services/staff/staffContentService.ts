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
  const qs = new URLSearchParams();
  if (params.page != null) qs.set('page', String(params.page));
  if (params.page_size != null) qs.set('page_size', String(params.page_size));
  if (params.status) qs.set('status', params.status);
  if (params.content_type) qs.set('content_type', params.content_type);

  const response = await fetch(`${API_BASE}/content/items?${qs.toString()}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<PaginatedResponse<ContentItem>>(response);
}

/** Fetch a single content item by ID. */
export async function getContentItem(contentId: string): Promise<ContentItem> {
  const response = await fetch(`${API_BASE}/content/items/${contentId}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<ContentItem>(response);
}

/** Create a new content item. */
export async function createContent(
  data: CreateContentPayload,
): Promise<ContentItem> {
  const response = await fetch(`${API_BASE}/content/items`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ContentItem>(response);
}

/** Update an existing content item. */
export async function updateContent(
  contentId: string,
  data: UpdateContentPayload,
): Promise<ContentItem> {
  const response = await fetch(`${API_BASE}/content/items/${contentId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ContentItem>(response);
}

/** Publish a content item (transitions status to published). */
export async function publishContent(contentId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/content/items/${contentId}/publish`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return handleResponse<void>(response);
}

/** Fetch the version history for a content item. */
export async function getVersionHistory(
  contentId: string,
): Promise<ContentVersion[]> {
  const response = await fetch(`${API_BASE}/content/items/${contentId}/versions`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<ContentVersion[]>(response);
}

/** Rollback a content item to a specific version number. */
export async function rollbackVersion(
  contentId: string,
  versionNumber: number,
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/content/items/${contentId}/rollback/${versionNumber}`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
    },
  );
  return handleResponse<void>(response);
}

/** Start a real-time collaborative editing session for a content item. */
export async function startCollabSession(
  contentId: string,
): Promise<CollabSession> {
  const response = await fetch(`${API_BASE}/content/collab/start/${contentId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return handleResponse<CollabSession>(response);
}
