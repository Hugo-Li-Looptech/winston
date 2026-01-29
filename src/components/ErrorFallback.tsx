import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  title?: string;
  description?: string;
  showReportLink?: boolean;
  className?: string;
}

/**
 * Styled fallback UI component shown when errors occur
 * Features glass-morphism design, retry functionality, and accessibility
 */
export function ErrorFallback({
  error,
  resetError,
  title = 'Something went wrong',
  description = "We're sorry, but something unexpected happened. Please try again.",
  showReportLink = false,
  className,
}: ErrorFallbackProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'flex flex-col items-center justify-center p-8 rounded-2xl',
        'bg-card/80 backdrop-blur-xl shadow-lg dark:shadow-black/20',
        'border border-border/50 text-center',
        'animate-in fade-in-0 zoom-in-95 duration-300',
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
        <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden="true" />
      </div>

      <h2 className="text-xl font-semibold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground text-sm max-w-md mb-6">{description}</p>

      {/* Error details for development */}
      {process.env.NODE_ENV === 'development' && error.message && (
        <details className="mb-4 w-full max-w-md text-left">
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
            Technical details
          </summary>
          <pre className="mt-2 p-3 bg-muted/50 rounded-lg text-xs overflow-auto max-h-32 text-muted-foreground">
            {error.message}
          </pre>
        </details>
      )}

      <div className="flex gap-3">
        <Button
          onClick={resetError}
          className="gap-2"
          aria-label="Try again"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try Again
        </Button>

        {showReportLink && (
          <Button
            variant="outline"
            onClick={() => {
              // Placeholder for report functionality
              console.log('Report issue:', error);
            }}
            aria-label="Report this issue"
          >
            Report Issue
          </Button>
        )}
      </div>
    </div>
  );
}
