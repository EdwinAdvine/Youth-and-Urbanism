import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminSystemHealthService } from '../adminSystemHealthService';

// ---------- Helpers ----------

const API_BASE = 'http://localhost:8000';
const BASE = `${API_BASE}/api/v1/admin/system-health`;

/**
 * Creates a mock Response-like object for the global fetch mock.
 */
function mockResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(body),
    headers: new Headers(),
    redirected: false,
    statusText: ok ? 'OK' : 'Error',
    type: 'basic' as ResponseType,
    url: '',
    clone: vi.fn(),
    body: null,
    bodyUsed: false,
    arrayBuffer: vi.fn(),
    blob: vi.fn(),
    formData: vi.fn(),
    text: vi.fn(),
    bytes: vi.fn(),
  } as unknown as Response;
}

describe('adminSystemHealthService', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Provide an access_token so fetchJson attaches Authorization header
    localStorage.setItem('access_token', 'test-token');

    fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
  });

  // ---------- getOverview ----------

  it('should call the correct overview endpoint', async () => {
    const overview = { database: { status: 'ok', latency_ms: 5 }, errors_24h: {}, latest_test_run: null };
    fetchSpy.mockResolvedValueOnce(mockResponse(overview));

    const result = await adminSystemHealthService.getOverview();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe(`${BASE}/overview`);
    expect(init.headers).toHaveProperty('Authorization', 'Bearer test-token');
    expect(result).toEqual(overview);
  });

  // ---------- getErrors ----------

  it('should pass query params correctly for getErrors', async () => {
    const page = { items: [], total: 0, page: 1, page_size: 20, pages: 0 };
    fetchSpy.mockResolvedValueOnce(mockResponse(page));

    await adminSystemHealthService.getErrors({ page: 2, level: 'ERROR', is_resolved: false });

    const [url] = fetchSpy.mock.calls[0];
    expect(url).toContain('page=2');
    expect(url).toContain('level=ERROR');
    expect(url).toContain('is_resolved=false');
  });

  it('should omit undefined/null/empty params in getErrors', async () => {
    const page = { items: [], total: 0, page: 1, page_size: 20, pages: 0 };
    fetchSpy.mockResolvedValueOnce(mockResponse(page));

    await adminSystemHealthService.getErrors({ page: 1, level: undefined, source: '' });

    const [url] = fetchSpy.mock.calls[0];
    expect(url).toContain('page=1');
    expect(url).not.toContain('level');
    expect(url).not.toContain('source');
  });

  it('should call errors endpoint without query string when no params given', async () => {
    const page = { items: [], total: 0, page: 1, page_size: 20, pages: 0 };
    fetchSpy.mockResolvedValueOnce(mockResponse(page));

    await adminSystemHealthService.getErrors();

    const [url] = fetchSpy.mock.calls[0];
    expect(url).toBe(`${BASE}/errors`);
  });

  // ---------- diagnoseError ----------

  it('should send POST to diagnose endpoint', async () => {
    const diagnosis = { error_id: 'e1', diagnosis: 'Null pointer', diagnosed_at: '2025-01-01', model_used: 'gpt-4' };
    fetchSpy.mockResolvedValueOnce(mockResponse(diagnosis));

    const result = await adminSystemHealthService.diagnoseError('e1');

    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe(`${BASE}/errors/e1/diagnose`);
    expect(init.method).toBe('POST');
    expect(result).toEqual(diagnosis);
  });

  // ---------- resolveError ----------

  it('should send PATCH to resolve endpoint with notes', async () => {
    const resolved = { id: 'e1', is_resolved: true, resolution_notes: 'Fixed' };
    fetchSpy.mockResolvedValueOnce(mockResponse(resolved));

    await adminSystemHealthService.resolveError('e1', 'Fixed the bug');

    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe(`${BASE}/errors/e1/resolve`);
    expect(init.method).toBe('PATCH');
    expect(JSON.parse(init.body)).toEqual({ notes: 'Fixed the bug' });
  });

  // ---------- runTests ----------

  it('should send POST with correct run_type for runTests', async () => {
    const testRun = { id: 'tr1', run_type: 'backend', status: 'running' };
    fetchSpy.mockResolvedValueOnce(mockResponse(testRun));

    const result = await adminSystemHealthService.runTests('backend');

    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe(`${BASE}/tests/run`);
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ run_type: 'backend' });
    expect(result).toEqual(testRun);
  });

  it('should send run_type "all" when requested', async () => {
    const testRun = { id: 'tr2', run_type: 'all', status: 'running' };
    fetchSpy.mockResolvedValueOnce(mockResponse(testRun));

    await adminSystemHealthService.runTests('all');

    const [, init] = fetchSpy.mock.calls[0];
    expect(JSON.parse(init.body)).toEqual({ run_type: 'all' });
  });

  // ---------- Error handling ----------

  it('should throw an error with detail from response body on non-OK response', async () => {
    const errorBody = { detail: 'Forbidden: admin only' };
    fetchSpy.mockResolvedValueOnce(mockResponse(errorBody, false, 403));

    await expect(adminSystemHealthService.getOverview()).rejects.toThrow('Forbidden: admin only');
  });

  it('should throw a generic HTTP error when response body has no detail', async () => {
    // json() rejects (no parseable body)
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: vi.fn().mockRejectedValue(new Error('no body')),
    } as unknown as Response);

    await expect(adminSystemHealthService.getOverview()).rejects.toThrow('HTTP 500');
  });

  // ---------- Token from auth-store ----------

  it('should prefer token from auth-store over access_token', async () => {
    localStorage.setItem('auth-store', JSON.stringify({ state: { token: 'store-token' } }));
    localStorage.setItem('access_token', 'fallback-token');

    const overview = { database: { status: 'ok' } };
    fetchSpy.mockResolvedValueOnce(mockResponse(overview));

    await adminSystemHealthService.getOverview();

    const [, init] = fetchSpy.mock.calls[0];
    expect(init.headers.Authorization).toBe('Bearer store-token');
  });

  // ---------- getTestRuns ----------

  it('should pass query params for getTestRuns', async () => {
    const page = { items: [], total: 0, page: 1, page_size: 10 };
    fetchSpy.mockResolvedValueOnce(mockResponse(page));

    await adminSystemHealthService.getTestRuns({ page: 3, run_type: 'frontend' });

    const [url] = fetchSpy.mock.calls[0];
    expect(url).toContain('page=3');
    expect(url).toContain('run_type=frontend');
  });

  // ---------- unwraps data field ----------

  it('should unwrap response.data field if present', async () => {
    const innerData = { status: 'healthy' };
    fetchSpy.mockResolvedValueOnce(mockResponse({ data: innerData }));

    const result = await adminSystemHealthService.getOverview();
    expect(result).toEqual(innerData);
  });
});
