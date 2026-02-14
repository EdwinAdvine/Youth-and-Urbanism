/**
 * Admin Content & Learning Integrity Service - Phase 4
 *
 * Provides typed API calls for course management, CBC alignment,
 * assessment overrides, certificates, and resource library.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const BASE = `${API_URL}/api/v1/admin/content`;

function getAuthHeaders(): Record<string, string> {
  let jwt = '';
  const stored = localStorage.getItem('auth-store');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      jwt = parsed?.state?.token || parsed?.token || '';
    } catch {
      jwt = stored;
    }
  }
  return {
    Authorization: `Bearer ${jwt}`,
    'Content-Type': 'application/json',
  };
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: getAuthHeaders(),
    ...options,
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  const json = await response.json();
  return json.data ?? json;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '' && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return qs ? `?${qs}` : '';
}

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
  listCourses: (params: CourseListParams = {}): Promise<CourseListResponse> =>
    fetchJson<CourseListResponse>(
      `${BASE}/courses${buildQuery({
        page: params.page,
        page_size: params.page_size,
        status: params.status,
        search: params.search,
      })}`,
    ),

  approveCourse: (courseId: string): Promise<{ success: boolean; course_id: string }> =>
    fetchJson(`${BASE}/courses/${courseId}/approve`, { method: 'PUT' }),

  rejectCourse: (courseId: string, reason: string): Promise<{ success: boolean }> =>
    fetchJson(`${BASE}/courses/${courseId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    }),

  getCourseVersions: (courseId: string): Promise<CourseVersion[]> =>
    fetchJson<CourseVersion[]>(`${BASE}/courses/${courseId}/versions`),

  getCBCAlignment: (): Promise<CBCAlignmentData> =>
    fetchJson<CBCAlignmentData>(`${BASE}/cbc-alignment`),

  getAssessmentOverrides: (page = 1, pageSize = 10): Promise<GradeOverrideListResponse> =>
    fetchJson<GradeOverrideListResponse>(
      `${BASE}/assessments/overrides?page=${page}&page_size=${pageSize}`,
    ),

  getCertificatesLog: (page = 1, pageSize = 10): Promise<CertificateListResponse> =>
    fetchJson<CertificateListResponse>(
      `${BASE}/certificates?page=${page}&page_size=${pageSize}`,
    ),

  listResources: (params: ResourceListParams = {}): Promise<ResourceListResponse> =>
    fetchJson<ResourceListResponse>(
      `${BASE}/resources${buildQuery({
        page: params.page,
        page_size: params.page_size,
        category: params.category,
        status: params.status,
      })}`,
    ),
};

export default adminContentService;
