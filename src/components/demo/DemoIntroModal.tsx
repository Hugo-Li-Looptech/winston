import { useDemoMode } from '@/contexts/DemoModeContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GraduationCap, AlertTriangle, Upload, Settings, FileEdit, Eye } from 'lucide-react';

export function DemoIntroModal() {
  const { showIntroModal, dismissIntroModal, exitDemo, getProgress } = useDemoMode();
  const { total } = getProgress();

  const stages = [
    { icon: Upload, label: 'Upload', count: 3 },
    { icon: Settings, label: 'Wizard & Voice', count: 3 },
    { icon: FileEdit, label: 'Scripting', count: 5 },
    { icon: Eye, label: 'Preview', count: 2 },
  ];

  return (
    <Dialog open={showIntroModal} onOpenChange={(open) => !open && exitDemo()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Error Handling Demo</DialogTitle>
              <DialogDescription className="text-sm">
                Interactive learning experience
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            You're about to experience <span className="font-medium text-foreground">{total} error scenarios</span> as 
            you walk through the course creation workflow. Each error is intentional—observe how the app handles failures gracefully.
          </p>

          {/* Stage breakdown */}
          <div className="grid grid-cols-2 gap-2">
            {stages.map((stage) => (
              <div
                key={stage.label}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
              >
                <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center">
                  <stage.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">{stage.label}</p>
                  <p className="text-xs text-muted-foreground">{stage.count} scenarios</p>
                </div>
              </div>
            ))}
          </div>

          {/* Note */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              This is a simulated experience. No real course will be created or affected.
              You can skip any scenario or exit the demo at any time.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={exitDemo}>
            Cancel
          </Button>
          <Button onClick={dismissIntroModal} className="gap-2">
            Start Demo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
