import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight, Send, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useCourse } from '@/contexts/CourseContext';
import { QuickEditsPanel } from '@/components/QuickEditsPanel';
import { RichTextToolbar } from '@/components/RichTextToolbar';
import { SlideDetailsPanel } from '@/components/SlideDetailsPanel';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { CourseEditorHeader } from '@/components/CourseEditorHeader';
import { useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ClipboardList } from 'lucide-react';
import { WizardStep } from '@/types/course';
interface ScriptingStepProps {
  onContinue: () => void;
  onBack: () => void;
  onStepClick?: (step: WizardStep) => void;
}
export function ScriptingStep({
  onContinue,
  onBack,
  onStepClick
}: ScriptingStepProps) {
  const navigate = useNavigate();
  const {
    currentCourse,
    setSlides,
    insertAssessmentAtIndex
  } = useCourse();
  const {
    slides,
    courseItems
  } = currentCourse;
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isVerbose, setIsVerbose] = useState(false);
  const [isStreamlined, setIsStreamlined] = useState(false);
  const [activeTab, setActiveTab] = useState<'scripting' | 'metadata'>('scripting');
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(true);

  // Get current item (slide or assessment)
  const currentItem = courseItems[currentItemIndex];
  const currentSlide = currentItem?.type === 'slide' ? currentItem.slideData : null;
  const currentAssessment = currentItem?.type === 'assessment' ? currentItem.assessmentData : null;
  const updateTalkPoints = (newTalkPoints: string) => {
    if (!currentSlide) return;
    const updatedSlides = slides.map(slide => slide.id === currentSlide.id ? {
      ...slide,
      talkPoints: newTalkPoints
    } : slide);
    setSlides(updatedSlides);
  };
  const goToItem = (index: number) => {
    if (index >= 0 && index < courseItems.length) {
      setCurrentItemIndex(index);
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
  const handleAddAssessment = () => {
    insertAssessmentAtIndex(currentItemIndex);
    // Move to the newly inserted assessment
    setCurrentItemIndex(currentItemIndex + 1);
  };

  // Calculate visible thumbnails (show 5 at a time)
  const visibleCount = 5;
  const startIndex = Math.max(0, Math.min(currentItemIndex - 2, courseItems.length - visibleCount));
  const visibleItems = courseItems.slice(startIndex, startIndex + visibleCount);
  return <div className="h-full flex flex-col">
      {/* Header with Progress Bar */}
      <CourseEditorHeader currentStep="scripting" courseTitle="How to Make a PBJ Sand - Intro" isCollapsed={isHeaderCollapsed} onToggleCollapse={() => setIsHeaderCollapsed(!isHeaderCollapsed)} onClose={() => navigate('/dashboard')} onStepClick={onStepClick} showActions={true} />

      {/* Main Content Area with Resizable Panels */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel - Talk Points Editor */}
          <ResizablePanel defaultSize={40} minSize={25} maxSize={60}>
            <div className="h-full bg-card flex flex-col">
              {/* Tab Navigation - aligned with carousel */}
              <div className="bg-card border-b px-6 py-4">
                <div className="flex gap-4">
                  <button onClick={() => setActiveTab('scripting')} className={`text-sm font-medium pb-2 border-b-2 transition-colors ${activeTab === 'scripting' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                    Scripting
                  </button>
                  <button onClick={() => setActiveTab('metadata')} className={`text-sm font-medium pb-2 border-b-2 transition-colors ${activeTab === 'metadata' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
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
                <QuickEditsPanel isVerbose={isVerbose} isStreamlined={isStreamlined} onVerboseChange={setIsVerbose} onStreamlinedChange={setIsStreamlined} onAskWinston={handleAskWinston} />

                {/* AI Prompt Input */}
                <div className="relative">
                  <input type="text" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAiPromptSubmit()} placeholder="Make it less complicated..." className="w-full px-4 py-3 pr-12 bg-muted/50 border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  <Button size="icon" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8" onClick={handleAiPromptSubmit}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                {/* Rich Text Toolbar */}
                <RichTextToolbar />

                {/* Talk Points Textarea - Larger */}
                <Textarea value={currentSlide?.talkPoints || ''} onChange={e => updateTalkPoints(e.target.value)} placeholder="Enter talk points for this slide..." className="min-h-[280px] resize-none text-sm leading-relaxed" />

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
              {/* Item Carousel */}
              <div className="bg-card border-b px-4 py-4 ">
                <div className="flex items-center justify-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => goToItem(currentItemIndex - 1)} disabled={currentItemIndex === 0}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-2">
                    {visibleItems.map((item, idx) => {
                    const actualIndex = startIndex + idx;
                    const isActive = actualIndex === currentItemIndex;
                    const isAssessment = item.type === 'assessment';
                    return <button key={item.id} onClick={() => goToItem(actualIndex)} className={`relative rounded-lg overflow-hidden transition-all ${isActive ? 'ring-2 ring-primary shadow-lg scale-105' : 'opacity-60 hover:opacity-100'}`}>
                          <div className={`w-16 aspect-video flex items-center justify-center ${isAssessment ? 'bg-primary/20' : 'bg-muted'}`}>
                            <span className={`text-xs font-medium ${isAssessment ? 'text-primary' : 'text-muted-foreground'}`}>
                              {isAssessment ? 'Q' : actualIndex + 1 - courseItems.slice(0, actualIndex).filter(i => i.type === 'assessment').length}
                            </span>
                          </div>
                        </button>;
                  })}
                  </div>

                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => goToItem(currentItemIndex + 1)} disabled={currentItemIndex === courseItems.length - 1}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  {/* Plus Button with Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full ml-2">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleAddAssessment}>
                        <ClipboardList className="h-4 w-4 mr-2" />
                        Add Assessment
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Content Preview Area */}
              <div className="flex-1 p-6 overflow-y-auto">
                {currentItem?.type === 'slide' && currentSlide && <>
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
                              {currentSlide?.talkPoints.split('. ').filter(Boolean).map((point, idx) => <p key={idx} className="text-sm text-foreground">
                                  {idx + 1}. {point.trim()}{!point.endsWith('.') ? '.' : ''}
                                </p>)}
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
                        Item {currentItemIndex + 1} of {courseItems.length}
                      </span>
                      <span className="text-sm font-medium text-foreground">Details</span>
                    </div>

                    {/* Slide Details Panel */}
                    <SlideDetailsPanel slide={currentSlide} />
                  </>}

                {currentItem?.type === 'assessment' && currentAssessment && <div className="bg-card rounded-2xl p-6 border">
                    <div className="flex items-center gap-2 mb-4">
                      <ClipboardList className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">Assessment Question</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      {currentAssessment.question || 'No question text yet. Configure this assessment in the Assessment step.'}
                    </p>
                    <Button variant="outline" onClick={onContinue}>
                      Edit Assessment
                    </Button>
                  </div>}
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

        <Button onClick={onContinue} className="gap-2 rounded-xl">
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>;
}