/**
 * Parent Reports Service
 *
 * API service for parent reports endpoints:
 * reports list, generation, term summaries, transcripts, and portfolio exports.
 */

import api from './api';

// ============================================================================
// REPORTS
// ============================================================================

export const getReportsList = (params?: {
  child_id?: string;
  report_type?: string;
}) => api.get('/api/v1/parent/reports', { params }).then((r) => r.data);

export const generateReport = (data: {
  child_id: string;
  report_type: string;
  period?: string;
}) => api.post('/api/v1/parent/reports/generate', data).then((r) => r.data);

export const getReportDetail = (reportId: string) =>
  api.get(`/api/v1/parent/reports/${reportId}`).then((r) => r.data);

// ============================================================================
// TERM SUMMARY & TRANSCRIPT
// ============================================================================

export const getTermSummary = (childId: string, term?: string) =>
  api.get(`/api/v1/parent/reports/term-summary/${childId}`, { params: { term } }).then((r) => r.data);

export const getTranscript = (childId: string) =>
  api.get(`/api/v1/parent/reports/transcript/${childId}`).then((r) => r.data);

// ============================================================================
// PORTFOLIO EXPORT
// ============================================================================

export const exportPortfolio = (data: {
  child_id: string;
  items?: string[];
}) => api.post('/api/v1/parent/reports/portfolio/export', data).then((r) => r.data);

export const getExportStatus = (jobId: string) =>
  api.get(`/api/v1/parent/reports/portfolio/status/${jobId}`).then((r) => r.data);

export default {
  getReportsList,
  generateReport,
  getReportDetail,
  getTermSummary,
  getTranscript,
  exportPortfolio,
  getExportStatus,
};
