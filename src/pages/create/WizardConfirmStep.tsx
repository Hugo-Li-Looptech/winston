import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCourse } from '@/contexts/CourseContext';
import { Volume2, Check, Play } from 'lucide-react';

interface WizardConfirmStepProps {
  onContinue: () => void;
  onBack: () => void;
}

const voices = [
  {
    id: 'professional-female-us',
    name: 'Professional Female',
    accent: 'US English',
    description: 'Clear and professional voice, ideal for corporate training.',
    tags: ['Professional', 'Clear'],
  },
  {
    id: 'friendly-male-uk',
    name: 'Friendly Male',
    accent: 'British',
    description: 'Warm and approachable voice, great for storytelling.',
    tags: ['Friendly', 'Warm'],
  },
  {
    id: 'energetic-female-au',
    name: 'Energetic Female',
    accent: 'Australian',
    description: 'Upbeat and enthusiastic voice, perfect for motivational content.',
    tags: ['Energetic', 'Upbeat'],
  },
];

export function WizardConfirmStep({ onContinue, onBack }: WizardConfirmStepProps) {
  const { currentCourse, setWizardSettings } = useCourse();
  const [deliveryStyle, setDeliveryStyle] = useState(`Recommended tone: Clear & Confident
Suggested pace: Moderate, with slight pauses after key concepts
Explanatory depth: Level 2 — Balanced detail without overwhelming beginners
Vocabulary mode: General Audience, avoiding jargon
Energy level: Medium, providing clarity without sounding monotonous`);
  const [selectedVoice, setSelectedVoice] = useState(voices[0].id);

  const handleContinue = () => {
    setWizardSettings({
      ...currentCourse.wizardSettings,
      deliveryStyle,
      voiceId: selectedVoice,
    });
    onContinue();
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground">AI Voice Settings</h2>
        <p className="text-muted-foreground mt-2">
          Customize how Winston delivers your content
        </p>
      </div>

      {/* Delivery Style */}
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-foreground">Delivery Style</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Edit how Winston will interact with learners
          </p>
        </div>
        <Textarea
          value={deliveryStyle}
          onChange={(e) => setDeliveryStyle(e.target.value)}
          className="min-h-[160px] rounded-xl resize-none"
        />
      </div>

      {/* Voice Selection */}
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-foreground">Choose Winston's Voice</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Select a voice that best represents the learning experience
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {voices.map((voice) => (
            <div
              key={voice.id}
              onClick={() => setSelectedVoice(voice.id)}
              className={`relative p-4 rounded-xl cursor-pointer transition-all ${
                selectedVoice === voice.id
                  ? 'bg-primary/10 border-2 border-primary'
                  : 'bg-card border-2 border-transparent hover:border-muted-foreground/30'
              }`}
            >
              {selectedVoice === voice.id && (
                <div className="absolute top-3 right-3">
                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                </div>
              )}
              
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
                <Volume2 className="h-5 w-5 text-muted-foreground" />
              </div>
              
              <p className="font-medium text-foreground">{voice.name}</p>
              <p className="text-xs text-muted-foreground mb-2">{voice.accent}</p>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{voice.description}</p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {voice.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              <Button variant="outline" size="sm" className="w-full rounded-lg gap-2">
                <Play className="h-3 w-3" />
                Preview
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="rounded-xl">
          Back
        </Button>
        <Button onClick={handleContinue} size="lg" className="rounded-xl px-8">
          Generate Talk Points
        </Button>
      </div>
    </div>
  );
}
