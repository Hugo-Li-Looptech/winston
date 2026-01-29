import { useCallback } from 'react';
import {
  logError,
  logNetworkError,
  logValidationError,
  logRuntimeError,
  logBoundaryError,
  ErrorType,
  ErrorLog,
} from '@/lib/error-logger';

interface UseErrorLoggerOptions {
  component?: string;
}

/**
 * React hook for error logging integration
 * Provides convenient methods to log errors with automatic component detection
 */
export function useErrorLogger(options?: UseErrorLoggerOptions) {
  const component = options?.component;

  const handleLogError = useCallback(
    (
      type: ErrorType,
      message: string,
      context?: Record<string, unknown>
    ): ErrorLog => {
      return logError(type, message, {
        component,
        userContext: context,
      });
    },
    [component]
  );

  const handleLogNetworkError = useCallback(
    (
      message: string,
      response?: {
        status?: number;
        statusText?: string;
        url?: string;
      }
    ): ErrorLog => {
      return logNetworkError(message, response, component);
    },
    [component]
  );

  const handleLogValidationError = useCallback(
    (errors: Record<string, string | string[]>): ErrorLog => {
      return logValidationError(errors, component);
    },
    [component]
  );

  const handleLogRuntimeError = useCallback(
    (error: Error): ErrorLog => {
      return logRuntimeError(error, component);
    },
    [component]
  );

  const handleLogBoundaryError = useCallback(
    (error: Error, errorInfo: { componentStack?: string }): ErrorLog => {
      return logBoundaryError(error, errorInfo, component);
    },
    [component]
  );

  return {
    logError: handleLogError,
    logNetworkError: handleLogNetworkError,
    logValidationError: handleLogValidationError,
    logRuntimeError: handleLogRuntimeError,
    logBoundaryError: handleLogBoundaryError,
  };
}
