import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight, Send, ChevronLeft, ChevronRight, Plus, FileText, MessageSquare, Save, Upload } from 'lucide-react';
import { useCourse } from '@/contexts/CourseContext';
import { QuickEditsPanel } from '@/components/QuickEditsPanel';
import { RichTextToolbar } from '@/components/RichTextToolbar';
import { SlideDetailsPanel } from '@/components/SlideDetailsPanel';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

interface ScriptingStepProps {
  onContinue: () => void;
  onBack: () => void;
}

export function ScriptingStep({ onContinue, onBack }: ScriptingStepProps) {
  const { currentCourse, setSlides } = useCourse();
  const { slides } = currentCourse;
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isVerbose, setIsVerbose] = useState(false);
  const [isStreamlined, setIsStreamlined] = useState(false);
  const [activeTab, setActiveTab] = useState<'scripting' | 'metadata'>('scripting');

  const currentSlide = slides[currentSlideIndex];

  const updateTalkPoints = (newTalkPoints: string) => {
    const updatedSlides = slides.map((slide, index) =>
      index === currentSlideIndex ? { ...slide, talkPoints: newTalkPoints } : slide
    );
    setSlides(updatedSlides);
  };

  const goToSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlideIndex(index);
    }
  };

  const handleAskWinston = () => {
    console.log('Ask Winston clicked');
  };

  const handleAiPromptSubmit = () => {
    if (aiPrompt.trim()) {
      console.log('AI Prompt submitted:', aiPrompt);
      setAiPrompt('');
    }
  };

  // Calculate visible thumbnails (show 5 at a time)
  const visibleCount = 5;
  const startIndex = Math.max(0, Math.min(currentSlideIndex - 2, slides.length - visibleCount));
  const visibleSlides = slides.slice(startIndex, startIndex + visibleCount);

  return (
    <div className="h-full flex flex-col">
      {/* Status Bar */}
      <div className="bg-card border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium text-foreground">How to Make a PBJ Sand - Intro</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">unsaved changes</span>
          <Button variant="ghost" size="sm" className="gap-1">
            <MessageSquare className="h-4 w-4" />
            Comments
          </Button>
          <Button variant="ghost" size="sm" className="gap-1">
            <Save className="h-4 w-4" />
            Saved
          </Button>
          <Button variant="default" size="sm" className="gap-1">
            <Upload className="h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>

      {/* Main Content Area with Resizable Panels */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel - Talk Points Editor */}
          <ResizablePanel defaultSize={40} minSize={25} maxSize={60}>
            <div className="h-full bg-card flex flex-col">
              {/* Tab Navigation */}
              <div className="px-6 pt-4 pb-2 border-b">
                <div className="flex gap-4">
                  <button
                    onClick={() => setActiveTab('scripting')}
                    className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                      activeTab === 'scripting'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Scripting
                  </button>
                  <button
                    onClick={() => setActiveTab('metadata')}
                    className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                      activeTab === 'metadata'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Metadata
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Talk Points Header */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Talk Points</h3>
                  <div className="h-0.5 w-20 bg-primary rounded-full" />
                </div>

                {/* Quick Edits - Horizontal Layout */}
                <QuickEditsPanel
                  isVerbose={isVerbose}
                  isStreamlined={isStreamlined}
                  onVerboseChange={setIsVerbose}
                  onStreamlinedChange={setIsStreamlined}
                  onAskWinston={handleAskWinston}
                />

                {/* AI Prompt Input */}
                <div className="relative">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAiPromptSubmit()}
                    placeholder="Make it less complicated..."
                    className="w-full px-4 py-3 pr-12 bg-muted/50 border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={handleAiPromptSubmit}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                {/* Rich Text Toolbar */}
                <RichTextToolbar />

                {/* Talk Points Textarea - Larger */}
                <Textarea
                  value={currentSlide?.talkPoints || ''}
                  onChange={(e) => updateTalkPoints(e.target.value)}
                  placeholder="Enter talk points for this slide..."
                  className="min-h-[280px] resize-none text-sm leading-relaxed"
                />

                {/* Preview Button */}
                <Button variant="outline" className="w-full rounded-xl">
                  Preview
                </Button>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Slide Preview */}
          <ResizablePanel defaultSize={60} minSize={40} maxSize={75}>
            <div className="h-full bg-muted/30 flex flex-col overflow-hidden">
              {/* Slide Carousel */}
              <div className="bg-card border-b px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => goToSlide(currentSlideIndex - 1)}
                    disabled={currentSlideIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-2">
                    {visibleSlides.map((slide, idx) => {
                      const actualIndex = startIndex + idx;
                      const isActive = actualIndex === currentSlideIndex;
                      return (
                        <button
                          key={slide.id}
                          onClick={() => goToSlide(actualIndex)}
                          className={`relative rounded-lg overflow-hidden transition-all ${
                            isActive
                              ? 'ring-2 ring-primary shadow-lg scale-105'
                              : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          <div className="w-16 aspect-video bg-muted flex items-center justify-center">
                            <span className="text-xs font-medium text-muted-foreground">
                              {actualIndex + 1}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => goToSlide(currentSlideIndex + 1)}
                    disabled={currentSlideIndex === slides.length - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full ml-2"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Slide Preview Area */}
              <div className="flex-1 p-6 overflow-y-auto">
                {/* 16:9 Slide Preview */}
                <div className="bg-muted rounded-2xl p-4 mb-6">
                  <div className="aspect-video bg-card rounded-xl shadow-lg overflow-hidden">
                    <div className="h-full p-6 flex">
                      {/* Slide Content */}
                      <div className="flex-1 flex flex-col">
                        <h2 className="text-xl font-bold text-foreground mb-4">
                          {currentSlide?.title}
                        </h2>
                        <div className="space-y-2 flex-1">
                          <p className="text-sm font-medium text-muted-foreground mb-2">talk points:</p>
                          {currentSlide?.talkPoints.split('. ').filter(Boolean).map((point, idx) => (
                            <p key={idx} className="text-sm text-foreground">
                              {idx + 1}. {point.trim()}{!point.endsWith('.') ? '.' : ''}
                            </p>
                          ))}
                        </div>
                      </div>
                      {/* Image Placeholder */}
                      <div className="w-1/3 ml-4 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">Image</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Slide Counter & Details */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">
                    Slide {currentSlideIndex + 1} of {slides.length}
                  </span>
                  <span className="text-sm font-medium text-foreground">Details</span>
                </div>

                {/* Slide Details Panel */}
                {currentSlide && <SlideDetailsPanel slide={currentSlide} />}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Footer Navigation */}
      <div className="bg-card border-t px-6 py-4 flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2 rounded-xl">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-lg">🤖</span>
        </div>

        <Button onClick={onContinue} className="gap-2 rounded-xl">
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}