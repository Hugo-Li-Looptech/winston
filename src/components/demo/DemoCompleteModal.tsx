import { useDemoMode } from '@/contexts/DemoModeContext';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Award, BookOpen, ArrowRight } from 'lucide-react';

export function DemoCompleteModal() {
  const navigate = useNavigate();
  const { showCompleteModal, dismissCompleteModal, scenarios } = useDemoMode();

  const completedCount = scenarios.filter(s => s.completed).length;
  const totalCount = scenarios.length;

  const patterns = [
    { name: 'Inline Errors', description: 'Contextual field validation' },
    { name: 'Toast Notifications', description: 'Non-blocking alerts' },
    { name: 'Error Boundaries', description: 'Graceful crash recovery' },
    { name: 'Retry Mechanisms', description: 'User-initiated recovery' },
    { name: 'Progress Indicators', description: 'Upload status feedback' },
    { name: 'Conflict Resolution', description: 'Concurrent edit handling' },
  ];

  const handleFinish = () => {
    dismissCompleteModal();
    navigate('/dashboard');
  };

  const handleRestart = () => {
    dismissCompleteModal();
    // The component will re-trigger via Dashboard click
    navigate('/dashboard');
  };

  return (
    <Dialog open={showCompleteModal} onOpenChange={(open) => !open && handleFinish()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <DialogTitle className="text-xl">Demo Complete!</DialogTitle>
              <DialogDescription className="text-sm">
                You've explored {completedCount} of {totalCount} error patterns
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Summary */}
          <div className="p-4 rounded-xl bg-muted/50">
            <p className="text-sm text-foreground mb-3">
              You've experienced real-world error handling patterns that make applications resilient and user-friendly.
            </p>
            
            {/* Patterns learned */}
            <div className="grid grid-cols-2 gap-2">
              {patterns.map((pattern) => (
                <div
                  key={pattern.name}
                  className="flex items-start gap-2 p-2"
                >
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">{pattern.name}</p>
                    <p className="text-xs text-muted-foreground">{pattern.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next steps */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <BookOpen className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-foreground">What's Next?</p>
              <p className="text-xs text-muted-foreground">
                Apply these patterns in your own courses. The same error handling is built into the real course creation flow.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleRestart}>
            Restart Demo
          </Button>
          <Button onClick={handleFinish} className="gap-2">
            Return to Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
