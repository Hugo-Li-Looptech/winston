import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { showErrorToast, showWarningToast, showServerError } from '@/components/ErrorToast';
import { useErrorLogger } from '@/hooks/use-error-logger';
import { Save, Rocket, FileText, GitBranch, Loader2 } from 'lucide-react';

export function SavePublishErrorDemo() {
  const [loading, setLoading] = useState<string | null>(null);
  const { logNetworkError } = useErrorLogger({ component: 'SavePublishErrorDemo' });

  const simulateError = async (type: 'autosave' | 'publish' | 'draft' | 'conflict') => {
    setLoading(type);

    // Simulate operation delay
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(null);

    switch (type) {
      case 'autosave':
        logNetworkError('Auto-save failed', { status: 503 });
        showWarningToast("Auto-save interrupted. Click 'Save' manually to preserve your work.");
        break;
      case 'publish':
        logNetworkError('Publish failed', { status: 500 });
        showServerError(500);
        showErrorToast("Publishing failed due to a server error. Please try again.");
        break;
      case 'draft':
        logNetworkError('Draft save failed', { status: 503 });
        showErrorToast("Unable to save draft. Please check your connection and try again.");
        break;
      case 'conflict':
        logNetworkError('Version conflict', { status: 409 });
        showWarningToast("Version conflict detected. Someone else may have edited this course. Please refresh to see the latest changes.");
        break;
    }
  };

  return (
    <Card className="bg-card/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Save className="h-5 w-5" />
          Save & Publish Error Simulation
        </CardTitle>
        <CardDescription>
          Simulate failures during course save and publish operations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => simulateError('autosave')}
            disabled={loading !== null}
            className="gap-2"
          >
            {loading === 'autosave' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Auto-Save Failed
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => simulateError('publish')}
            disabled={loading !== null}
            className="gap-2"
          >
            {loading === 'publish' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Rocket className="h-4 w-4" />
            )}
            Publish Failed
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => simulateError('draft')}
            disabled={loading !== null}
            className="gap-2"
          >
            {loading === 'draft' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            Draft Save Failed
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => simulateError('conflict')}
            disabled={loading !== null}
            className="gap-2"
          >
            {loading === 'conflict' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GitBranch className="h-4 w-4" />
            )}
            Version Conflict
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground text-center mt-4">
          Each button simulates a loading state then shows appropriate error feedback
        </p>
      </CardContent>
    </Card>
  );
}
