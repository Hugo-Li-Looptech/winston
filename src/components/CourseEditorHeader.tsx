import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StepIndicator } from '@/components/StepIndicator';
import { FileText, MessageSquare, Save, Upload, X, Pencil } from 'lucide-react';
import { WizardStep } from '@/types/course';

interface CourseEditorHeaderProps {
  currentStep: WizardStep;
  courseTitle?: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
  onStepClick?: (step: WizardStep) => void;
  showActions?: boolean;
  onTitleChange?: (title: string) => void;
  onComment?: () => void;
  onSave?: () => void;
  onPublish?: () => void;
  hasUnsavedChanges?: boolean;
  isEditMode?: boolean;
}

export function CourseEditorHeader({
  currentStep,
  courseTitle = 'Untitled Course',
  isCollapsed,
  onToggleCollapse,
  onClose,
  onStepClick,
  showActions = true,
  onTitleChange,
  onComment,
  onSave,
  onPublish,
  hasUnsavedChanges = true,
  isEditMode = true, // Default to true since this header is typically used when editing
}: CourseEditorHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(courseTitle);

  const handleSaveTitle = () => {
    if (onTitleChange) {
      onTitleChange(editedTitle);
    }
    setIsEditingTitle(false);
  };

  const handleStartEdit = () => {
    setEditedTitle(courseTitle);
    setIsEditingTitle(true);
  };

  return (
    <div className="bg-card border-b px-6 py-3 flex items-center justify-between">
      {/* Left - Step Indicator */}
      <div className="flex items-center gap-4">
        <StepIndicator
          currentStep={currentStep}
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
          onStepClick={onStepClick}
          isEditMode={isEditMode}
        />
      </div>

      {/* Center - Course Title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
          <FileText className="h-4 w-4 text-primary" />
        </div>
        {isEditingTitle ? (
          <Input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
            className="w-64 font-medium"
            autoFocus
          />
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{courseTitle}</span>
            {onTitleChange && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleStartEdit}
              >
                <Pencil className="h-3 w-3 text-muted-foreground" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        {showActions && (
          <>
            {hasUnsavedChanges && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                unsaved
              </span>
            )}
            <Button variant="ghost" size="sm" className="gap-1" onClick={onComment}>
              <MessageSquare className="h-4 w-4" />
              Comments
            </Button>
            <Button variant="ghost" size="sm" className="gap-1" onClick={onSave}>
              <Save className="h-4 w-4" />
              Save
            </Button>
            <Button variant="default" size="sm" className="gap-1" onClick={onPublish}>
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