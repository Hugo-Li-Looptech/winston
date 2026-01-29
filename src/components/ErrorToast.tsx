import { toast } from '@/hooks/use-toast';
import { ToastActionElement } from '@/components/ui/toast';

interface ErrorToastOptions {
  title?: string;
  duration?: number;
  action?: ToastActionElement;
}

/**
 * Show an error toast notification (destructive variant)
 */
export function showErrorToast(message: string, options?: ErrorToastOptions) {
  toast({
    variant: 'destructive',
    title: options?.title ?? 'Error',
    description: message,
    duration: options?.duration ?? 5000,
    action: options?.action,
  });
}

/**
 * Show a warning toast notification
 */
export function showWarningToast(message: string, title?: string) {
  toast({
    title: title ?? 'Warning',
    description: message,
    duration: 4000,
  });
}

/**
 * Show a predefined network error toast
 */
export function showNetworkError(customMessage?: string) {
  showErrorToast(
    customMessage ?? 'Unable to connect. Please check your internet connection and try again.',
    { title: 'Connection Error' }
  );
}

/**
 * Show validation error toast with multiple errors
 */
export function showValidationError(errors: Record<string, string | string[]>) {
  const errorMessages = Object.entries(errors)
    .map(([field, msg]) => {
      const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
      const message = Array.isArray(msg) ? msg[0] : msg;
      return `${fieldName}: ${message}`;
    })
    .slice(0, 3) // Limit to first 3 errors
    .join('\n');

  showErrorToast(errorMessages, { title: 'Validation Error', duration: 6000 });
}

/**
 * Show a server error toast
 */
export function showServerError(statusCode?: number) {
  const message = statusCode === 503
    ? 'The service is temporarily unavailable. Please try again later.'
    : 'An unexpected server error occurred. Please try again.';
  
  showErrorToast(message, { title: `Server Error${statusCode ? ` (${statusCode})` : ''}` });
}
