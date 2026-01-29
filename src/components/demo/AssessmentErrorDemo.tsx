import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InlineError } from '@/components/InlineError';
import { showErrorToast, showWarningToast, showValidationError } from '@/components/ErrorToast';
import { useErrorLogger } from '@/hooks/use-error-logger';
import { Plus, Save, Hash, AlertCircle, Loader2 } from 'lucide-react';

export function AssessmentErrorDemo() {
  const [loading, setLoading] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const { logNetworkError, logValidationError } = useErrorLogger({ component: 'AssessmentErrorDemo' });

  const simulateError = async (type: 'add' | 'save' | 'max' | 'invalid') => {
    setLoading(type);
    setInlineError(null);

    // Simulate API delay
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(null);

    switch (type) {
      case 'add':
        logNetworkError('Unable to add test', { status: 500 });
        showErrorToast("Couldn't add the assessment. Please try again in a moment.");
        setInlineError("Unable to add test. The server rejected the request.");
        break;
      case 'save':
        logNetworkError('Question save failed', { status: 503 });
        showErrorToast("Unable to save this question. Your changes may not be preserved.");
        break;
      case 'max':
        showWarningToast("Maximum of 10 questions per assessment reached. Consider splitting into multiple assessments.");
        break;
      case 'invalid':
        const errors = {
          questionText: 'Question text is required',
          answers: 'At least 2 answer options are required',
          correctAnswer: 'Please mark at least one correct answer',
        };
        logValidationError(errors);
        showValidationError(errors);
        break;
    }
  };

  const clearError = () => setInlineError(null);

  return (
    <Card className="bg-card/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Assessment Error Simulation
        </CardTitle>
        <CardDescription>
          Simulate errors when creating tests and saving questions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            onClick={() => simulateError('add')}
            disabled={loading !== null}
            className="justify-start gap-2"
          >
            {loading === 'add' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add Test (Fails)
          </Button>
          <Button
            variant="outline"
            onClick={() => simulateError('save')}
            disabled={loading !== null}
            className="justify-start gap-2"
          >
            {loading === 'save' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Question (Fails)
          </Button>
          <Button
            variant="outline"
            onClick={() => simulateError('max')}
            disabled={loading !== null}
            className="justify-start gap-2"
          >
            {loading === 'max' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Hash className="h-4 w-4" />
            )}
            Max Questions (Warning)
          </Button>
          <Button
            variant="outline"
            onClick={() => simulateError('invalid')}
            disabled={loading !== null}
            className="justify-start gap-2"
          >
            {loading === 'invalid' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            Invalid Question (Validation)
          </Button>
        </div>

        {inlineError && (
          <InlineError message={inlineError} onRetry={clearError} />
        )}
      </CardContent>
    </Card>
  );
}
