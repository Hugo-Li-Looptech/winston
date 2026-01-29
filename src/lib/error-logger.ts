// Centralized error logging service
// Ready for external service integration (Sentry, LogRocket, etc.)

export type ErrorType = 'NETWORK' | 'VALIDATION' | 'RUNTIME' | 'BOUNDARY';

export interface ErrorLog {
  id: string;
  timestamp: string;
  type: ErrorType;
  message: string;
  stack?: string;
  component?: string;
  userContext?: Record<string, unknown>;
}

// In-memory log store for development
const errorLogs: ErrorLog[] = [];
const MAX_LOGS = 100;

/**
 * Generate a unique error ID
 */
const generateErrorId = (): string => {
  return `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Log an error with structured format
 */
export const logError = (
  type: ErrorType,
  message: string,
  options?: {
    stack?: string;
    component?: string;
    userContext?: Record<string, unknown>;
  }
): ErrorLog => {
  const errorLog: ErrorLog = {
    id: generateErrorId(),
    timestamp: new Date().toISOString(),
    type,
    message,
    stack: options?.stack,
    component: options?.component,
    userContext: options?.userContext,
  };

  // Store in memory (with limit)
  errorLogs.unshift(errorLog);
  if (errorLogs.length > MAX_LOGS) {
    errorLogs.pop();
  }

  // Console logging for development
  const logStyle = {
    NETWORK: 'color: #f59e0b; font-weight: bold',
    VALIDATION: 'color: #3b82f6; font-weight: bold',
    RUNTIME: 'color: #ef4444; font-weight: bold',
    BOUNDARY: 'color: #dc2626; font-weight: bold',
  };

  console.group(`%c[${type}] ${message}`, logStyle[type]);
  console.log('Timestamp:', errorLog.timestamp);
  if (options?.component) console.log('Component:', options.component);
  if (options?.stack) console.log('Stack:', options.stack);
  if (options?.userContext) console.log('Context:', options.userContext);
  console.groupEnd();

  // Placeholder for external service integration
  // sendToSentry(errorLog);
  // sendToLogRocket(errorLog);

  return errorLog;
};

/**
 * Log a network error (API failures)
 */
export const logNetworkError = (
  message: string,
  response?: {
    status?: number;
    statusText?: string;
    url?: string;
  },
  component?: string
): ErrorLog => {
  return logError('NETWORK', message, {
    component,
    userContext: response ? { response } : undefined,
  });
};

/**
 * Log a validation error (form errors)
 */
export const logValidationError = (
  errors: Record<string, string | string[]>,
  component?: string
): ErrorLog => {
  const errorMessages = Object.entries(errors)
    .map(([field, msg]) => `${field}: ${Array.isArray(msg) ? msg.join(', ') : msg}`)
    .join('; ');

  return logError('VALIDATION', `Validation failed: ${errorMessages}`, {
    component,
    userContext: { errors },
  });
};

/**
 * Log a runtime error
 */
export const logRuntimeError = (
  error: Error,
  component?: string
): ErrorLog => {
  return logError('RUNTIME', error.message, {
    stack: error.stack,
    component,
  });
};

/**
 * Log an error boundary catch
 */
export const logBoundaryError = (
  error: Error,
  errorInfo: { componentStack?: string },
  component?: string
): ErrorLog => {
  return logError('BOUNDARY', error.message, {
    stack: error.stack,
    component,
    userContext: { componentStack: errorInfo.componentStack },
  });
};

/**
 * Get all logged errors (for debugging)
 */
export const getErrorLogs = (): ErrorLog[] => {
  return [...errorLogs];
};

/**
 * Clear all logged errors
 */
export const clearErrorLogs = (): void => {
  errorLogs.length = 0;
};
