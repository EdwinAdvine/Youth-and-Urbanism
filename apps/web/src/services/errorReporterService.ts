/**
 * Centralized Error Reporter Service
 *
 * Reports frontend errors to the backend API for admin monitoring.
 * Features: deduplication, queue with retry, browser context capture.
 *
 * NOTE: This service intentionally uses a standalone axios instance rather
 * than the shared apiClient to avoid a circular dependency (api.ts imports
 * this module) and to ensure error reporting works even when auth is broken.
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const REPORT_ENDPOINT = `${API_BASE_URL}/api/v1/admin/system-health/errors/report`;
const DEDUP_WINDOW_MS = 60_000; // Don't report same error within 60s
const MAX_QUEUE_SIZE = 50;
const RETRY_DELAY_MS = 5_000;
const MAX_RETRIES = 3;

interface ErrorReport {
  level: string;
  error_type: string;
  message: string;
  stack_trace?: string;
  endpoint?: string;
  context?: Record<string, unknown>;
}

interface QueuedReport {
  report: ErrorReport;
  retries: number;
}

// Track recently reported errors for deduplication
const recentErrors = new Map<string, number>();
const queue: QueuedReport[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function dedupKey(report: ErrorReport): string {
  return `${report.error_type}:${report.message.slice(0, 200)}`;
}

function isDuplicate(report: ErrorReport): boolean {
  const key = dedupKey(report);
  const lastReported = recentErrors.get(key);
  if (lastReported && Date.now() - lastReported < DEDUP_WINDOW_MS) {
    return true;
  }
  recentErrors.set(key, Date.now());
  return false;
}

function getBrowserContext(): Record<string, unknown> {
  return {
    url: window.location.href,
    user_agent: navigator.userAgent,
    screen: `${window.screen.width}x${window.screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    timestamp: new Date().toISOString(),
  };
}

function getUserContext(): Record<string, unknown> {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (raw) {
      const parsed = JSON.parse(raw);
      const user = parsed?.state?.user;
      if (user) {
        // Only send anonymized user ID and role — no PII (email, name, etc.)
        return { user_id: user.id, user_role: user.role };
      }
    }
  } catch {
    // Ignore parse errors
  }
  return {};
}

async function sendReport(report: ErrorReport): Promise<boolean> {
  try {
    await axios.post(REPORT_ENDPOINT, report, {
      timeout: 10_000,
      withCredentials: true,
    });
    return true;
  } catch {
    return false;
  }
}

async function flushQueue(): Promise<void> {
  if (queue.length === 0) return;

  const batch = queue.splice(0, 10);
  const failed: QueuedReport[] = [];

  for (const item of batch) {
    const ok = await sendReport(item.report);
    if (!ok && item.retries < MAX_RETRIES) {
      failed.push({ ...item, retries: item.retries + 1 });
    }
  }

  // Re-queue failed items
  queue.unshift(...failed);

  // Schedule next flush if items remain
  if (queue.length > 0 && !flushTimer) {
    flushTimer = setTimeout(() => {
      flushTimer = null;
      flushQueue();
    }, RETRY_DELAY_MS);
  }
}

function enqueue(report: ErrorReport): void {
  if (queue.length >= MAX_QUEUE_SIZE) {
    queue.shift(); // Drop oldest
  }
  queue.push({ report, retries: 0 });

  // Flush immediately
  if (!flushTimer) {
    flushTimer = setTimeout(() => {
      flushTimer = null;
      flushQueue();
    }, 100);
  }
}

/**
 * Report an error to the backend for admin monitoring.
 */
export function reportError(
  error: Error | string,
  context?: Record<string, unknown>,
): void {
  const isError = error instanceof Error;
  const errorType = isError ? error.name : 'FrontendError';
  const message = isError ? error.message : String(error);
  const stackTrace = isError ? error.stack : undefined;

  const report: ErrorReport = {
    level: 'ERROR',
    error_type: errorType,
    message,
    stack_trace: stackTrace,
    endpoint: window.location.pathname,
    context: {
      ...getBrowserContext(),
      ...getUserContext(),
      ...context,
    },
  };

  if (isDuplicate(report)) return;

  enqueue(report);
}

/**
 * Report a critical error (React crash, unhandled rejection).
 */
export function reportCriticalError(
  error: Error | string,
  componentStack?: string,
  context?: Record<string, unknown>,
): void {
  const isError = error instanceof Error;
  const errorType = isError ? error.name : 'CriticalFrontendError';
  const message = isError ? error.message : String(error);
  let stackTrace = isError ? error.stack : undefined;

  if (componentStack) {
    stackTrace = (stackTrace || '') + '\n\nComponent Stack:\n' + componentStack;
  }

  const report: ErrorReport = {
    level: 'CRITICAL',
    error_type: errorType,
    message,
    stack_trace: stackTrace,
    endpoint: window.location.pathname,
    context: {
      ...getBrowserContext(),
      ...getUserContext(),
      source: 'react_error_boundary',
      ...context,
    },
  };

  if (isDuplicate(report)) return;

  // Critical errors bypass the queue - send immediately, fall back to queue on failure
  sendReport(report).then((ok) => {
    if (!ok) enqueue(report);
  });
}

/**
 * Report an API error (5xx server error).
 */
export function reportApiError(
  status: number,
  url: string,
  method: string,
  responseData?: unknown,
): void {
  const report: ErrorReport = {
    level: status >= 500 ? 'ERROR' : 'WARNING',
    error_type: `HTTP${status}`,
    message: `API ${method.toUpperCase()} ${url} returned ${status}`,
    endpoint: url,
    context: {
      ...getBrowserContext(),
      ...getUserContext(),
      source: 'api_interceptor',
      http_status: status,
      http_method: method.toUpperCase(),
      response_preview: responseData
        ? JSON.stringify(responseData).slice(0, 500)
        : undefined,
    },
  };

  if (isDuplicate(report)) return;

  enqueue(report);
}

// Capture unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error
      ? event.reason
      : new Error(String(event.reason));
    reportCriticalError(error, undefined, { source: 'unhandled_rejection' });
  });

  // Capture global errors
  window.addEventListener('error', (event) => {
    if (event.error) {
      reportError(event.error, { source: 'window_onerror' });
    }
  });
}
