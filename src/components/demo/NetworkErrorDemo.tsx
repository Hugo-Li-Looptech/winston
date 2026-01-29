import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InlineError } from '@/components/InlineError';
import { showErrorToast, showNetworkError, showServerError } from '@/components/ErrorToast';
import { useErrorLogger } from '@/hooks/use-error-logger';
import { Wifi, WifiOff, Clock, Server, ShieldAlert, Loader2, RefreshCw } from 'lucide-react';

export function NetworkErrorDemo() {
  const [loading, setLoading] = useState<string | null>(null);
  const [lastError, setLastError] = useState<{ type: string; message: string } | null>(null);
  const { logNetworkError } = useErrorLogger({ component: 'NetworkErrorDemo' });

  const simulateError = async (type: 'offline' | 'timeout' | 'server503' | 'rate429') => {
    setLoading(type);
    setLastError(null);

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(null);

    switch (type) {
      case 'offline':
        logNetworkError('Connection lost', { status: 0 });
        showNetworkError();
        setLastError({ type: 'offline', message: 'You appear to be offline. Reconnect to continue.' });
        break;
      case 'timeout':
        logNetworkError('Request timeout', { status: 408 });
        showErrorToast("The request took too long. Please try again.");
        setLastError({ type: 'timeout', message: 'Request timed out after 30 seconds.' });
        break;
      case 'server503':
        logNetworkError('Service unavailable', { status: 503 });
        showServerError(503);
        setLastError({ type: 'server', message: 'Server is temporarily unavailable. Please try again later.' });
        break;
      case 'rate429':
        logNetworkError('Rate limited', { status: 429 });
        showErrorToast("Too many requests. Please wait a moment before trying again.");
        setLastError({ type: 'rate', message: 'Rate limited: 60 requests per minute exceeded.' });
        break;
    }
  };

  const clearError = () => setLastError(null);

  return (
    <Card className="bg-card/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Wifi className="h-5 w-5" />
          Network Error Simulation
        </CardTitle>
        <CardDescription>
          Simulate various network and server error scenarios
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => simulateError('offline')}
            disabled={loading !== null}
            className="gap-2"
          >
            {loading === 'offline' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <WifiOff className="h-4 w-4" />
            )}
            Connection Lost
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => simulateError('timeout')}
            disabled={loading !== null}
            className="gap-2"
          >
            {loading === 'timeout' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
            Request Timeout
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => simulateError('server503')}
            disabled={loading !== null}
            className="gap-2"
          >
            {loading === 'server503' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Server className="h-4 w-4" />
            )}
            Server 503
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => simulateError('rate429')}
            disabled={loading !== null}
            className="gap-2"
          >
            {loading === 'rate429' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldAlert className="h-4 w-4" />
            )}
            Rate Limited 429
          </Button>
        </div>

        {lastError && (
          <InlineError message={lastError.message} onRetry={clearError} />
        )}

        {!loading && !lastError && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2">
            <RefreshCw className="h-4 w-4" />
            <span>Click a button to simulate a network error</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
