import { ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface InlineErrorProps {
  message: string;
  icon?: ReactNode;
  className?: string;
  onRetry?: () => void;
  id?: string;
}

/**
 * Reusable inline error message component
 * Features destructive styling, icon support, and optional retry button
 */
export function InlineError({
  message,
  icon,
  className,
  onRetry,
  id,
}: InlineErrorProps) {
  return (
    <div
      id={id}
      role="alert"
      aria-live="polite"
      className={cn(
        'flex items-center gap-2 text-sm text-destructive',
        'animate-in fade-in-0 slide-in-from-top-1 duration-200',
        className
      )}
    >
      {icon ?? <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />}
      <span className="flex-1">{message}</span>
      {onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="h-6 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          aria-label="Retry"
        >
          <RefreshCw className="h-3 w-3" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
