import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useCourse } from '@/contexts/CourseContext';
import { ChevronLeft, ChevronRight, Plus, Star, Bold, Italic, Underline, List, ListOrdered, Link, Play } from 'lucide-react';

interface ScriptingStepProps {
  onContinue: () => void;
  onBack: () => void;
}

export function ScriptingStep({ onContinue, onBack }: ScriptingStepProps) {
  const { currentCourse, setSlides } = useCourse();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [moreVerbose, setMoreVerbose] = useState(false);
  const [moreStreamlined, setMoreStreamlined] = useState(false);

  const slides = currentCourse.slides;
  const currentSlide = slides[currentSlideIndex];

  const updateTalkPoints = (value: string) => {
    const updatedSlides = [...slides];
    updatedSlides[currentSlideIndex] = { ...currentSlide, talkPoints: value };
    setSlides(updatedSlides);
  };

  const handleAskWinston = () => {
    // Simulate AI response
    if (aiPrompt.toLowerCase().includes('simpl') || aiPrompt.toLowerCase().includes('less complicated')) {
      updateTalkPoints('Here is a simplified version of the talk points. The content has been streamlined for easier understanding.');
    }
  };

  const goToSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlideIndex(index);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-secondary flex items-center justify-center">
            <div className="h-4 w-4 bg-muted-foreground" />
          </div>
          <div>
            <h1 className="font-bold">How to Make a PBJ Sand</h1>
            <p className="text-sm text-muted-foreground">-Intro</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground bg-secondary px-3 py-1">
            unsaved changes
          </span>
          <Button variant="outline" size="sm">Comments</Button>
          <Button variant="outline" size="sm">Saved</Button>
          <Button size="sm">Publish</Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left Panel - Talk Points */}
        <div className="w-1/3 space-y-4">
          <div className="border-2 border-foreground p-4">
            <h2 className="text-lg font-bold border-b-2 border-foreground pb-2 mb-4">Talk Points</h2>
            
            <div className="space-y-3">
              <p className="text-sm font-medium">Quick Edits</p>
              <div className="flex items-center gap-3">
                <Button size="sm" className="gap-1">
                  <Star className="h-3 w-3" />
                  Ask Winston
                </Button>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="verbose"
                    checked={moreVerbose}
                    onCheckedChange={(checked) => setMoreVerbose(checked as boolean)}
                  />
                  <label htmlFor="verbose" className="text-sm">More Verbose</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="streamlined"
                    checked={moreStreamlined}
                    onCheckedChange={(checked) => setMoreStreamlined(checked as boolean)}
                  />
                  <label htmlFor="streamlined" className="text-sm">More Streamlined</label>
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Make it less complicated please."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="flex-1"
                />
                <Button size="icon" onClick={handleAskWinston}>
                  <Play className="h-4 w-4" />
                </Button>
              </div>

              {/* Text Formatting Toolbar */}
              <div className="flex items-center gap-1 border border-foreground p-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Bold className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Italic className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Underline className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <List className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ListOrdered className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Link className="h-4 w-4" />
                </Button>
              </div>

              <Textarea
                value={currentSlide?.talkPoints || ''}
                onChange={(e) => updateTalkPoints(e.target.value)}
                className="min-h-[250px]"
                placeholder="Enter talk points for this slide..."
              />

              <div className="flex justify-center">
                <Button variant="outline">Preview</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Slide Preview */}
        <div className="flex-1 space-y-4">
          {/* Slide Thumbnails */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Button variant="ghost" size="icon" onClick={() => goToSlide(currentSlideIndex - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                onClick={() => goToSlide(index)}
                className={`h-12 w-16 bg-secondary border-2 cursor-pointer flex-shrink-0 ${
                  index === currentSlideIndex ? 'border-foreground shadow-sm' : 'border-muted'
                }`}
              />
            ))}
            <Button variant="ghost" size="icon" onClick={() => goToSlide(currentSlideIndex + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Slide Content */}
          <div className="bg-secondary border-2 border-foreground p-8 min-h-[400px]">
            <div className="flex gap-8">
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-6">{currentSlide?.title || 'Title of Slide'}</h2>
                <div className="space-y-2">
                  <p className="font-semibold">talk points:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    {currentSlide?.content.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ol>
                </div>
              </div>
              <div className="w-1/3 h-48 bg-muted border-2 border-foreground" />
            </div>
          </div>

          {/* Slide Info */}
          <div className="border-2 border-foreground p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                Slide {currentSlideIndex + 1} of {slides.length}
              </span>
              <Button
                variant="ghost"
                onClick={() => setShowDetails(!showDetails)}
                className="font-semibold"
              >
                Details
              </Button>
            </div>

            {showDetails && (
              <div className="space-y-4">
                <div className="bg-secondary p-3">
                  <p className="font-semibold text-sm">Extracted Keywords</p>
                  <div className="flex gap-2 mt-2">
                    {currentSlide?.keywords.map((keyword) => (
                      <span key={keyword} className="text-xs bg-background px-2 py-1 border border-foreground">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-secondary p-3">
                  <p className="font-semibold text-sm">Auto-Summary</p>
                  <p className="text-sm mt-1">{currentSlide?.summary}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onContinue}>
          Next
        </Button>
      </div>
    </div>
  );
}
