import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorFallback } from '@/components/ErrorFallback';
import { InlineError } from '@/components/InlineError';
import {
  showErrorToast,
  showWarningToast,
  showNetworkError,
  showValidationError,
  showServerError,
} from '@/components/ErrorToast';
import { useErrorLogger } from '@/hooks/use-error-logger';
import { AlertTriangle, Bomb, RefreshCw, Send, Wifi, WifiOff } from 'lucide-react';

// Component that intentionally throws an error
function BuggyComponent(): JSX.Element {
  throw new Error('This is a demo error from BuggyComponent!');
}

// Wrapper to conditionally render the buggy component
function BoundaryDemo() {
  const [showError, setShowError] = useState(false);

  if (showError) {
    return <BuggyComponent />;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-muted-foreground text-center">
        Click the button below to trigger an error caught by the Error Boundary
      </p>
      <Button
        variant="destructive"
        onClick={() => setShowError(true)}
        className="gap-2"
      >
        <Bomb className="h-4 w-4" />
        Trigger Error
      </Button>
    </div>
  );
}

// Toast Demo Component
function ToastDemo() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Click buttons to see different toast notifications:
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => showErrorToast('This is an error toast message!')}
        >
          Error Toast
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => showWarningToast('This is a warning message')}
        >
          Warning Toast
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => showNetworkError()}
          className="gap-2"
        >
          <WifiOff className="h-4 w-4" />
          Network Error
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => showServerError(500)}
        >
          Server Error
        </Button>
      </div>
    </div>
  );
}

// Inline Error Demo Component
function InlineErrorDemo() {
  const [email, setEmail] = useState('');
  const [showError, setShowError] = useState(false);

  const validateEmail = () => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    setShowError(!isValid);
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Type an invalid email and click validate:
      </p>
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Enter email..."
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setShowError(false);
          }}
          aria-describedby={showError ? 'email-error' : undefined}
          aria-invalid={showError}
          className={showError ? 'border-destructive' : ''}
        />
        <Button onClick={validateEmail}>Validate</Button>
      </div>
      {showError && (
        <InlineError
          id="email-error"
          message="Please enter a valid email address"
          onRetry={() => setShowError(false)}
        />
      )}
    </div>
  );
}

// Retry Demo Component
function RetryDemo() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { logNetworkError } = useErrorLogger({ component: 'RetryDemo' });

  const simulateApiCall = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 70% chance of failure for demo purposes
    if (Math.random() < 0.7) {
      const errorMsg = 'Failed to fetch data from server';
      logNetworkError(errorMsg, { status: 500, statusText: 'Internal Server Error' });
      setError(errorMsg);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Simulates an API call with a 70% failure rate:
      </p>
      
      {error && (
        <InlineError message={error} onRetry={simulateApiCall} />
      )}
      
      {success && (
        <div className="flex items-center gap-2 text-sm text-primary animate-in fade-in-0">
          <Wifi className="h-4 w-4" />
          <span>Data fetched successfully!</span>
        </div>
      )}
      
      <Button
        onClick={simulateApiCall}
        disabled={loading}
        className="gap-2 w-fit"
      >
        {loading ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            Fetching...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Fetch Data
          </>
        )}
      </Button>
    </div>
  );
}

// Validation Error Toast Demo
function ValidationToastDemo() {
  const handleShowValidationErrors = () => {
    showValidationError({
      email: 'Invalid email format',
      password: 'Password must be at least 8 characters',
      username: 'Username is already taken',
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Shows multiple validation errors in a toast:
      </p>
      <Button onClick={handleShowValidationErrors} variant="outline" className="gap-2 w-fit">
        <AlertTriangle className="h-4 w-4" />
        Show Validation Errors
      </Button>
    </div>
  );
}

// Main Demo Component for the Error Handling Course
export function ErrorHandlingDemo({ slideId }: { slideId: string }) {
  switch (slideId) {
    case 'error-1':
      return (
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Welcome to Error Handling</CardTitle>
            <CardDescription>
              This course demonstrates various error handling patterns in React applications.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>In this course, you'll learn about:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>React Error Boundaries</li>
              <li>Toast notifications for errors</li>
              <li>Inline error messages</li>
              <li>Retry mechanisms</li>
              <li>Error logging</li>
            </ul>
          </CardContent>
        </Card>
      );

    case 'error-2':
      return (
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Error Boundary Demo</CardTitle>
            <CardDescription>
              Error boundaries catch JavaScript errors in child components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ErrorBoundary
              onRetry={() => console.log('Retry clicked')}
              fallback={({ error, resetError }) => (
                <ErrorFallback
                  error={error}
                  resetError={resetError}
                  title="Component Error"
                  description="An error occurred in this demo component. Click retry to reset."
                />
              )}
            >
              <BoundaryDemo />
            </ErrorBoundary>
          </CardContent>
        </Card>
      );

    case 'error-3':
      return (
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Toast Notifications</CardTitle>
            <CardDescription>
              Different toast types for various error scenarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ToastDemo />
          </CardContent>
        </Card>
      );

    case 'error-4':
      return (
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Inline Form Validation</CardTitle>
            <CardDescription>
              Show errors directly next to form fields
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <InlineErrorDemo />
            <div className="border-t border-border/50 pt-4">
              <ValidationToastDemo />
            </div>
          </CardContent>
        </Card>
      );

    case 'error-5':
      return (
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Retry Mechanisms</CardTitle>
            <CardDescription>
              Gracefully handle failures with retry functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RetryDemo />
          </CardContent>
        </Card>
      );

    default:
      return null;
  }
}
