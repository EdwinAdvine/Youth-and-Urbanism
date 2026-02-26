import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock axios before importing the module under test
vi.mock('axios', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

// We need to dynamically import the service after mocking, and we need to
// isolate module state between tests so that the dedup Map and queue don't
// leak across tests.

describe('errorReporterService', () => {
  let reportError: typeof import('../errorReporterService').reportError;
  let reportCriticalError: typeof import('../errorReporterService').reportCriticalError;
  let reportApiError: typeof import('../errorReporterService').reportApiError;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Reset module registry so dedup map and queue are fresh each test
    vi.resetModules();

    // Re-mock axios after resetModules (reset clears mock registry)
    vi.doMock('axios', () => ({
      default: {
        post: vi.fn().mockResolvedValue({ data: {} }),
      },
    }));

    const mod = await import('../errorReporterService');
    reportError = mod.reportError;
    reportCriticalError = mod.reportCriticalError;
    reportApiError = mod.reportApiError;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ---------- reportError ----------

  it('should send a POST request to the backend report endpoint via the queue', async () => {
    const axiosMod = (await import('axios')).default;

    reportError(new Error('Something broke'));

    // The enqueue function schedules a 100ms setTimeout before flushing
    await vi.advanceTimersByTimeAsync(200);

    expect(axiosMod.post).toHaveBeenCalledTimes(1);
    expect(axiosMod.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/admin/system-health/errors/report'),
      expect.objectContaining({
        level: 'ERROR',
        error_type: 'Error',
        message: 'Something broke',
      }),
      expect.objectContaining({ timeout: 10_000 }),
    );
  });

  it('should handle string errors by wrapping them with FrontendError type', async () => {
    const axiosMod = (await import('axios')).default;

    reportError('plain string error');

    await vi.advanceTimersByTimeAsync(200);

    expect(axiosMod.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        error_type: 'FrontendError',
        message: 'plain string error',
      }),
      expect.any(Object),
    );
  });

  it('should deduplicate the same error within 60 seconds', async () => {
    const axiosMod = (await import('axios')).default;

    reportError(new Error('dup error'));
    reportError(new Error('dup error'));

    await vi.advanceTimersByTimeAsync(200);

    // Only one call because the second is a duplicate
    expect(axiosMod.post).toHaveBeenCalledTimes(1);
  });

  it('should allow the same error again after 60 seconds', async () => {
    const axiosMod = (await import('axios')).default;

    reportError(new Error('dup timeout'));
    await vi.advanceTimersByTimeAsync(200);

    expect(axiosMod.post).toHaveBeenCalledTimes(1);

    // Advance past the 60s dedup window
    await vi.advanceTimersByTimeAsync(61_000);

    reportError(new Error('dup timeout'));
    await vi.advanceTimersByTimeAsync(200);

    expect(axiosMod.post).toHaveBeenCalledTimes(2);
  });

  it('should capture browser context (url, user_agent) in the report', async () => {
    const axiosMod = (await import('axios')).default;

    reportError(new Error('context test'));
    await vi.advanceTimersByTimeAsync(200);

    const reportPayload = (axiosMod.post as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(reportPayload.context).toHaveProperty('url');
    expect(reportPayload.context).toHaveProperty('user_agent');
    expect(reportPayload.context).toHaveProperty('timestamp');
  });

  it('should extract user context from localStorage', async () => {
    const axiosMod = (await import('axios')).default;

    const mockUser = { id: 'u123', role: 'student', email: 'test@example.com' };
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    reportError(new Error('user context test'));
    await vi.advanceTimersByTimeAsync(200);

    const reportPayload = (axiosMod.post as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(reportPayload.context).toMatchObject({
      user_id: 'u123',
      user_role: 'student',
      user_email: 'test@example.com',
    });

    vi.restoreAllMocks();
  });

  it('should return empty user context when localStorage has no user', async () => {
    const axiosMod = (await import('axios')).default;

    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

    reportError(new Error('no user'));
    await vi.advanceTimersByTimeAsync(200);

    const reportPayload = (axiosMod.post as ReturnType<typeof vi.fn>).mock.calls[0][1];
    // Should not have user_id when there is no user in localStorage
    expect(reportPayload.context.user_id).toBeUndefined();

    vi.restoreAllMocks();
  });

  // ---------- reportCriticalError ----------

  it('should send critical errors immediately (bypassing queue)', async () => {
    const axiosMod = (await import('axios')).default;

    reportCriticalError(new Error('critical crash'), '<App>');

    // Critical errors call sendReport directly -- await the microtask
    await vi.advanceTimersByTimeAsync(0);

    expect(axiosMod.post).toHaveBeenCalledTimes(1);
    expect(axiosMod.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/admin/system-health/errors/report'),
      expect.objectContaining({
        level: 'CRITICAL',
        error_type: 'Error',
        message: 'critical crash',
      }),
      expect.any(Object),
    );
  });

  it('should include component stack in critical error stack trace', async () => {
    const axiosMod = (await import('axios')).default;

    const error = new Error('crash');
    reportCriticalError(error, '<App>\n  <Dashboard>');

    await vi.advanceTimersByTimeAsync(0);

    const payload = (axiosMod.post as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(payload.stack_trace).toContain('Component Stack:');
    expect(payload.stack_trace).toContain('<App>');
  });

  it('should fall back to queue if immediate send fails for critical errors', async () => {
    const axiosMod = (await import('axios')).default;

    // First call rejects (immediate send fails), second succeeds (queue flush)
    (axiosMod.post as ReturnType<typeof vi.fn>)
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce({ data: {} });

    reportCriticalError(new Error('fallback test'));

    // Let the .catch handler enqueue
    await vi.advanceTimersByTimeAsync(0);

    // Now flush the queue
    await vi.advanceTimersByTimeAsync(200);

    // Should have been called twice: once immediate (failed) + once from queue
    expect(axiosMod.post).toHaveBeenCalledTimes(2);
  });

  // ---------- reportApiError ----------

  it('should format API errors with correct level and message', async () => {
    const axiosMod = (await import('axios')).default;

    reportApiError(500, '/api/v1/users', 'get', { detail: 'Internal error' });
    await vi.advanceTimersByTimeAsync(200);

    expect(axiosMod.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        level: 'ERROR',
        error_type: 'HTTP500',
        message: 'API GET /api/v1/users returned 500',
        endpoint: '/api/v1/users',
      }),
      expect.any(Object),
    );
  });

  it('should set level to WARNING for 4xx API errors', async () => {
    const axiosMod = (await import('axios')).default;

    reportApiError(422, '/api/v1/login', 'post', { detail: 'Validation error' });
    await vi.advanceTimersByTimeAsync(200);

    const payload = (axiosMod.post as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(payload.level).toBe('WARNING');
    expect(payload.error_type).toBe('HTTP422');
  });

  it('should include response_preview in API error context', async () => {
    const axiosMod = (await import('axios')).default;

    const responseData = { detail: 'Something went wrong' };
    reportApiError(502, '/api/v1/data', 'get', responseData);
    await vi.advanceTimersByTimeAsync(200);

    const payload = (axiosMod.post as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(payload.context.response_preview).toContain('Something went wrong');
    expect(payload.context.source).toBe('api_interceptor');
    expect(payload.context.http_status).toBe(502);
    expect(payload.context.http_method).toBe('GET');
  });
});
