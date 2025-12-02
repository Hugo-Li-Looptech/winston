import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCourse } from '@/contexts/CourseContext';
import { Volume2, Check } from 'lucide-react';

interface WizardConfirmStepProps {
  onContinue: () => void;
  onBack: () => void;
}

const voices = [
  {
    id: 'professional-female-us',
    name: 'Professional Female US',
    gender: 'Female',
    accent: 'US English',
    description: 'Clear and professional voice, ideal for corporate training and technical content.',
    tags: ['Professional', 'Clear', 'Authoritative'],
  },
  {
    id: 'friendly-male-uk',
    name: 'Friendly Male UK',
    gender: 'Male',
    accent: 'British English',
    description: 'Warm and approachable voice with a British accent, great for storytelling.',
    tags: ['Friendly', 'Warm', 'Engaging'],
  },
  {
    id: 'energetic-female-au',
    name: 'Energetic Female AU',
    gender: 'Female',
    accent: 'Australian',
    description: 'Upbeat and enthusiastic voice, perfect for motivational and sales training.',
    tags: ['Energetic', 'Upbeat', 'Motivating'],
  },
];

export function WizardConfirmStep({ onContinue, onBack }: WizardConfirmStepProps) {
  const { currentCourse, setWizardSettings } = useCourse();
  const [deliveryStyle, setDeliveryStyle] = useState(`"Recommended tone: Clear & Confident, optimized for maintaining learner attention."
"Suggested pace: Moderate, with slight pauses after key concepts."
"Explanatory depth set to: Level 2 — Balanced detail without overwhelming beginners."
"Vocabulary mode: General Audience, avoiding jargon unless necessary."
"Engagement pattern: Concept → Example → Summary, repeated per slide."
"Energy level: Medium, providing clarity without sounding monotonous."
"Structure preference: Linear flow, emphasizing smooth transitions between slides."
"Clarity boost enabled: Yes, simplifying complex terms automatically."
"Voice persona: Neutral Professional, adapted for mixed experience levels."`);
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
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Recommended Presentation Style</h2>
        <p className="text-muted-foreground mt-2">
          Please make edits to the delivery style & choose the desired voice to your liking.
        </p>
      </div>

      {/* Delivery Style */}
      <div className="border-2 border-foreground p-6 space-y-4">
        <div className="flex items-start gap-4">
          <span className="font-semibold">1.</span>
          <div className="flex-1">
            <h3 className="font-semibold">Delivery Style</h3>
            <p className="text-sm text-muted-foreground">
              Please edit how Winston would interact with the user during QA mode and chat mode.
            </p>
          </div>
        </div>
        <Textarea
          value={deliveryStyle}
          onChange={(e) => setDeliveryStyle(e.target.value)}
          className="min-h-[200px] font-mono text-sm"
        />
      </div>

      {/* Voice Selection */}
      <div className="border-2 border-foreground p-6 space-y-4">
        <div className="flex items-start gap-4">
          <span className="font-semibold">2.</span>
          <div className="flex-1">
            <h3 className="font-semibold">Choose Winston's Voice</h3>
            <p className="text-sm text-muted-foreground">
              Select a voice that best represent the desired learning experience
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {voices.map((voice) => (
            <div
              key={voice.id}
              onClick={() => setSelectedVoice(voice.id)}
              className={`border-2 cursor-pointer p-4 transition-all ${
                selectedVoice === voice.id
                  ? 'border-foreground bg-secondary shadow-sm'
                  : 'border-muted hover:border-foreground'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 bg-primary/10 flex items-center justify-center">
                  <Volume2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{voice.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {voice.gender} • {voice.accent}
                  </p>
                </div>
                {selectedVoice === voice.id && (
                  <Check className="h-4 w-4 ml-auto text-primary" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-2">{voice.description}</p>
              <div className="flex flex-wrap gap-1">
                {voice.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-secondary px-2 py-0.5 border border-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3">
                <Volume2 className="h-3 w-3 mr-1" />
                Preview Voice
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Button variant="outline">Browse More</Button>
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
