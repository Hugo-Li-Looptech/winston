import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCourse } from '@/contexts/CourseContext';
import { ChevronRight } from 'lucide-react';

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
  const { currentCourse, setWizardSettings } = useCourse();
  const [settings, setSettings] = useState(currentCourse.wizardSettings);

  const toggleAudience = (type: string) => {
    const updated = settings.audienceTypes.includes(type)
      ? settings.audienceTypes.filter((t) => t !== type)
      : [...settings.audienceTypes, type];
    setSettings({ ...settings, audienceTypes: updated });
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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Set-up Wizard</h2>
        <p className="text-muted-foreground mt-2">
          Let Winston learn more about the Target Audience to enhance the user experience.
        </p>
        <p className="text-sm text-muted-foreground">
          Set up Learning level, Audience Type, and Learning Goals to tailor-made the delivery and tone of Winston.
        </p>
      </div>

      {/* Learning Level */}
      <div className="border-2 border-foreground p-6 space-y-4">
        <div className="flex items-start gap-4">
          <span className="font-semibold">1.</span>
          <div className="flex-1">
            <h3 className="font-semibold">Choose Learning Level</h3>
            <p className="text-sm text-muted-foreground">
              Adjusts Winston's teaching depth and explanation style.
            </p>
          </div>
          <Select
            value={settings.learningLevel}
            onValueChange={(value) => setSettings({ ...settings, learningLevel: value })}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select a Learning Level" />
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
      <div className="border-2 border-foreground p-6 space-y-4">
        <div className="flex items-start gap-4">
          <span className="font-semibold">2.</span>
          <div className="flex-1">
            <h3 className="font-semibold">Intended Audience Type</h3>
            <p className="text-sm text-muted-foreground">
              Helps Winston choose the right tone and examples for your learners.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 ml-8">
          {audienceTypes.map((type) => (
            <div key={type} className="flex items-center gap-2">
              <Checkbox
                id={`audience-${type}`}
                checked={settings.audienceTypes.includes(type)}
                onCheckedChange={() => toggleAudience(type)}
              />
              <Label htmlFor={`audience-${type}`} className="text-sm cursor-pointer">
                {type}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Goals */}
      <div className="border-2 border-foreground p-6 space-y-4">
        <div className="flex items-start gap-4">
          <span className="font-semibold">3.</span>
          <div className="flex-1">
            <h3 className="font-semibold">Learning Goals</h3>
            <p className="text-sm text-muted-foreground">
              Ensures Winston focuses on the outcomes you care about most.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 ml-8">
          {learningGoals.map((goal) => (
            <div key={goal} className="flex items-center gap-2">
              <Checkbox
                id={`goal-${goal}`}
                checked={settings.learningGoals.includes(goal)}
                onCheckedChange={() => toggleGoal(goal)}
              />
              <Label htmlFor={`goal-${goal}`} className="text-sm cursor-pointer">
                {goal}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={onBack} className="w-32">
          Back
        </Button>
        <Button onClick={handleContinue} className="w-32">
          Continue
        </Button>
      </div>
    </div>
  );
}
