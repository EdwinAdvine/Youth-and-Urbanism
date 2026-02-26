import apiClient from './api';
import { Category, CategoryListResponse, CategoryTreeResponse } from '../types/category';

class CategoryService {
  async listCategories(): Promise<CategoryListResponse> {
    const response = await apiClient.get<CategoryListResponse>('/api/v1/categories');
    return response.data;
  }

  async getCategoryTree(): Promise<CategoryTreeResponse> {
    const response = await apiClient.get<CategoryTreeResponse>('/api/v1/categories/tree');
    return response.data;
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    const response = await apiClient.get<Category>(`/api/v1/categories/${slug}`);
    return response.data;
  }
}

export default new CategoryService();
