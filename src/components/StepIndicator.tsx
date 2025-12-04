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
        className="flex items-center gap-2 bg-card/80 backdrop-blur-sm shadow-sm rounded-full px-4 py-2 transition-all hover:shadow-md"
      >
        {steps.map((step, index) => {
          const accessible = isStepAccessible(step.key);
          return (
            <div
              key={step.key}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                index <= currentIndex 
                  ? 'bg-primary' 
                  : accessible 
                    ? 'bg-muted-foreground/30' 
                    : 'bg-muted-foreground/10'
              }`}
            />
          );
        })}
        <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
      </button>
    );
  }

  return (
    <button
      onClick={onToggleCollapse}
      className="flex items-center gap-0 bg-card/80 backdrop-blur-sm shadow-sm rounded-full px-6 py-3 transition-all hover:shadow-md"
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
                className={`h-4 w-4 rounded-full flex items-center justify-center transition-all ${
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
                className={`h-0.5 w-12 mx-3 mb-5 rounded-full transition-colors ${
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
