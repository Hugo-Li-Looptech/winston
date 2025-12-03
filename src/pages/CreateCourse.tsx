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

export default function CreateCourse() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setCurrentStep } = useCourse();
  const isPreviewOnly = searchParams.get('mode') === 'preview';
  const [subStep, setSubStep] = useState<SubStep>(isPreviewOnly ? 'preview' : 'upload');
  const [isStepIndicatorCollapsed, setIsStepIndicatorCollapsed] = useState(false);

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

  const handleClose = () => {
    navigate('/dashboard');
  };

  const handleStepClick = (step: WizardStepType) => {
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