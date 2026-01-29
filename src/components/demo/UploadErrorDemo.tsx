import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InlineError } from '@/components/InlineError';
import { useErrorLogger } from '@/hooks/use-error-logger';
import { Upload, FileX, HardDrive, Clock, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

type ErrorType = 'network' | 'format' | 'size' | 'timeout' | null;

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: ErrorType;
  errorMessage: string;
}

const ERROR_MESSAGES: Record<Exclude<ErrorType, null>, string> = {
  network: 'Unable to upload file. Please check your connection and try again.',
  format: 'This file type is not supported. Please use PDF, PPTX, or DOCX.',
  size: 'File exceeds the 50MB limit. Please compress or split your file.',
  timeout: 'Upload timed out. The server took too long to respond.',
};

export function UploadErrorDemo() {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    errorMessage: '',
  });
  const { logNetworkError } = useErrorLogger({ component: 'UploadErrorDemo' });

  const simulateUpload = async (errorType: ErrorType) => {
    setState({ isUploading: true, progress: 0, error: null, errorMessage: '' });

    // Simulate progress
    for (let i = 0; i <= 60; i += 15) {
      await new Promise((r) => setTimeout(r, 200));
      setState((s) => ({ ...s, progress: i }));
    }

    // Simulate failure
    await new Promise((r) => setTimeout(r, 300));
    
    if (errorType) {
      logNetworkError(ERROR_MESSAGES[errorType], { 
        status: errorType === 'timeout' ? 408 : 500,
        statusText: errorType 
      });
      setState({
        isUploading: false,
        progress: 60,
        error: errorType,
        errorMessage: ERROR_MESSAGES[errorType],
      });
    }
  };

  const handleRetry = () => {
    setState({ isUploading: false, progress: 0, error: null, errorMessage: '' });
  };

  return (
    <Card className="bg-card/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Upload className="h-5 w-5" />
          File Upload Error Simulation
        </CardTitle>
        <CardDescription>
          Click buttons to simulate different upload failure scenarios
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => simulateUpload('network')}
            disabled={state.isUploading}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Failed
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => simulateUpload('format')}
            disabled={state.isUploading}
            className="gap-2"
          >
            <FileX className="h-4 w-4" />
            Wrong Format
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => simulateUpload('size')}
            disabled={state.isUploading}
            className="gap-2"
          >
            <HardDrive className="h-4 w-4" />
            File Too Large
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => simulateUpload('timeout')}
            disabled={state.isUploading}
            className="gap-2"
          >
            <Clock className="h-4 w-4" />
            Upload Timeout
          </Button>
        </div>

        {(state.isUploading || state.error) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {state.isUploading ? 'Uploading...' : 'Upload failed'}
              </span>
              <span className={cn(
                "font-medium",
                state.error ? "text-destructive" : "text-foreground"
              )}>
                {state.progress}%
              </span>
            </div>
            <Progress 
              value={state.progress} 
              className={cn(
                "h-2",
                state.error && "[&>div]:bg-destructive"
              )}
            />
          </div>
        )}

        {state.error && (
          <InlineError
            message={state.errorMessage}
            onRetry={handleRetry}
          />
        )}

        {!state.isUploading && !state.error && (
          <p className="text-sm text-muted-foreground text-center py-2">
            Select an error type above to see the simulation
          </p>
        )}
      </CardContent>
    </Card>
  );
}
