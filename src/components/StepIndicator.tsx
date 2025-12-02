import { WizardStep } from '@/types/course';

interface StepIndicatorProps {
  currentStep: WizardStep;
  onStepClick?: (step: WizardStep) => void;
}

const steps: { key: WizardStep; label: string }[] = [
  { key: 'upload', label: 'Upload' },
  { key: 'wizard', label: 'Wizard' },
  { key: 'scripting', label: 'Scripting' },
  { key: 'preview', label: 'Preview' },
];

export function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-center gap-0 bg-card border-2 border-foreground p-4 mx-auto w-fit">
      {steps.map((step, index) => (
        <div key={step.key} className="flex items-center">
          <button
            onClick={() => onStepClick?.(step.key)}
            disabled={!onStepClick}
            className="flex flex-col items-center gap-2"
          >
            <div
              className={`h-5 w-5 rounded-full border-2 border-foreground flex items-center justify-center transition-colors ${
                index <= currentIndex ? 'bg-foreground' : 'bg-background'
              }`}
            >
              {index < currentIndex && (
                <div className="h-2 w-2 bg-background rounded-full" />
              )}
            </div>
            <span className="text-xs font-medium">{step.label}</span>
          </button>
          {index < steps.length - 1 && (
            <div
              className={`h-0.5 w-16 mx-2 mb-6 ${
                index < currentIndex ? 'bg-foreground' : 'bg-muted'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
