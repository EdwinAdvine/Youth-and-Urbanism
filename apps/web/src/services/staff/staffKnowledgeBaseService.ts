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
import apiClient from '../api';

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
  const { data } = await apiClient.get<{ status: string; data: PaginatedResponse<KBArticle> }>(
    '/api/v1/staff/kb/articles',
    { params },
  );
  return data.data;
}

/** Fetch a single KB article by ID. */
export async function getArticle(articleId: string): Promise<KBArticle> {
  const { data } = await apiClient.get<{ status: string; data: KBArticle }>(
    `/api/v1/staff/kb/articles/${articleId}`,
  );
  return data.data;
}

/** Create a new KB article. */
export async function createArticle(
  payload: CreateArticlePayload,
): Promise<KBArticle> {
  const { data } = await apiClient.post<{ status: string; data: KBArticle }>(
    '/api/v1/staff/kb/articles',
    payload,
  );
  return data.data;
}

/** Update an existing KB article. */
export async function updateArticle(
  articleId: string,
  payload: UpdateArticlePayload,
): Promise<KBArticle> {
  const { data } = await apiClient.patch<{ status: string; data: KBArticle }>(
    `/api/v1/staff/kb/articles/${articleId}`,
    payload,
  );
  return data.data;
}

/** Delete a KB article. */
export async function deleteArticle(articleId: string): Promise<void> {
  await apiClient.delete(`/api/v1/staff/kb/articles/${articleId}`);
}

/** Fetch all KB categories. */
export async function getCategories(): Promise<KBCategory[]> {
  const { data } = await apiClient.get<{ status: string; data: KBCategory[] }>(
    '/api/v1/staff/kb/categories',
  );
  return data.data;
}

/** Create a new KB category. */
export async function createCategory(
  payload: CreateCategoryPayload,
): Promise<KBCategory> {
  const { data } = await apiClient.post<{ status: string; data: KBCategory }>(
    '/api/v1/staff/kb/categories',
    payload,
  );
  return data.data;
}

/** Search the knowledge base using a text query. */
export async function searchKB(
  query: string,
  limit?: number,
): Promise<KBSearchResult[]> {
  const { data } = await apiClient.post<{ status: string; data: KBSearchResult[] }>(
    '/api/v1/staff/kb/search',
    {
      query,
      ...(limit != null ? { limit } : {}),
    },
  );
  return data.data;
}

/** Get AI-suggested KB articles relevant to a support ticket. */
export async function getAISuggestions(
  ticketId: string,
  ticketText: string,
): Promise<KBSearchResult[]> {
  const { data } = await apiClient.post<{ status: string; data: KBSearchResult[] }>(
    '/api/v1/staff/kb/suggestions',
    {
      ticket_id: ticketId,
      ticket_text: ticketText,
    },
  );
  return data.data;
}
