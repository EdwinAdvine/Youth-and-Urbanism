/**
 * Staff Knowledge Base Service
 *
 * Wraps API calls to /api/v1/staff/kb endpoints for managing internal
 * knowledge base articles, categories, full-text search, and AI-powered
 * article suggestions for support tickets.
 */

import type {
  PaginatedResponse,
  KBArticle,
  KBCategory,
  KBSearchResult,
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

export interface ArticleListParams {
  page?: number;
  page_size?: number;
  category_id?: string;
  status?: string;
}

export interface CreateArticlePayload {
  title: string;
  body: string;
  category_id?: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  is_internal?: boolean;
}

export interface UpdateArticlePayload {
  title?: string;
  body?: string;
  category_id?: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  is_internal?: boolean;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
  parent_id?: string;
  sort_order?: number;
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

/** Fetch a paginated list of KB articles with optional filters. */
export async function getArticles(
  params: ArticleListParams = {},
): Promise<PaginatedResponse<KBArticle>> {
  const qs = new URLSearchParams();
  if (params.page != null) qs.set('page', String(params.page));
  if (params.page_size != null) qs.set('page_size', String(params.page_size));
  if (params.category_id) qs.set('category_id', params.category_id);
  if (params.status) qs.set('status', params.status);

  const response = await fetch(`${API_BASE}/kb/articles?${qs.toString()}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<PaginatedResponse<KBArticle>>(response);
}

/** Fetch a single KB article by ID. */
export async function getArticle(articleId: string): Promise<KBArticle> {
  const response = await fetch(`${API_BASE}/kb/articles/${articleId}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<KBArticle>(response);
}

/** Create a new KB article. */
export async function createArticle(
  data: CreateArticlePayload,
): Promise<KBArticle> {
  const response = await fetch(`${API_BASE}/kb/articles`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<KBArticle>(response);
}

/** Update an existing KB article. */
export async function updateArticle(
  articleId: string,
  data: UpdateArticlePayload,
): Promise<KBArticle> {
  const response = await fetch(`${API_BASE}/kb/articles/${articleId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<KBArticle>(response);
}

/** Delete a KB article. */
export async function deleteArticle(articleId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/kb/articles/${articleId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse<void>(response);
}

/** Fetch all KB categories. */
export async function getCategories(): Promise<KBCategory[]> {
  const response = await fetch(`${API_BASE}/kb/categories`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<KBCategory[]>(response);
}

/** Create a new KB category. */
export async function createCategory(
  data: CreateCategoryPayload,
): Promise<KBCategory> {
  const response = await fetch(`${API_BASE}/kb/categories`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<KBCategory>(response);
}

/** Search the knowledge base using a text query. */
export async function searchKB(
  query: string,
  limit?: number,
): Promise<KBSearchResult[]> {
  const response = await fetch(`${API_BASE}/kb/search`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ query, ...(limit != null ? { limit } : {}) }),
  });
  return handleResponse<KBSearchResult[]>(response);
}

/** Get AI-suggested KB articles relevant to a support ticket. */
export async function getAISuggestions(
  ticketId: string,
  ticketText: string,
): Promise<KBSearchResult[]> {
  const response = await fetch(`${API_BASE}/kb/suggestions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ ticket_id: ticketId, ticket_text: ticketText }),
  });
  return handleResponse<KBSearchResult[]>(response);
}
