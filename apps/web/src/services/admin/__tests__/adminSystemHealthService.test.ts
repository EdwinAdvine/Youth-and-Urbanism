import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the api module before importing the service
vi.mock('../../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

// Mock errorReporterService to prevent side effects
vi.mock('../../errorReporterService', () => ({
  reportApiError: vi.fn(),
}));

import { adminSystemHealthService } from '../adminSystemHealthService';
import apiClient from '../../api';

describe('adminSystemHealthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------- getOverview ----------

  it('should call the correct overview endpoint', async () => {
    const overview = { database: { status: 'ok', latency_ms: 5 }, errors_24h: {}, latest_test_run: null };
    (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: overview });

    const result = await adminSystemHealthService.getOverview();

    expect(apiClient.get).toHaveBeenCalledTimes(1);
    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/admin/system-health/overview');
    expect(result).toEqual(overview);
  });

  // ---------- getErrors ----------

  it('should pass query params correctly for getErrors', async () => {
    const page = { items: [], total: 0, page: 1, page_size: 20, pages: 0 };
    (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: page });

    await adminSystemHealthService.getErrors({ page: 2, level: 'ERROR', is_resolved: false });

    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/admin/system-health/errors', {
      params: { page: 2, level: 'ERROR', is_resolved: false },
    });
  });

  it('should omit undefined params in getErrors', async () => {
    const page = { items: [], total: 0, page: 1, page_size: 20, pages: 0 };
    (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: page });

    await adminSystemHealthService.getErrors({ page: 1, level: undefined, source: '' });

    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/admin/system-health/errors', {
      params: { page: 1, level: undefined, source: '' },
    });
  });

  it('should call errors endpoint without params when no params given', async () => {
    const page = { items: [], total: 0, page: 1, page_size: 20, pages: 0 };
    (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: page });

    await adminSystemHealthService.getErrors();

    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/admin/system-health/errors', {
      params: undefined,
    });
  });

  // ---------- diagnoseError ----------

  it('should send POST to diagnose endpoint', async () => {
    const diagnosis = { error_id: 'e1', diagnosis: 'Null pointer', diagnosed_at: '2025-01-01', model_used: 'gpt-4' };
    (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: diagnosis });

    const result = await adminSystemHealthService.diagnoseError('e1');

    expect(apiClient.post).toHaveBeenCalledWith('/api/v1/admin/system-health/errors/e1/diagnose');
    expect(result).toEqual(diagnosis);
  });

  // ---------- resolveError ----------

  it('should send PATCH to resolve endpoint with notes', async () => {
    const resolved = { id: 'e1', is_resolved: true, resolution_notes: 'Fixed' };
    (apiClient.patch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: resolved });

    await adminSystemHealthService.resolveError('e1', 'Fixed the bug');

    expect(apiClient.patch).toHaveBeenCalledWith(
      '/api/v1/admin/system-health/errors/e1/resolve',
      { notes: 'Fixed the bug' },
    );
  });

  // ---------- runTests ----------

  it('should send POST with correct run_type for runTests', async () => {
    const testRun = { id: 'tr1', run_type: 'backend', status: 'running' };
    (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: testRun });

    const result = await adminSystemHealthService.runTests('backend');

    expect(apiClient.post).toHaveBeenCalledWith(
      '/api/v1/admin/system-health/tests/run',
      { run_type: 'backend' },
    );
    expect(result).toEqual(testRun);
  });

  it('should send run_type "all" when requested', async () => {
    const testRun = { id: 'tr2', run_type: 'all', status: 'running' };
    (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: testRun });

    await adminSystemHealthService.runTests('all');

    expect(apiClient.post).toHaveBeenCalledWith(
      '/api/v1/admin/system-health/tests/run',
      { run_type: 'all' },
    );
  });

  // ---------- Error handling ----------

  it('should propagate errors from apiClient', async () => {
    (apiClient.get as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

    await expect(adminSystemHealthService.getOverview()).rejects.toThrow('Network error');
  });

  // ---------- getTestRuns ----------

  it('should pass query params for getTestRuns', async () => {
    const page = { items: [], total: 0, page: 1, page_size: 10 };
    (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: page });

    await adminSystemHealthService.getTestRuns({ page: 3, run_type: 'frontend' });

    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/admin/system-health/tests/results', {
      params: { page: 3, run_type: 'frontend' },
    });
  });

  // ---------- unwraps data field ----------

  it('should unwrap response.data.data field if present', async () => {
    const innerData = { status: 'healthy' };
    (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { data: innerData } });

    const result = await adminSystemHealthService.getOverview();
    expect(result).toEqual(innerData);
  });
});
