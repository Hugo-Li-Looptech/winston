import { Button } from '@/components/ui/button';
import { StepIndicator } from '@/components/StepIndicator';
import { FileText, MessageSquare, Save, Upload, X } from 'lucide-react';
import { WizardStep } from '@/types/course';

interface CourseEditorHeaderProps {
  currentStep: WizardStep;
  courseTitle?: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
  onStepClick?: (step: WizardStep) => void;
  showActions?: boolean;
}

export function CourseEditorHeader({
  currentStep,
  courseTitle = 'Untitled Course',
  isCollapsed,
  onToggleCollapse,
  onClose,
  onStepClick,
  showActions = true,
}: CourseEditorHeaderProps) {
  return (
    <div className="bg-card border-b px-6 py-3 flex items-center justify-between">
      {/* Left - Step Indicator */}
      <div className="flex items-center gap-4">
        <StepIndicator
          currentStep={currentStep}
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
          onStepClick={onStepClick}
        />
      </div>

      {/* Center - Course Title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
          <FileText className="h-4 w-4 text-primary" />
        </div>
        <span className="font-medium text-foreground">{courseTitle}</span>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        {showActions && (
          <>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              unsaved
            </span>
            <Button variant="ghost" size="sm" className="gap-1">
              <MessageSquare className="h-4 w-4" />
              Comments
            </Button>
            <Button variant="ghost" size="sm" className="gap-1">
              <Save className="h-4 w-4" />
              Save
            </Button>
            <Button variant="default" size="sm" className="gap-1">
              <Upload className="h-4 w-4" />
              Publish
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full ml-2"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
