import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

const getAuthHeaders = () => {
  const stored = localStorage.getItem('auth-storage');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const token = parsed?.state?.token;
      if (token) return { Authorization: `Bearer ${token}` };
    } catch {
      // ignore
    }
  }
  return {};
};

export const searchService = {
  async search(query: string, types?: string[], limit = 20): Promise<SearchResponse> {
    const params: Record<string, string | number> = { q: query, limit };
    if (types && types.length > 0) {
      params.types = types.join(',');
    }
    const response = await axios.get<SearchResponse>(`${API_URL}/api/v1/search`, {
      params,
      headers: getAuthHeaders(),
    });
    return response.data;
  },
};

export type { SearchResult, SearchResponse };
