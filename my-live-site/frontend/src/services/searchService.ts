import apiClient from './api';

interface SearchResult {
  type: string;
  title: string;
  description: string;
  url: string;
  score: number;
  metadata: Record<string, unknown>;
}

interface SearchResponse {
  query: string;
  total: number;
  results: SearchResult[];
  categories: Record<string, number>;
}

export const searchService = {
  async search(query: string, types?: string[], limit = 20): Promise<SearchResponse> {
    const params: Record<string, string | number> = { q: query, limit };
    if (types && types.length > 0) {
      params.types = types.join(',');
    }
    const response = await apiClient.get<SearchResponse>(`/api/v1/search`, { params });
    return response.data;
  },
};

export type { SearchResult, SearchResponse };
