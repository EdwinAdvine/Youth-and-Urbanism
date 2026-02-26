/**
 * Scholarship Service - API client for scholarship endpoints.
 */
import apiClient from './api';

export interface ScholarshipApplicationResponse {
  id: string;
  applicant_type: string;
  full_name: string;
  email: string;
  phone?: string;
  student_name?: string;
  student_age?: number;
  school_name?: string;
  grade?: string;
  settlement: string;
  county: string;
  reason: string;
  supporting_info?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ScholarshipListResponse {
  applications: ScholarshipApplicationResponse[];
  total: number;
}

export const scholarshipService = {
  async listApplications(params?: {
    status?: 'pending' | 'approved' | 'rejected';
    skip?: number;
    limit?: number;
  }): Promise<ScholarshipListResponse> {
    const res = await apiClient.get('/scholarships', { params });
    return res.data;
  },

  async reviewApplication(
    id: string,
    data: { status: 'approved' | 'rejected'; review_notes?: string }
  ): Promise<ScholarshipApplicationResponse> {
    const res = await apiClient.put(`/scholarships/${id}/review`, data);
    return res.data;
  },
};
