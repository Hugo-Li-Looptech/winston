import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCourse } from '@/contexts/CourseContext';
import { Volume2, Check, Play, Loader2, Pause } from 'lucide-react';
import { useVoices, Voice } from '@/hooks/api';

interface WizardConfirmStepProps {
  onContinue: () => void;
  onBack: () => void;
}

// Fallback voices if API is unavailable
const fallbackVoices: Voice[] = [
  {
    id: 'professional-female-us',
    name: 'Professional Female',
    provider: 'elevenlabs',
    language: 'en-US',
    gender: 'female',
    description: 'Clear and professional voice, ideal for corporate training.',
  },
  {
    id: 'friendly-male-uk',
    name: 'Friendly Male',
    provider: 'elevenlabs',
    language: 'en-GB',
    gender: 'male',
    description: 'Warm and approachable voice, great for storytelling.',
  },
  {
    id: 'energetic-female-au',
    name: 'Energetic Female',
    provider: 'azure',
    language: 'en-AU',
    gender: 'female',
    description: 'Upbeat and enthusiastic voice, perfect for motivational content.',
  },
];

export function WizardConfirmStep({ onContinue, onBack }: WizardConfirmStepProps) {
  const { currentCourse, setWizardSettings } = useCourse();
  const [deliveryStyle, setDeliveryStyle] = useState(`Recommended tone: Clear & Confident
Suggested pace: Moderate, with slight pauses after key concepts
Explanatory depth: Level 2 — Balanced detail without overwhelming beginners
Vocabulary mode: General Audience, avoiding jargon
Energy level: Medium, providing clarity without sounding monotonous`);

  // Fetch voices from API
  const { data: apiVoices, isLoading: isLoadingVoices } = useVoices();
  const voices = apiVoices && apiVoices.length > 0 ? apiVoices : fallbackVoices;

  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Set default voice when voices load
  useEffect(() => {
    if (voices.length > 0 && !selectedVoice) {
      setSelectedVoice(voices[0].id);
    }
  }, [voices, selectedVoice]);

  // Handle voice preview playback
  const handlePreview = (voice: Voice) => {
    if (playingVoiceId === voice.id) {
      // Stop current playback
      audioRef.current?.pause();
      setPlayingVoiceId(null);
      return;
    }

    // Stop any current playback
    audioRef.current?.pause();

    if (voice.previewUrl) {
      audioRef.current = new Audio(voice.previewUrl);
      audioRef.current.onended = () => setPlayingVoiceId(null);
      audioRef.current.play();
      setPlayingVoiceId(voice.id);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

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

        {isLoadingVoices ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading voices...</span>
          </div>
        ) : (
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
                <p className="text-xs text-muted-foreground mb-2">
                  {voice.language} • {voice.provider}
                </p>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {voice.description || `${voice.gender} voice`}
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {voice.gender && (
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground capitalize">
                      {voice.gender}
                    </span>
                  )}
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground capitalize">
                    {voice.provider}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-lg gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreview(voice);
                  }}
                  disabled={!voice.previewUrl}
                >
                  {playingVoiceId === voice.id ? (
                    <>
                      <Pause className="h-3 w-3" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3" />
                      Preview
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
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
