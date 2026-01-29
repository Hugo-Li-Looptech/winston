import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorFallback } from './ErrorFallback';
import { logBoundaryError } from '@/lib/error-logger';

export interface FallbackProps {
  error: Error;
  resetError: () => void;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((props: FallbackProps) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary component that catches JavaScript errors in child component tree
 * Features:
 * - Customizable fallback UI
 * - Automatic error logging
 * - Retry functionality
 * - Accessibility support
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log to centralized error logger
    logBoundaryError(error, { componentStack: errorInfo.componentStack || undefined });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  resetError = (): void => {
    // Call custom retry handler if provided
    this.props.onRetry?.();
    
    // Reset error state
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      // Custom fallback component or function
      if (fallback) {
        if (typeof fallback === 'function') {
          return fallback({ error, resetError: this.resetError });
        }
        return fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-[200px] flex items-center justify-center p-4">
          <ErrorFallback error={error} resetError={this.resetError} />
        </div>
      );
    }

    return children;
  }
}
