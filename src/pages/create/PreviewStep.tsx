import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useCourse } from '@/contexts/CourseContext';
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX, ArrowLeft, ClipboardList, Edit, Eye, EyeOff, Maximize2, Minimize2, GraduationCap, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CourseEditorHeader } from '@/components/CourseEditorHeader';
import { WizardStep } from '@/types/course';
import { Progress } from '@/components/ui/progress';

interface PreviewStepProps {
  onBack: () => void;
  isPreviewOnly?: boolean;
  onStepClick?: (step: WizardStep) => void;
}

export function PreviewStep({ onBack, isPreviewOnly = false, onStepClick }: PreviewStepProps) {
  const navigate = useNavigate();
  const { currentCourse, setCourses, courses, finalAssessment, setCourseTitle, saveCourseAsDraft, publishCourse, markStepComplete } = useCourse();
  const { courseItems, courseTitle } = currentCourse;
  
  // Create combined items array with final assessment at the end
  const hasFinalAssessment = finalAssessment && finalAssessment.questions.length > 0;
  const totalItems = hasFinalAssessment ? courseItems.length + 1 : courseItems.length;
  
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isPublished, setIsPublished] = useState(true);
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);
  
  // Final assessment progress tracking
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());

  // Determine if we're viewing the final assessment
  const isViewingFinalAssessment = hasFinalAssessment && currentItemIndex === courseItems.length;
  
  const currentItem = isViewingFinalAssessment ? null : courseItems[currentItemIndex];
  const currentSlide = currentItem?.type === 'slide' ? currentItem.slideData : null;
  const currentAssessment = currentItem?.type === 'assessment' ? currentItem.assessmentData : null;

  // Progress calculation for final assessment
  const totalFinalQuestions = finalAssessment?.questions.length || 0;
  const completedFinalQuestions = answeredQuestions.size;
  const progressPercentage = totalFinalQuestions > 0 ? (completedFinalQuestions / totalFinalQuestions) * 100 : 0;

  // Toggle question answered state (for demo purposes)
  const toggleQuestionAnswered = (questionId: string) => {
    setAnsweredQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

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
    if (isTranscriptExpanded && transcriptRef.current) {
      const highlightedWord = transcriptRef.current.querySelector('[data-highlighted="true"]');
      highlightedWord?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentWordIndex, isTranscriptExpanded]);

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

  const handleEdit = () => {
    navigate('/create?mode=edit');
  };

  const handleTogglePublish = () => {
    setIsPublished(!isPublished);
    toast({
      title: isPublished ? 'Course Unpublished' : 'Course Published',
      description: isPublished 
        ? 'The course is no longer visible to learners.' 
        : 'The course is now live and available to learners.',
    });
  };

  const handlePublish = () => {
    publishCourse();
    navigate('/dashboard');
  };

  const handleSaveDraft = () => {
    saveCourseAsDraft();
    toast({
      title: 'Draft Saved',
      description: 'Your course has been saved as a draft.',
    });
    navigate('/dashboard');
  };

  const handleComment = () => {
    // Placeholder for comments functionality
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with Step Indicator */}
      <CourseEditorHeader
        currentStep="preview"
        courseTitle={courseTitle || 'Untitled Course'}
        isCollapsed={isHeaderCollapsed}
        onToggleCollapse={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
        onClose={() => navigate("/dashboard")}
        onStepClick={onStepClick}
        showActions={true}
        onTitleChange={setCourseTitle}
        onComment={handleComment}
        onSave={handleSaveDraft}
        onPublish={handlePublish}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* Main Preview Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-muted/20 dark:bg-background">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Slide/Assessment Card */}
          <div className="bg-card/80 backdrop-blur-xl rounded-2xl shadow-lg dark:shadow-black/30 overflow-hidden transition-all duration-300 hover:shadow-xl dark:hover:shadow-black/40">
            {currentItem?.type === 'slide' && currentSlide && (
              <>
                {/* Slide Content */}
                <div className="aspect-video bg-gradient-to-br from-muted/30 to-muted/50 dark:from-muted/10 dark:to-muted/20 p-8 flex">
                  <div className="flex-1 flex flex-col justify-center">
                    <h2 className="text-3xl font-bold text-foreground mb-6">{currentSlide.title}</h2>
                    <div className="space-y-3">
                      {currentSlide.content.map((point, i) => (
                        <p key={i} className="text-lg text-foreground/80 flex items-start gap-3">
                          <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                          {point}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="w-1/3 ml-6 bg-muted/50 dark:bg-muted/30 rounded-xl flex items-center justify-center border border-muted-foreground/10">
                    <span className="text-muted-foreground">Slide Image</span>
                  </div>
                </div>

                {/* Audio Player Bar */}
                <div className="bg-background/50 dark:bg-background/30 backdrop-blur-sm px-6 py-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="h-10 w-10 rounded-full transition-transform duration-200 hover:scale-110"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">Winston is speaking:</span>
                        {isPlaying && (
                          <div className="flex items-center gap-0.5">
                            <span className="w-1 h-3 bg-primary rounded-full animate-pulse" />
                            <span className="w-1 h-4 bg-primary rounded-full animate-pulse [animation-delay:0.1s]" />
                            <span className="w-1 h-2 bg-primary rounded-full animate-pulse [animation-delay:0.2s]" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {currentSlide.talkPoints}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMuted(!isMuted)}
                        className="h-8 w-8"
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
                        className="w-24"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
                        className="h-8 w-8"
                        title={isTranscriptExpanded ? "Collapse transcript" : "Expand transcript"}
                      >
                        {isTranscriptExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Transcript Panel */}
                  {isTranscriptExpanded && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-foreground">Full Transcript</span>
                        <span className="text-xs text-muted-foreground">
                          Word {currentWordIndex + 1} of {talkPointWords.length}
                        </span>
                      </div>
                      <ScrollArea className="h-40 w-full rounded-xl bg-muted/30 dark:bg-muted/20 p-4">
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
                  )}
                </div>
              </>
            )}

            {currentItem?.type === 'assessment' && currentAssessment && (
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
            )}

            {/* Final Assessment Preview */}
            {isViewingFinalAssessment && finalAssessment && (
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">{finalAssessment.title || 'Final Assessment'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {finalAssessment.questions.length} question{finalAssessment.questions.length !== 1 ? 's' : ''} • {finalAssessment.timeLimit} minutes • Passing: {finalAssessment.passingThreshold}%
                    </p>
                  </div>
                </div>

                {/* Progress Tracking */}
                <div className="bg-amber-500/5 dark:bg-amber-500/10 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Progress</span>
                    <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                      {completedFinalQuestions} of {totalFinalQuestions} completed
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2 bg-amber-500/20" />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {totalFinalQuestions - completedFinalQuestions} remaining
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                </div>

                {finalAssessment.description && (
                  <p className="text-muted-foreground mb-6">{finalAssessment.description}</p>
                )}

                <div className="space-y-6">
                  {finalAssessment.questions.map((question, qIndex) => {
                    const isAnswered = answeredQuestions.has(question.id);
                    return (
                      <div 
                        key={question.id} 
                        className={`rounded-xl p-6 transition-all duration-300 cursor-pointer ${
                          isAnswered 
                            ? 'bg-green-500/10 dark:bg-green-500/15 hover:bg-green-500/15 dark:hover:bg-green-500/20' 
                            : 'bg-amber-500/5 dark:bg-amber-500/10 hover:bg-amber-500/10 dark:hover:bg-amber-500/15'
                        }`}
                        onClick={() => toggleQuestionAnswered(question.id)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              isAnswered 
                                ? 'bg-green-500/20 text-green-700 dark:text-green-300' 
                                : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                            }`}>
                              Q{qIndex + 1}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {question.type === 'multi_selection' && 'Select one'}
                              {question.type === 'checkbox' && 'Select all that apply'}
                              {question.type === 'open_ended' && 'Open response'}
                            </span>
                          </div>
                          {isAnswered && (
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                              <Check className="h-4 w-4" />
                              <span className="text-xs font-medium">Answered</span>
                            </div>
                          )}
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
                                onClick={(e) => e.stopPropagation()}
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
                          <div 
                            className="bg-background/50 dark:bg-background/30 rounded-lg p-4 border border-muted-foreground/10 min-h-[120px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <p className="text-muted-foreground">Student response area...</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => goToItem(currentItemIndex - 1)}
              disabled={currentItemIndex === 0}
              className="rounded-xl transition-transform duration-200 hover:scale-105"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2 px-4">
              {courseItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => goToItem(index)}
                  className={`h-2.5 rounded-full transition-all duration-200 ${
                    index === currentItemIndex 
                      ? 'w-8 bg-primary' 
                      : item.type === 'assessment'
                        ? 'w-2.5 bg-primary/40 hover:bg-primary/60'
                        : 'w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
              {/* Final Assessment indicator */}
              {hasFinalAssessment && (
                <button
                  onClick={() => goToItem(courseItems.length)}
                  className={`h-2.5 rounded-full transition-all duration-200 ${
                    isViewingFinalAssessment
                      ? 'w-8 bg-amber-500'
                      : 'w-2.5 bg-amber-500/40 hover:bg-amber-500/60'
                  }`}
                />
              )}
            </div>

            <Button
              variant="outline"
              onClick={() => goToItem(currentItemIndex + 1)}
              disabled={currentItemIndex === totalItems - 1}
              className="rounded-xl transition-transform duration-200 hover:scale-105"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Item Counter */}
          <div className="text-center text-sm text-muted-foreground">
            {isViewingFinalAssessment 
              ? 'Final Assessment' 
              : currentItem?.type === 'slide' 
                ? 'Slide' 
                : 'Knowledge Check'} {currentItemIndex + 1} of {totalItems}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-card/80 backdrop-blur-xl px-6 py-4 transition-all duration-300">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Button variant="outline" onClick={onBack} className="gap-2 rounded-xl transition-transform duration-200 hover:scale-105">
            <ArrowLeft className="h-4 w-4" />
            {isPreviewOnly ? 'Back to Dashboard' : 'Back to Editing'}
          </Button>
          <div className="text-sm text-muted-foreground">
            {courseItems.filter(i => i.type === 'slide').length} slides • {courseItems.filter(i => i.type === 'assessment').length} knowledge checks{hasFinalAssessment ? ' • 1 final assessment' : ''}
          </div>
        </div>
      </div>
    </div>
  );
}
