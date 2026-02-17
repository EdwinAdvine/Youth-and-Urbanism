/**
 * Instructor Course Service
 *
 * API calls to /api/v1/instructor/courses endpoints.
 */
import apiClient from '../api';

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  grade_levels: string[];
  learning_area?: string;
  enrolled_count: number;
  rating?: number;
  total_revenue?: number;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface CourseFormData {
  title: string;
  description: string;
  short_description: string;
  thumbnail_url: string;
  grade_levels: string[];
  learning_area: string;
  language: string;
  difficulty_level: string;
  price: number;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
}

export async function getCourses(params?: {
  status?: string;
  sort_by?: string;
}): Promise<Course[]> {
  const { data } = await apiClient.get<Course[]>(
    '/api/v1/instructor/courses',
    { params },
  );
  return data;
}

export async function getCourse(courseId: string): Promise<CourseFormData> {
  const { data } = await apiClient.get<CourseFormData>(
    `/api/v1/instructor/courses/${courseId}`,
  );
  return data;
}

export async function createCourse(data: CourseFormData): Promise<Course> {
  const { data: result } = await apiClient.post<Course>(
    '/api/v1/instructor/courses',
    data,
  );
  return result;
}

export async function updateCourse(courseId: string, data: CourseFormData): Promise<Course> {
  const { data: result } = await apiClient.put<Course>(
    `/api/v1/instructor/courses/${courseId}`,
    data,
  );
  return result;
}

export async function deleteCourse(courseId: string): Promise<void> {
  await apiClient.delete(`/api/v1/instructor/courses/${courseId}`);
}

export async function generateCourseSuggestions(data: {
  title: string;
  learning_area: string;
  grade_levels: string[];
  current_description?: string;
}): Promise<{ description?: string; short_description?: string; tags?: string[] }> {
  const { data: result } = await apiClient.post<{
    description?: string;
    short_description?: string;
    tags?: string[];
  }>('/api/v1/instructor/insights/course-suggestions', data);
  return result;
}
