/**
 * Admin Content & Learning Integrity Service - Phase 4
 *
 * Provides typed API calls for course management, CBC alignment,
 * assessment overrides, certificates, and resource library.
 */

import apiClient from '../api';

const BASE = `/api/v1/admin/content`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AdminCourse {
  id: string;
  title: string;
  description: string | null;
  grade_levels: string[];
  learning_area: string;
  status: 'published' | 'draft' | 'pending_review' | 'rejected';
  creator_name: string;
  creator_id: string | null;
  is_platform_created: boolean;
  price: number;
  currency: string;
  rating: number;
  total_reviews: number;
  enrollment_count: number;
  created_at: string | null;
}

export interface CourseListResponse {
  items: AdminCourse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CourseVersion {
  version: string;
  author: string;
  changes: string;
  created_at: string;
  status: string;
}

export interface CBCStrand {
  strand: string;
  short_name: string;
  total_competencies: number;
  mapped_competencies: number;
  coverage_percentage: number;
  sub_strands: { name: string; coverage: number; courses_count: number }[];
  gaps: string[];
}

export interface CBCAlignmentData {
  summary: {
    total_competencies: number;
    mapped_competencies: number;
    coverage_percentage: number;
    total_gaps: number;
    total_strands: number;
  };
  strands: CBCStrand[];
  generated_at: string;
}

export interface GradeOverride {
  id: string;
  student_name: string;
  student_id: string;
  assessment_title: string;
  assessment_type: string;
  course_name: string;
  original_grade: number;
  requested_grade: number;
  reason: string;
  instructor_name: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
}

export interface GradeOverrideListResponse {
  items: GradeOverride[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  stats: {
    total_this_month: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

export interface CertificateEntry {
  id: string;
  serial_number: string;
  student_name: string;
  course_name: string;
  grade: string;
  issued_at: string | null;
  is_valid: boolean;
  revoked_at: string | null;
}

export interface CertificateListResponse {
  items: CertificateEntry[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  stats: {
    total_issued: number;
    valid: number;
    revoked: number;
    pending_issuance: number;
  };
}

export interface ResourceItem {
  id: string;
  title: string;
  type: string;
  category: string;
  file_size: string;
  file_size_bytes: number;
  status: 'approved' | 'pending' | 'flagged';
  usage_count: number;
  uploaded_by: string;
  uploaded_at: string;
  grade_level: string;
  flag_reason?: string;
}

export interface ResourceListResponse {
  items: ResourceItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  stats: {
    total_resources: number;
    approved: number;
    pending: number;
    flagged: number;
  };
}

export interface CourseListParams {
  page?: number;
  page_size?: number;
  status?: string;
  search?: string;
}

export interface ResourceListParams {
  page?: number;
  page_size?: number;
  category?: string;
  status?: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

const adminContentService = {
  listCourses: async (params: CourseListParams = {}): Promise<CourseListResponse> => {
    const r = await apiClient.get(`${BASE}/courses`, { params });
    return r.data.data ?? r.data;
  },

  approveCourse: async (courseId: string): Promise<{ success: boolean; course_id: string }> => {
    const r = await apiClient.put(`${BASE}/courses/${courseId}/approve`);
    return r.data.data ?? r.data;
  },

  rejectCourse: async (courseId: string, reason: string): Promise<{ success: boolean }> => {
    const r = await apiClient.put(`${BASE}/courses/${courseId}/reject`, { reason });
    return r.data.data ?? r.data;
  },

  getCourseVersions: async (courseId: string): Promise<CourseVersion[]> => {
    const r = await apiClient.get(`${BASE}/courses/${courseId}/versions`);
    return r.data.data ?? r.data;
  },

  getCBCAlignment: async (): Promise<CBCAlignmentData> => {
    const r = await apiClient.get(`${BASE}/cbc-alignment`);
    return r.data.data ?? r.data;
  },

  getAssessmentOverrides: async (page = 1, pageSize = 10): Promise<GradeOverrideListResponse> => {
    const r = await apiClient.get(`${BASE}/assessments/overrides`, {
      params: { page, page_size: pageSize },
    });
    return r.data.data ?? r.data;
  },

  getCertificatesLog: async (page = 1, pageSize = 10): Promise<CertificateListResponse> => {
    const r = await apiClient.get(`${BASE}/certificates`, {
      params: { page, page_size: pageSize },
    });
    return r.data.data ?? r.data;
  },

  listResources: async (params: ResourceListParams = {}): Promise<ResourceListResponse> => {
    const r = await apiClient.get(`${BASE}/resources`, { params });
    return r.data.data ?? r.data;
  },
};

export default adminContentService;
