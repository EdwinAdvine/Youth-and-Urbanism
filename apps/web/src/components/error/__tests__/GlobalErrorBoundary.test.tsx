import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GlobalErrorBoundary from '../GlobalErrorBoundary';

// Mock the error reporter service
vi.mock('../../../services/errorReporterService', () => ({
  reportCriticalError: vi.fn(),
}));

import { reportCriticalError } from '../../../services/errorReporterService';

// ---------- Helpers ----------

/** A component that throws when rendered */
function ThrowingChild({ message }: { message: string }): never {
  throw new Error(message);
}

/** A harmless component */
function GoodChild() {
  return <div>All is well</div>;
}

describe('GlobalErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress React error boundary console.error noise in test output
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  // ---------- Happy path ----------

  it('should render children when no error occurs', () => {
    render(
      <GlobalErrorBoundary>
        <GoodChild />
      </GlobalErrorBoundary>,
    );

    expect(screen.getByText('All is well')).toBeInTheDocument();
  });

  // ---------- Error state ----------

  it('should show fallback UI when a child component throws', () => {
    render(
      <GlobalErrorBoundary>
        <ThrowingChild message="boom" />
      </GlobalErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText(/An unexpected error occurred/),
    ).toBeInTheDocument();
  });

  it('should display the error message in the details section', () => {
    render(
      <GlobalErrorBoundary>
        <ThrowingChild message="detailed failure" />
      </GlobalErrorBoundary>,
    );

    // The error message is inside a <pre> inside <details>
    expect(screen.getByText('detailed failure')).toBeInTheDocument();
  });

  // ---------- Error reporting ----------

  it('should report the error to errorReporterService via reportCriticalError', () => {
    render(
      <GlobalErrorBoundary>
        <ThrowingChild message="report me" />
      </GlobalErrorBoundary>,
    );

    expect(reportCriticalError).toHaveBeenCalledTimes(1);
    expect(reportCriticalError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'report me' }),
      expect.any(String), // componentStack
      expect.objectContaining({ boundary: 'GlobalErrorBoundary' }),
    );
  });

  // ---------- Reload button ----------

  it('should call window.location.reload when "Reload Page" is clicked', () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: reloadMock },
      writable: true,
      configurable: true,
    });

    render(
      <GlobalErrorBoundary>
        <ThrowingChild message="reload test" />
      </GlobalErrorBoundary>,
    );

    fireEvent.click(screen.getByText('Reload Page'));
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  // ---------- Go Home button ----------

  it('should set window.location.href to "/" when "Go Home" is clicked', () => {
    // Create a setter spy on location.href
    const locationObj = { href: '/old', reload: vi.fn() };
    Object.defineProperty(window, 'location', {
      value: locationObj,
      writable: true,
      configurable: true,
    });

    render(
      <GlobalErrorBoundary>
        <ThrowingChild message="go home test" />
      </GlobalErrorBoundary>,
    );

    fireEvent.click(screen.getByText('Go Home'));
    expect(locationObj.href).toBe('/');
  });

  // ---------- Both buttons present ----------

  it('should render both action buttons in the fallback UI', () => {
    render(
      <GlobalErrorBoundary>
        <ThrowingChild message="buttons" />
      </GlobalErrorBoundary>,
    );

    expect(screen.getByText('Reload Page')).toBeInTheDocument();
    expect(screen.getByText('Go Home')).toBeInTheDocument();
  });

  // ---------- Does not show fallback when children are fine ----------

  it('should not show fallback elements when children render normally', () => {
    render(
      <GlobalErrorBoundary>
        <GoodChild />
      </GlobalErrorBoundary>,
    );

    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    expect(screen.queryByText('Reload Page')).not.toBeInTheDocument();
  });
});
