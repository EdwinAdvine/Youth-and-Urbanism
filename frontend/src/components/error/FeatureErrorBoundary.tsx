import { Component, ErrorInfo, ReactNode } from 'react';
import { reportCriticalError } from '../../services/errorReporterService';

interface Props {
  children: ReactNode;
  /** Name of the feature/section for error context */
  feature: string;
  /** Optional custom fallback UI */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Feature Error Boundary
 *
 * Wraps individual sections of the app (dashboard panels, chat, courses, etc.)
 * so that a crash in one section doesn't take down the entire page.
 * Reports the error and shows a compact recovery card.
 */
class FeatureErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    reportCriticalError(error, errorInfo.componentStack ?? undefined, {
      boundary: 'FeatureErrorBoundary',
      feature: this.props.feature,
    });
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-red-800 mb-1">
            {this.props.feature} encountered an error
          </p>
          <p className="text-xs text-red-600 mb-3">
            This section crashed but the rest of the app is still working.
          </p>
          <button
            onClick={this.handleRetry}
            className="px-4 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default FeatureErrorBoundary;
