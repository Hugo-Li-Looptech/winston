import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StepIndicator } from '@/components/StepIndicator';
import { UploadStep } from './create/UploadStep';
import { WizardStep } from './create/WizardStep';
import { WizardConfirmStep } from './create/WizardConfirmStep';
import { ScriptingStep } from './create/ScriptingStep';
import { PreviewStep } from './create/PreviewStep';
import { AIAssistant } from '@/components/AIAssistant';
import { useCourse } from '@/contexts/CourseContext';
import { WizardStep as WizardStepType } from '@/types/course';

type SubStep = 'upload' | 'wizard-input' | 'wizard-confirm' | 'scripting' | 'preview';

// Map URL step param to SubStep
const stepParamToSubStep = (stepParam: string | null): SubStep | null => {
  switch (stepParam) {
    case 'upload':
      return 'upload';
    case 'wizard':
      return 'wizard-input';
    case 'scripting':
      return 'scripting';
    case 'preview':
      return 'preview';
    default:
      return null;
  }
};

export default function CreateCourse() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentCourse, completedSteps } = useCourse();
  const mode = searchParams.get('mode');
  const stepParam = searchParams.get('step');
  const isPreviewOnly = mode === 'preview';
  const isEditMode = mode === 'edit';
  
  // Determine initial subStep based on URL params
  const getInitialSubStep = (): SubStep => {
    if (isPreviewOnly) return 'preview';
    if (isEditMode && stepParam) {
      const mappedStep = stepParamToSubStep(stepParam);
      if (mappedStep) return mappedStep;
    }
    return 'upload';
  };
  
  const [subStep, setSubStep] = useState<SubStep>(getInitialSubStep);
  const [isStepIndicatorCollapsed, setIsStepIndicatorCollapsed] = useState(false);

  // Sync subStep with URL mode changes
  useEffect(() => {
    if (mode === 'preview') {
      setSubStep('preview');
    } else if (mode === 'edit' && stepParam) {
      const mappedStep = stepParamToSubStep(stepParam);
      if (mappedStep) setSubStep(mappedStep);
    }
  }, [mode, stepParam]);

  const getWizardStep = (): WizardStepType => {
    switch (subStep) {
      case 'upload':
        return 'upload';
      case 'wizard-input':
      case 'wizard-confirm':
        return 'wizard';
      case 'scripting':
        return 'scripting';
      case 'preview':
        return 'preview';
      default:
        return 'upload';
    }
  };

  // Check if a step is accessible (for new courses, must complete in sequence)
  const isStepAccessible = (step: WizardStepType): boolean => {
    // In edit mode (existing course), all steps are accessible
    if (isEditMode) return true;
    
    const stepOrder: WizardStepType[] = ['upload', 'wizard', 'scripting', 'preview'];
    const targetIndex = stepOrder.indexOf(step);
    const currentStepIndex = stepOrder.indexOf(getWizardStep());
    
    // Always allow going to previous steps
    if (targetIndex <= currentStepIndex) return true;
    
    // For future steps, check if prerequisites are completed
    switch (step) {
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

  const handleClose = () => {
    navigate('/dashboard');
  };

  const handleStepClick = (step: WizardStepType) => {
    // Check if step is accessible before navigating
    if (!isStepAccessible(step)) return;
    
    switch (step) {
      case 'upload':
        setSubStep('upload');
        break;
      case 'wizard':
        setSubStep('wizard-input');
        break;
      case 'scripting':
        setSubStep('scripting');
        break;
      case 'preview':
        setSubStep('preview');
        break;
    }
  };

  const isFullWidthStep = subStep === 'scripting' || subStep === 'preview';
  const hideMainHeader = subStep === 'scripting';

  const renderStep = () => {
    switch (subStep) {
      case 'upload':
        return <UploadStep onContinue={() => setSubStep('wizard-input')} />;
      case 'wizard-input':
        return (
          <WizardStep
            onContinue={() => setSubStep('wizard-confirm')}
            onBack={() => setSubStep('upload')}
          />
        );
      case 'wizard-confirm':
        return (
          <WizardConfirmStep
            onContinue={() => setSubStep('scripting')}
            onBack={() => setSubStep('wizard-input')}
          />
        );
      case 'scripting':
        return (
          <ScriptingStep
            onContinue={() => setSubStep('preview')}
            onBack={() => setSubStep('wizard-confirm')}
            onStepClick={handleStepClick}
          />
        );
      case 'preview':
        return (
          <PreviewStep 
            onBack={() => {
              if (isPreviewOnly) {
                navigate('/dashboard');
              } else {
                setSubStep('scripting');
              }
            }} 
            isPreviewOnly={isPreviewOnly} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      {/* Header with Step Indicator - hidden for scripting step */}
      {!hideMainHeader && (
        <div className="bg-card border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <StepIndicator 
              currentStep={getWizardStep()} 
              isCollapsed={isStepIndicatorCollapsed}
              onToggleCollapse={() => setIsStepIndicatorCollapsed(!isStepIndicatorCollapsed)}
              onStepClick={handleStepClick}
              completedSteps={completedSteps}
              isEditMode={isEditMode}
            />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={handleClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {isFullWidthStep ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 bg-card border-t overflow-hidden">
            {renderStep()}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="bg-card rounded-2xl shadow-lg border p-8">
              {renderStep()}
            </div>
          </div>
        </div>
      )}

      <AIAssistant />
    </div>
  );
}
