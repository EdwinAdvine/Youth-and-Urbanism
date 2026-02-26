import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FeatureErrorBoundary from '../FeatureErrorBoundary';

// Mock the error reporter service
vi.mock('../../../services/errorReporterService', () => ({
  reportCriticalError: vi.fn(),
}));

import { reportCriticalError } from '../../../services/errorReporterService';

// ---------- Helpers ----------

/** A component that always throws */
function ThrowingChild({ message }: { message: string }): never {
  throw new Error(message);
}

/** A harmless child component */
function GoodChild() {
  return <div>Feature content</div>;
}

describe('FeatureErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress React error boundary console.error noise
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  // ---------- Happy path ----------

  it('should render children when no error occurs', () => {
    render(
      <FeatureErrorBoundary feature="Dashboard">
        <GoodChild />
      </FeatureErrorBoundary>,
    );

    expect(screen.getByText('Feature content')).toBeInTheDocument();
  });

  // ---------- Error state ----------

  it('should show error card with feature name when a child throws', () => {
    render(
      <FeatureErrorBoundary feature="Chat Widget">
        <ThrowingChild message="chat broke" />
      </FeatureErrorBoundary>,
    );

    expect(screen.getByText('Chat Widget encountered an error')).toBeInTheDocument();
    expect(
      screen.getByText('This section crashed but the rest of the app is still working.'),
    ).toBeInTheDocument();
  });

  // ---------- Error reporting ----------

  it('should report the error with feature context to errorReporterService', () => {
    render(
      <FeatureErrorBoundary feature="Course List">
        <ThrowingChild message="course crash" />
      </FeatureErrorBoundary>,
    );

    expect(reportCriticalError).toHaveBeenCalledTimes(1);
    expect(reportCriticalError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'course crash' }),
      expect.any(String), // componentStack
      expect.objectContaining({
        boundary: 'FeatureErrorBoundary',
        feature: 'Course List',
      }),
    );
  });

  // ---------- Try Again button ----------

  it('should reset error state and re-render children when "Try Again" is clicked', () => {
    let shouldThrow = true;

    function ConditionalThrower() {
      if (shouldThrow) {
        throw new Error('first render fails');
      }
      return <div>Recovered successfully</div>;
    }

    render(
      <FeatureErrorBoundary feature="Test Feature">
        <ConditionalThrower />
      </FeatureErrorBoundary>,
    );

    // Should show the error card
    expect(screen.getByText('Test Feature encountered an error')).toBeInTheDocument();

    // Fix the condition so the next render succeeds
    shouldThrow = false;

    fireEvent.click(screen.getByText('Try Again'));

    // After retry, children should render
    expect(screen.getByText('Recovered successfully')).toBeInTheDocument();
    expect(screen.queryByText('Test Feature encountered an error')).not.toBeInTheDocument();
  });

  it('should render the Try Again button in the fallback', () => {
    render(
      <FeatureErrorBoundary feature="Sidebar">
        <ThrowingChild message="sidebar broke" />
      </FeatureErrorBoundary>,
    );

    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  // ---------- Custom fallback prop ----------

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom error UI</div>;

    render(
      <FeatureErrorBoundary feature="Analytics" fallback={customFallback}>
        <ThrowingChild message="analytics error" />
      </FeatureErrorBoundary>,
    );

    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
    // The default error card should NOT be shown
    expect(screen.queryByText('Analytics encountered an error')).not.toBeInTheDocument();
    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });

  // ---------- Does not show fallback when no error ----------

  it('should not show any error UI when children render successfully', () => {
    render(
      <FeatureErrorBoundary feature="Grades">
        <GoodChild />
      </FeatureErrorBoundary>,
    );

    expect(screen.queryByText('Grades encountered an error')).not.toBeInTheDocument();
    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });

  // ---------- Reports with componentStack ----------

  it('should pass componentStack to reportCriticalError', () => {
    render(
      <FeatureErrorBoundary feature="Notifications">
        <ThrowingChild message="notify crash" />
      </FeatureErrorBoundary>,
    );

    // The second argument is the componentStack (a string or undefined)
    const secondArg = (reportCriticalError as ReturnType<typeof vi.fn>).mock.calls[0][1];
    // React provides a componentStack string for error boundaries
    expect(typeof secondArg).toBe('string');
  });
});
