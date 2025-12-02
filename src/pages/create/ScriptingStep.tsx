import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useCourse } from '@/contexts/CourseContext';
import { ChevronLeft, ChevronRight, Send, Plus } from 'lucide-react';
import { QuickEditsPanel } from '@/components/QuickEditsPanel';
import { RichTextToolbar } from '@/components/RichTextToolbar';
import { SlideDetailsPanel } from '@/components/SlideDetailsPanel';

interface ScriptingStepProps {
  onContinue: () => void;
  onBack: () => void;
}

export function ScriptingStep({ onContinue, onBack }: ScriptingStepProps) {
  const { currentCourse, setSlides } = useCourse();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isVerbose, setIsVerbose] = useState(false);
  const [isStreamlined, setIsStreamlined] = useState(false);

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

  const handleAskWinston = () => {
    // Placeholder for AI functionality
    console.log('Ask Winston clicked');
  };

  const handleAiPromptSubmit = () => {
    if (aiPrompt.trim()) {
      console.log('AI Prompt:', aiPrompt);
      setAiPrompt('');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Slide Carousel */}
      <div className="flex items-center gap-3 px-6 py-4 border-b bg-muted/30">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => goToSlide(currentSlideIndex - 1)}
          disabled={currentSlideIndex === 0}
          className="shrink-0 rounded-full"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 flex-1">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
              className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === currentSlideIndex
                  ? 'border-primary shadow-md ring-2 ring-primary/20'
                  : 'border-border hover:border-muted-foreground/50'
              }`}
            >
              <div className="w-full h-full bg-card flex items-center justify-center">
                <span className="text-xs font-medium text-muted-foreground">{index + 1}</span>
              </div>
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="shrink-0 rounded-full border-dashed"
        >
          <Plus className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => goToSlide(currentSlideIndex + 1)}
          disabled={currentSlideIndex === slides.length - 1}
          className="shrink-0 rounded-full"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid md:grid-cols-[320px_1fr] gap-0">
          {/* Left Panel - Talk Points Editor */}
          <div className="border-r bg-card p-6 overflow-y-auto flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Talk Points</h3>
              <div className="h-0.5 w-16 bg-primary rounded-full" />
            </div>

            <QuickEditsPanel
              isVerbose={isVerbose}
              isStreamlined={isStreamlined}
              onVerboseChange={setIsVerbose}
              onStreamlinedChange={setIsStreamlined}
              onAskWinston={handleAskWinston}
            />

            {/* AI Prompt Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Make it less technical..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiPromptSubmit()}
                className="flex-1 rounded-xl"
              />
              <Button 
                size="icon" 
                onClick={handleAiPromptSubmit}
                className="rounded-xl shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <RichTextToolbar />

            <Textarea
              value={currentSlide?.talkPoints || ''}
              onChange={(e) => updateTalkPoints(e.target.value)}
              className="flex-1 min-h-[200px] rounded-xl resize-none"
              placeholder="Enter the narration for this slide..."
            />

            <Button variant="outline" className="rounded-xl">
              Preview
            </Button>
          </div>

          {/* Right Panel - Slide Preview & Details */}
          <div className="bg-muted/20 p-6 overflow-y-auto">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Slide Preview Card */}
              <div className="bg-card rounded-2xl shadow-lg border overflow-hidden">
                <div className="p-6">
                  <div className="flex gap-6">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xl font-semibold text-foreground mb-4">
                        {currentSlide?.title || 'Slide Title'}
                      </h4>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground mb-2">talk points:</p>
                        {currentSlide?.content.map((point, i) => (
                          <p key={i} className="text-sm text-foreground flex items-start gap-2">
                            <span className="text-muted-foreground">{i + 1}.</span>
                            {point}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="w-40 h-28 bg-muted rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-xs text-muted-foreground">Image</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide Counter */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Slide {currentSlideIndex + 1} of {slides.length}
                </span>
                <span className="text-sm font-medium text-foreground">Details</span>
              </div>

              {/* Details Panel */}
              <SlideDetailsPanel slide={currentSlide} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t bg-card">
        <Button variant="outline" onClick={onBack} className="rounded-xl">
          Back
        </Button>
        
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">W</span>
          </div>
        </div>

        <Button onClick={onContinue} className="rounded-xl px-8">
          Next
        </Button>
      </div>
    </div>
  );
}
