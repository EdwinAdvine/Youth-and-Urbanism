export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  parent_id: string | null;
  display_order: number;
  is_active: boolean;
  course_count: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[];
}

export interface CategoryListResponse {
  categories: Category[];
  total: number;
}

export interface CategoryTreeResponse {
  categories: CategoryWithChildren[];
}
