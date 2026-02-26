/**
 * Certificate Service - API client for certificate endpoints.
 */
import apiClient from './api';

export interface CertificateData {
  id: string;
  serial_number: string;
  student_id: string;
  student_name: string;
  course_id?: string;
  course_name: string;
  grade?: string;
  completion_date?: string;
  issued_at: string;
  is_valid: boolean;
  revoked_at?: string;
}

export interface CertificateListResponse {
  certificates: CertificateData[];
  total: number;
}

export interface CertificateValidationResponse {
  is_valid: boolean;
  serial_number: string;
  student_name: string;
  course_name: string;
  completion_date?: string;
  grade?: string;
  issued_at: string;
}

export const certificateService = {
  async listCertificates(params?: { skip?: number; limit?: number }): Promise<CertificateListResponse> {
    const res = await apiClient.get('/certificates', { params });
    return res.data;
  },

  async validateBySerial(serial: string): Promise<CertificateValidationResponse> {
    const res = await apiClient.get(`/certificates/validate/${encodeURIComponent(serial)}`);
    return res.data;
  },

  async downloadPdf(certificateId: string, serialNumber: string): Promise<void> {
    const res = await apiClient.get(`/certificates/${certificateId}/pdf`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `UHS-Certificate-${serialNumber}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
