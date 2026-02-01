import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCourse } from '@/contexts/CourseContext';
import { useDemoError } from '@/hooks/use-demo-error';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardStepProps {
  onContinue: () => void;
  onBack: () => void;
}

const learningLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const audienceTypes = [
  'Internal Employees',
  'Non-Technical Team',
  'External Partners',
  'New Hires',
  'Students',
  'General Audience',
  'Technical Team',
  'Managers/Supervisors',
  'Others',
];

const learningGoals = [
  'Understand Key Concepts',
  'Follow Guidelines',
  'Explore Technical Details',
  'Retain Information',
  'Improve Performance',
  'Learn New Skills',
  'Onboarding',
  'Others',
];

export function WizardStep({ onContinue, onBack }: WizardStepProps) {
  const { currentCourse, setWizardSettings, setCourseTitle, markStepComplete } = useCourse();
  const { isActive: isDemoMode, triggerPrefSaveError } = useDemoError();
  const { getHighlightedCTA } = useDemoMode();
  const highlightTarget = isDemoMode ? getHighlightedCTA() : null;
  const [settings, setSettings] = useState(currentCourse.wizardSettings);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(currentCourse.courseTitle);
  const [demoAudienceToggleCount, setDemoAudienceToggleCount] = useState(0);

  const toggleAudience = async (type: string) => {
    const updated = settings.audienceTypes.includes(type)
      ? settings.audienceTypes.filter((t) => t !== type)
      : [...settings.audienceTypes, type];
    setSettings({ ...settings, audienceTypes: updated });

    // Demo mode: trigger pref save error on first toggle
    if (isDemoMode && demoAudienceToggleCount === 0) {
      setDemoAudienceToggleCount(1);
      await triggerPrefSaveError();
    }
  };

  const toggleGoal = (goal: string) => {
    const updated = settings.learningGoals.includes(goal)
      ? settings.learningGoals.filter((g) => g !== goal)
      : [...settings.learningGoals, goal];
    setSettings({ ...settings, learningGoals: updated });
  };

  const handleContinue = () => {
    setWizardSettings(settings);
    onContinue();
  };

  const handleSaveTitle = () => {
    setCourseTitle(editedTitle);
    setIsEditingTitle(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Course Title Display */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          {isEditingTitle ? (
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
              className="max-w-md text-center text-2xl font-semibold"
              autoFocus
            />
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-foreground">
                {currentCourse.courseTitle || 'Untitled Course'}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setEditedTitle(currentCourse.courseTitle);
                  setIsEditingTitle(true);
                }}
              >
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </Button>
            </>
          )}
        </div>
        <p className="text-muted-foreground mt-2">
          Help Winston understand your target audience for better content delivery
        </p>
      </div>

      {/* Learning Level */}
      <div className="bg-muted/30 rounded-xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-medium text-foreground">Learning Level</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Adjusts Winston's teaching depth and explanation style
            </p>
          </div>
          <Select
            value={settings.learningLevel}
            onValueChange={(value) => setSettings({ ...settings, learningLevel: value })}
          >
            <SelectTrigger className="w-48 rounded-lg">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {learningLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Audience Type */}
      <div className="bg-muted/30 rounded-xl p-6 space-y-4">
        <div>
          <h3 className="font-medium text-foreground">Target Audience</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Helps Winston choose the right tone and examples
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {audienceTypes.map((type, index) => (
            <div
              key={type}
              onClick={() => toggleAudience(type)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all",
                settings.audienceTypes.includes(type)
                  ? 'bg-primary/10 border-2 border-primary'
                  : 'bg-card border-2 border-transparent hover:border-muted-foreground/30',
                index === 0 && highlightTarget === 'audience-checkbox' && "demo-highlight"
              )}
            >
              <Checkbox
                id={`audience-${type}`}
                checked={settings.audienceTypes.includes(type)}
                className="pointer-events-none"
              />
              <Label htmlFor={`audience-${type}`} className="text-sm cursor-pointer flex-1">
                {type}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Goals */}
      <div className="bg-muted/30 rounded-xl p-6 space-y-4">
        <div>
          <h3 className="font-medium text-foreground">Learning Goals</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Ensures Winston focuses on the outcomes you care about
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {learningGoals.map((goal) => (
            <div
              key={goal}
              onClick={() => toggleGoal(goal)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                settings.learningGoals.includes(goal)
                  ? 'bg-primary/10 border-2 border-primary'
                  : 'bg-card border-2 border-transparent hover:border-muted-foreground/30'
              }`}
            >
              <Checkbox
                id={`goal-${goal}`}
                checked={settings.learningGoals.includes(goal)}
                className="pointer-events-none"
              />
              <Label htmlFor={`goal-${goal}`} className="text-sm cursor-pointer flex-1">
                {goal}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="rounded-xl">
          Back
        </Button>
        <Button onClick={handleContinue} size="lg" className="rounded-xl px-8">
          Continue
        </Button>
      </div>
    </div>
  );
}
