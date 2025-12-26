import { WizardStep } from '@/types/course';
import { ChevronDown, ChevronUp, Lock } from 'lucide-react';

interface CompletedSteps {
  upload: boolean;
  wizard: boolean;
  scripting: boolean;
}

interface StepIndicatorProps {
  currentStep: WizardStep;
  onStepClick?: (step: WizardStep) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  completedSteps?: CompletedSteps;
  isEditMode?: boolean; // When true, all steps are accessible
}

const steps: { key: WizardStep; label: string }[] = [
  { key: 'upload', label: 'Upload' },
  { key: 'wizard', label: 'Wizard' },
  { key: 'scripting', label: 'Scripting' },
  { key: 'preview', label: 'Preview' },
];

export function StepIndicator({ 
  currentStep, 
  onStepClick, 
  isCollapsed = false,
  onToggleCollapse,
  completedSteps = { upload: false, wizard: false, scripting: false },
  isEditMode = false
}: StepIndicatorProps) {
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  const isStepAccessible = (stepKey: WizardStep): boolean => {
    // In edit mode, all steps are accessible
    if (isEditMode) return true;
    
    const stepIndex = steps.findIndex((s) => s.key === stepKey);
    
    // Always allow going to previous steps
    if (stepIndex <= currentIndex) return true;
    
    // For future steps, check if prerequisites are completed
    switch (stepKey) {
      case 'upload':
        return true;
      case 'wizard':
        return completedSteps.upload;
      case 'scripting':
        return completedSteps.upload && completedSteps.wizard;
      case 'preview':
        return completedSteps.upload && completedSteps.wizard && completedSteps.scripting;
      default:
        return false;
    }
  };

  if (isCollapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full px-4 py-2 transition-all hover:bg-card"
        aria-label="Expand step navigator"
      >
        {steps.map((step, index) => {
          const accessible = isStepAccessible(step.key);
          const isActive = index <= currentIndex;

          return (
            <div
              key={step.key}
              onClick={(e) => {
                e.stopPropagation();
                if (accessible) onStepClick?.(step.key);
              }}
              title={step.label}
              className={accessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}
              aria-label={accessible ? `Go to ${step.label}` : `${step.label} locked`}
              role="button"
            >
              <div
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  isActive
                    ? 'bg-primary'
                    : accessible
                      ? 'bg-muted-foreground/30'
                      : 'bg-muted-foreground/10'
                }`}
              />
            </div>
          );
        })}
        <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
      </button>
    );
  }

  return (
    <button
      onClick={onToggleCollapse}
      className="flex items-center gap-0 bg-card/80 backdrop-blur-sm rounded-full px-4 py-2 transition-all hover:bg-card"
    >
      {steps.map((step, index) => {
        const accessible = isStepAccessible(step.key);
        const isLocked = !accessible && index > currentIndex;
        
        return (
          <div key={step.key} className="flex items-center">
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (accessible) {
                  onStepClick?.(step.key);
                }
              }}
              className={`flex flex-col items-center gap-1.5 ${
                accessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              }`}
            >
              <div
                className={`h-3 w-3 rounded-full flex items-center justify-center transition-all ${
                  index <= currentIndex 
                    ? 'bg-primary' 
                    : accessible
                      ? 'bg-muted-foreground/20'
                      : 'bg-muted-foreground/10'
                }`}
              >
                {isLocked ? (
                  <Lock className="h-2 w-2 text-muted-foreground" />
                ) : index < currentIndex ? (
                  <div className="h-1.5 w-1.5 bg-primary-foreground rounded-full" />
                ) : null}
              </div>
              <span className={`text-xs font-medium transition-colors ${
                index <= currentIndex 
                  ? 'text-foreground' 
                  : accessible
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground/50'
              }`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 w-8 mx-2 mb-4 rounded-full transition-colors ${
                  index < currentIndex 
                    ? 'bg-primary' 
                    : 'bg-muted-foreground/20'
                }`}
              />
            )}
          </div>
        );
      })}
      <ChevronUp className="h-4 w-4 text-muted-foreground ml-2" />
    </button>
  );
}
