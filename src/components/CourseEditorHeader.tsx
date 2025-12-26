import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StepIndicator } from '@/components/StepIndicator';
import { FileText, MessageSquare, Save, Upload, X, Pencil, Eye, EyeOff } from 'lucide-react';
import { WizardStep } from '@/types/course';
import { toast } from '@/hooks/use-toast';

interface CourseEditorHeaderProps {
  currentStep: WizardStep;
  courseTitle?: string;
  subtitle?: string;
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
  subtitle,
  isCollapsed,
  onToggleCollapse,
  onClose,
  onStepClick,
  showActions = true,
  onTitleChange,
  onComment,
  onSave,
  onPublish,
  hasUnsavedChanges: initialUnsavedChanges = true,
  isEditMode = true,
}: CourseEditorHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(courseTitle);
  const [isSaved, setIsSaved] = useState(!initialUnsavedChanges);
  const [isPublished, setIsPublished] = useState(false);

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

  const handleSave = () => {
    onSave?.();
    setIsSaved(true);
    toast({
      title: 'Course Saved',
      description: 'Your changes have been saved successfully.',
    });
  };

  const handlePublishToggle = () => {
    const newPublishedState = !isPublished;
    setIsPublished(newPublishedState);
    onPublish?.();
    toast({
      title: newPublishedState ? 'Course Published' : 'Course Unpublished',
      description: newPublishedState 
        ? 'Your course is now live and available to learners.'
        : 'The course is no longer visible to learners.',
    });
  };

  return (
    <div className="bg-card/80 backdrop-blur-xl px-6 py-3 flex items-center justify-between shadow-sm dark:shadow-black/20 dark:bg-card/70 transition-all duration-300">
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
          <div className="flex flex-col items-center">
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
            {subtitle && (
              <span className="text-xs text-muted-foreground">{subtitle}</span>
            )}
          </div>
        )}
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        {showActions && (
          <>
            {/* Status Tags */}
            <div className="flex items-center gap-2 mr-2">
              <span className={`text-xs px-2 py-1 rounded ${
                isSaved 
                  ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30' 
                  : 'text-muted-foreground bg-muted'
              }`}>
                {isSaved ? 'saved' : 'unsaved'}
              </span>
              <span className={`text-xs px-2 py-1 rounded ${
                isPublished 
                  ? 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30' 
                  : 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30'
              }`}>
                {isPublished ? 'published' : 'draft'}
              </span>
            </div>
            <Button variant="ghost" size="sm" className="gap-1" onClick={onComment}>
              <MessageSquare className="h-4 w-4" />
              Comments
            </Button>
            <Button variant="ghost" size="sm" className="gap-1" onClick={handleSave}>
              <Save className="h-4 w-4" />
              Save
            </Button>
            <Button 
              variant={isPublished ? "outline" : "default"} 
              size="sm" 
              className="gap-1" 
              onClick={handlePublishToggle}
            >
              {isPublished ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Unpublish
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Publish
                </>
              )}
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