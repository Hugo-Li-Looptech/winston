import { WizardStep } from '@/types/course';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: WizardStep;
  onStepClick?: (step: WizardStep) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
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
  onToggleCollapse 
}: StepIndicatorProps) {
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  if (isCollapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="flex items-center gap-2 bg-card/80 backdrop-blur-sm shadow-sm rounded-full px-4 py-2 transition-all hover:shadow-md"
      >
        {steps.map((step, index) => (
          <div
            key={step.key}
            className={`h-2.5 w-2.5 rounded-full transition-colors ${
              index <= currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
            }`}
          />
        ))}
        <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
      </button>
    );
  }

  return (
    <button
      onClick={onToggleCollapse}
      className="flex items-center gap-0 bg-card/80 backdrop-blur-sm shadow-sm rounded-full px-6 py-3 transition-all hover:shadow-md"
    >
      {steps.map((step, index) => (
        <div key={step.key} className="flex items-center">
          <div
            onClick={(e) => {
              e.stopPropagation();
              onStepClick?.(step.key);
            }}
            className="flex flex-col items-center gap-1.5 cursor-pointer"
          >
            <div
              className={`h-4 w-4 rounded-full flex items-center justify-center transition-all ${
                index <= currentIndex 
                  ? 'bg-primary' 
                  : 'bg-muted-foreground/20'
              }`}
            >
              {index < currentIndex && (
                <div className="h-1.5 w-1.5 bg-primary-foreground rounded-full" />
              )}
            </div>
            <span className={`text-xs font-medium transition-colors ${
              index <= currentIndex ? 'text-foreground' : 'text-muted-foreground'
            }`}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`h-0.5 w-12 mx-3 mb-5 rounded-full transition-colors ${
                index < currentIndex ? 'bg-primary' : 'bg-muted-foreground/20'
              }`}
            />
          )}
        </div>
      ))}
      <ChevronUp className="h-4 w-4 text-muted-foreground ml-2" />
    </button>
  );
}