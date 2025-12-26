import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useCourse } from '@/contexts/CourseContext';
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX, ArrowLeft, ClipboardList, PanelLeftOpen, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CourseEditorHeader } from '@/components/CourseEditorHeader';
import { CommentsPanel } from '@/components/CommentsPanel';

interface PreviewStepProps {
  onBack: () => void;
  isPreviewOnly?: boolean;
}

export function PreviewStep({ onBack, isPreviewOnly = false }: PreviewStepProps) {
  const navigate = useNavigate();
  const { 
    currentCourse, 
    setCourses, 
    courses, 
    finalAssessment,
    comments,
    addComment,
    resolveComment,
    setCourseTitle,
    publishCourse,
    saveCourseAsDraft,
    markStepComplete
  } = useCourse();
  const { courseItems, courseTitle } = currentCourse;
  
  // Create combined items array with final assessment at the end
  const hasFinalAssessment = finalAssessment && finalAssessment.questions.length > 0;
  const totalItems = hasFinalAssessment ? courseItems.length + 1 : courseItems.length;
  
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(true);
  const [isCommentsPanelOpen, setIsCommentsPanelOpen] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);

  // Determine if we're viewing the final assessment
  const isViewingFinalAssessment = hasFinalAssessment && currentItemIndex === courseItems.length;
  
  const currentItem = isViewingFinalAssessment ? null : courseItems[currentItemIndex];
  const currentSlide = currentItem?.type === 'slide' ? currentItem.slideData : null;
  const currentAssessment = currentItem?.type === 'assessment' ? currentItem.assessmentData : null;

  // Split talk points into words for highlighting
  const talkPointWords = currentSlide?.talkPoints?.split(/\s+/) || [];

  // Simulate audio playback word highlighting
  useEffect(() => {
    if (!isPlaying || !currentSlide?.talkPoints) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex >= talkPointWords.length) {
          return 0; // Loop back
        }
        return nextIndex;
      });
    }, 300); // ~300ms per word for demo

    return () => clearInterval(interval);
  }, [isPlaying, talkPointWords.length, currentSlide?.talkPoints]);

  // Auto-scroll to highlighted word
  useEffect(() => {
    if (isTranscriptOpen && transcriptRef.current) {
      const highlightedWord = transcriptRef.current.querySelector('[data-highlighted="true"]');
      highlightedWord?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentWordIndex, isTranscriptOpen]);

  // Reset word index when slide changes
  useEffect(() => {
    setCurrentWordIndex(0);
  }, [currentItemIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (currentItemIndex > 0) {
            setCurrentItemIndex(currentItemIndex - 1);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (currentItemIndex < totalItems - 1) {
            setCurrentItemIndex(currentItemIndex + 1);
          }
          break;
        case ' ':
          e.preventDefault();
          setIsPlaying(!isPlaying);
          break;
        case 'm':
        case 'M':
          setIsMuted(!isMuted);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentItemIndex, totalItems, isPlaying, isMuted]);

  const goToItem = (index: number) => {
    if (index >= 0 && index < totalItems) {
      setCurrentItemIndex(index);
    }
  };

  const handleComment = () => {
    setIsCommentsPanelOpen(true);
  };

  const handleAddComment = (content: string) => {
    addComment(content, currentSlide?.id);
  };

  const handleSave = () => {
    markStepComplete('preview');
    saveCourseAsDraft();
  };

  const handlePublish = () => {
    markStepComplete('preview');
    publishCourse();
    const newCourse = {
      id: Date.now().toString(),
      title: courseTitle || 'How to Make a PBJ Sand',
      date: new Date().toLocaleDateString(),
      status: 'published' as const,
      progress: '100%' as const,
    };
    setCourses([newCourse, ...courses]);
    toast({
      title: 'Course Published!',
      description: 'Your course is now live and available to learners.',
    });
    navigate('/dashboard');
  };

  return (
    <div className="h-screen flex flex-col bg-muted/20 dark:bg-background">
      {/* Fixed Header - CourseEditorHeader */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-card/80 backdrop-blur-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
        <CourseEditorHeader
          currentStep="preview"
          courseTitle={courseTitle || 'Untitled Course'}
          subtitle="Preview"
          isCollapsed={isHeaderCollapsed}
          onToggleCollapse={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
          onClose={() => navigate("/dashboard")}
          showActions={true}
          onTitleChange={setCourseTitle}
          onComment={handleComment}
          onSave={handleSave}
          onPublish={handlePublish}
          hasUnsavedChanges={true}
          isEditMode={false}
        />
      </div>

      {/* Transcript Sheet - Left Side */}
      <Sheet open={isTranscriptOpen} onOpenChange={setIsTranscriptOpen}>
        <SheetContent side="left" className="w-[400px] sm:w-[450px]" overlayClassName="bg-transparent">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              <span>Full Transcript</span>
              <span className="text-xs font-normal text-muted-foreground">
                Word {currentWordIndex + 1} of {talkPointWords.length}
              </span>
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <ScrollArea className="h-[calc(100vh-150px)] w-full rounded-xl bg-muted/30 dark:bg-muted/20 p-4">
              <div ref={transcriptRef} className="leading-relaxed">
                {talkPointWords.map((word, index) => (
                  <span
                    key={index}
                    data-highlighted={index === currentWordIndex}
                    className={`inline-block mr-1 px-0.5 rounded transition-all ${
                      index === currentWordIndex
                        ? 'bg-primary text-primary-foreground font-medium'
                        : index < currentWordIndex
                          ? 'text-muted-foreground'
                          : 'text-foreground'
                    }`}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto pt-[60px] pb-[120px] flex flex-col items-center justify-between">
        <div className="w-full max-w-6xl mx-auto px-8 flex flex-col items-center gap-4 flex-1 justify-start pt-6">
          {/* Slide Card */}
          {currentItem?.type === 'slide' && currentSlide && (
            <div className="w-full bg-card/80 backdrop-blur-xl rounded-2xl shadow-lg dark:shadow-black/30 overflow-hidden transition-all duration-300 hover:shadow-xl dark:hover:shadow-black/40">
              {/* Slide Content */}
              <div className="aspect-video bg-gradient-to-br from-muted/30 to-muted/50 dark:from-muted/10 dark:to-muted/20 p-10 flex">
                <div className="flex-1 flex flex-col justify-center">
                  <h2 className="text-4xl font-bold text-foreground mb-8">{currentSlide.title}</h2>
                  <div className="space-y-4">
                    {currentSlide.content.map((point, i) => (
                      <p key={i} className="text-xl text-foreground/80 flex items-start gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary mt-2.5 shrink-0" />
                        {point}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="w-1/3 ml-8 bg-muted/50 dark:bg-muted/30 rounded-xl flex items-center justify-center border border-muted-foreground/10">
                  <span className="text-muted-foreground">Slide Image</span>
                </div>
              </div>

              {/* Winston Speaking Indicator */}
              <div className="bg-background/50 dark:bg-background/30 backdrop-blur-sm px-6 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">Winston is speaking:</span>
                  {isPlaying && (
                    <div className="flex items-center gap-0.5">
                      <span className="w-1 h-3 bg-primary rounded-full animate-pulse" />
                      <span className="w-1 h-4 bg-primary rounded-full animate-pulse [animation-delay:0.1s]" />
                      <span className="w-1 h-2 bg-primary rounded-full animate-pulse [animation-delay:0.2s]" />
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-1 flex-1">
                    {currentSlide.talkPoints}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Control Pill - Just above bottom bar */}
        {currentItem?.type === 'slide' && currentSlide && (
          <div className="mb-4 flex items-center gap-1.5 bg-muted/90 backdrop-blur-xl rounded-full px-3 py-2 shadow-lg dark:shadow-black/40">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsTranscriptOpen(true)}
              className="h-9 w-9 rounded-full hover:bg-background/50"
              title="Open transcript"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
              className="h-9 w-9 rounded-full bg-background/50 hover:bg-background/80"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
              className="h-8 w-8 rounded-full hover:bg-background/50"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              onValueChange={([val]) => {
                setVolume(val);
                if (val > 0) setIsMuted(false);
              }}
              max={100}
              className="w-20"
            />
          </div>
        )}

        {/* Assessment Card */}
        {currentItem?.type === 'assessment' && currentAssessment && (
          <div className="w-full max-w-6xl mx-auto px-8">
            <div className="bg-card/80 backdrop-blur-xl rounded-2xl shadow-lg dark:shadow-black/30 overflow-hidden transition-all duration-300 hover:shadow-xl dark:hover:shadow-black/40">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <ClipboardList className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Knowledge Check</h3>
                    <p className="text-sm text-muted-foreground">
                      {currentAssessment.questions.length} question{currentAssessment.questions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {currentAssessment.questions.map((question, qIndex) => (
                    <div key={question.id} className="bg-muted/30 dark:bg-muted/20 rounded-xl p-6 transition-all duration-300 hover:bg-muted/40 dark:hover:bg-muted/30">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Q{qIndex + 1}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {question.type === 'multi_selection' && 'Select one'}
                          {question.type === 'checkbox' && 'Select all that apply'}
                          {question.type === 'open_ended' && 'Open response'}
                        </span>
                      </div>
                      
                      <p className="text-lg font-medium text-foreground mb-4">
                        {question.question || 'No question text configured'}
                      </p>
                      
                      {(question.type === 'multi_selection' || question.type === 'checkbox') && 
                        question.options && (
                        <div className="space-y-3">
                          {question.options.map((opt, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 p-3 bg-background/50 dark:bg-background/30 rounded-lg cursor-pointer hover:bg-background/80 dark:hover:bg-background/50 transition-all duration-200"
                            >
                              <div className={`w-5 h-5 border-2 ${
                                question.type === 'checkbox' ? 'rounded' : 'rounded-full'
                              } border-muted-foreground/50`} />
                              <span className="text-foreground">{opt.label || `Option ${i + 1}`}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {question.type === 'open_ended' && (
                        <div className="bg-background/50 dark:bg-background/30 rounded-lg p-4 border border-muted-foreground/10 min-h-[120px]">
                          <p className="text-muted-foreground">Student response area...</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Final Assessment Preview */}
        {isViewingFinalAssessment && finalAssessment && (
          <div className="w-full max-w-6xl mx-auto px-8">
            <div className="bg-card/80 backdrop-blur-xl rounded-2xl shadow-lg dark:shadow-black/30 overflow-hidden transition-all duration-300 hover:shadow-xl dark:hover:shadow-black/40">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{finalAssessment.title || 'Final Assessment'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {finalAssessment.questions.length} question{finalAssessment.questions.length !== 1 ? 's' : ''} • {finalAssessment.timeLimit} minutes • Passing: {finalAssessment.passingThreshold}%
                    </p>
                  </div>
                </div>

                {finalAssessment.description && (
                  <p className="text-muted-foreground mb-6">{finalAssessment.description}</p>
                )}

                <div className="space-y-6">
                  {finalAssessment.questions.map((question, qIndex) => (
                    <div key={question.id} className="bg-amber-500/5 dark:bg-amber-500/10 rounded-xl p-6 transition-all duration-300 hover:bg-amber-500/10 dark:hover:bg-amber-500/15">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-medium bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
                          Q{qIndex + 1}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {question.type === 'multi_selection' && 'Select one'}
                          {question.type === 'checkbox' && 'Select all that apply'}
                          {question.type === 'open_ended' && 'Open response'}
                        </span>
                      </div>
                      
                      <p className="text-lg font-medium text-foreground mb-4">
                        {question.question || 'No question text configured'}
                      </p>
                      
                      {(question.type === 'multi_selection' || question.type === 'checkbox') && 
                        question.options && (
                        <div className="space-y-3">
                          {question.options.map((opt, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 p-3 bg-background/50 dark:bg-background/30 rounded-lg cursor-pointer hover:bg-background/80 dark:hover:bg-background/50 transition-all duration-200"
                            >
                              <div className={`w-5 h-5 border-2 ${
                                question.type === 'checkbox' ? 'rounded' : 'rounded-full'
                              } border-muted-foreground/50`} />
                              <span className="text-foreground">{opt.label || `Option ${i + 1}`}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {question.type === 'open_ended' && (
                        <div className="bg-background/50 dark:bg-background/30 rounded-lg p-4 border border-muted-foreground/10 min-h-[120px]">
                          <p className="text-muted-foreground">Student response area...</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Control Bar - Simplified */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-card/80 backdrop-blur-xl px-6 py-4 transition-all duration-300 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Left: Back Button */}
          <Button variant="outline" onClick={onBack} className="gap-2 rounded-full px-5 transition-transform duration-200 hover:scale-105">
            <ArrowLeft className="h-4 w-4" />
            {isPreviewOnly ? 'Back to Dashboard' : 'Back to Editing'}
          </Button>

          {/* Center: Previous + Progress Dots + Slide Counter + Next */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => goToItem(currentItemIndex - 1)}
              disabled={currentItemIndex === 0}
              className="h-9 w-9 rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Progress Dots */}
            <div className="flex items-center gap-1.5">
              {courseItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => goToItem(index)}
                  className={`h-2 rounded-full transition-all duration-200 cursor-pointer ${
                    index === currentItemIndex 
                      ? 'w-6 bg-primary' 
                      : item.type === 'assessment'
                        ? 'w-2 bg-primary/40 hover:bg-primary/60'
                        : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
              {/* Final Assessment indicator */}
              {hasFinalAssessment && (
                <button
                  onClick={() => goToItem(courseItems.length)}
                  className={`h-2 rounded-full transition-all duration-200 cursor-pointer ${
                    isViewingFinalAssessment
                      ? 'w-6 bg-amber-500'
                      : 'w-2 bg-amber-500/40 hover:bg-amber-500/60'
                  }`}
                />
              )}
            </div>

            {/* Slide Counter */}
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {isViewingFinalAssessment 
                ? 'Final Assessment' 
                : currentItem?.type === 'slide' 
                  ? 'Slide' 
                  : 'Knowledge Check'} {currentItemIndex + 1} of {totalItems}
            </span>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => goToItem(currentItemIndex + 1)}
              disabled={currentItemIndex === totalItems - 1}
              className="h-9 w-9 rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Right: Empty spacer for balance */}
          <div className="w-[160px]" />
        </div>
      </div>

      {/* Comments Panel */}
      <CommentsPanel
        isOpen={isCommentsPanelOpen}
        onClose={() => setIsCommentsPanelOpen(false)}
        comments={comments}
        onAddComment={handleAddComment}
        onResolveComment={resolveComment}
        currentSlideId={currentSlide?.id}
      />
    </div>
  );
}
