import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useCourse } from '@/contexts/CourseContext';
import { ChevronLeft, ChevronRight, Sparkles, Bold, Italic, List } from 'lucide-react';

interface ScriptingStepProps {
  onContinue: () => void;
  onBack: () => void;
}

export function ScriptingStep({ onContinue, onBack }: ScriptingStepProps) {
  const { currentCourse, setSlides } = useCourse();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [aiPrompt, setAiPrompt] = useState('');

  const slides = currentCourse.slides;
  const currentSlide = slides[currentSlideIndex];

  const updateTalkPoints = (value: string) => {
    const updatedSlides = [...slides];
    updatedSlides[currentSlideIndex] = { ...currentSlide, talkPoints: value };
    setSlides(updatedSlides);
  };

  const goToSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlideIndex(index);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground">Edit Talk Points</h2>
        <p className="text-muted-foreground mt-2">
          Review and customize the AI-generated narration for each slide
        </p>
      </div>

      {/* Slide Navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => goToSlide(currentSlideIndex - 1)}
          disabled={currentSlideIndex === 0}
          className="rounded-full"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2.5 rounded-full transition-all duration-200 ${
                index === currentSlideIndex 
                  ? 'bg-primary w-6' 
                  : 'bg-muted hover:bg-muted-foreground/50 w-2.5'
              }`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => goToSlide(currentSlideIndex + 1)}
          disabled={currentSlideIndex === slides.length - 1}
          className="rounded-full"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Slide {currentSlideIndex + 1} of {slides.length}
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Slide Preview (Read-only) */}
        <div className="bg-muted/30 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-foreground text-lg">{currentSlide?.title || 'Slide Title'}</h3>
          <div className="space-y-2">
            {currentSlide?.content.map((point, i) => (
              <p key={i} className="text-muted-foreground flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                {point}
              </p>
            ))}
          </div>
          <div className="aspect-video bg-card rounded-lg border flex items-center justify-center mt-4">
            <span className="text-muted-foreground text-sm">Slide Preview</span>
          </div>
        </div>

        {/* Talk Points Editor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Talk Points</label>
            <Button variant="secondary" size="sm" className="gap-2 rounded-lg">
              <Sparkles className="h-4 w-4" />
              Regenerate
            </Button>
          </div>

          {/* AI Quick Edit */}
          <div className="flex gap-2">
            <Input
              placeholder="Ask Winston to edit..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="flex-1 rounded-lg"
            />
            <Button size="icon" className="rounded-lg">
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>

          {/* Formatting Toolbar */}
          <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg w-fit">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Italic className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Textarea
            value={currentSlide?.talkPoints || ''}
            onChange={(e) => updateTalkPoints(e.target.value)}
            className="min-h-[240px] rounded-xl resize-none"
            placeholder="Enter the narration for this slide..."
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="rounded-xl">
          Back
        </Button>
        <Button onClick={onContinue} size="lg" className="rounded-xl px-8">
          Add Assessments
        </Button>
      </div>
    </div>
  );
}
