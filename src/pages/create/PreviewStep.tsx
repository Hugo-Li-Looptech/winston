import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCourse } from '@/contexts/CourseContext';
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX, ArrowLeft, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';

interface PreviewStepProps {
  onBack: () => void;
  isPreviewOnly?: boolean;
}

export function PreviewStep({ onBack, isPreviewOnly = false }: PreviewStepProps) {
  const navigate = useNavigate();
  const { currentCourse, setCourses, courses } = useCourse();
  const { courseItems } = currentCourse;
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);

  const currentItem = courseItems[currentItemIndex];
  const currentSlide = currentItem?.type === 'slide' ? currentItem.slideData : null;
  const currentAssessment = currentItem?.type === 'assessment' ? currentItem.assessmentData : null;

  const goToItem = (index: number) => {
    if (index >= 0 && index < courseItems.length) {
      setCurrentItemIndex(index);
    }
  };

  const handlePublish = () => {
    const newCourse = {
      id: Date.now().toString(),
      title: 'How to Make a PBJ Sand',
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

  const handleSaveDraft = () => {
    toast({
      title: 'Draft Saved',
      description: 'Your course has been saved as a draft.',
    });
    navigate('/dashboard');
  };

  return (
    <div className="h-full flex flex-col bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Preview Your Course</h1>
            <p className="text-sm text-muted-foreground">Experience your course from a student's perspective</p>
          </div>
          {!isPreviewOnly && (
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleSaveDraft} className="rounded-xl">
                Save as Draft
              </Button>
              <Button onClick={handlePublish} className="rounded-xl">
                Publish Course
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Slide/Assessment Card */}
          <div className="bg-card rounded-2xl shadow-lg border overflow-hidden">
            {currentItem?.type === 'slide' && currentSlide && (
              <>
                {/* Slide Content */}
                <div className="aspect-video bg-gradient-to-br from-muted/50 to-muted p-8 flex">
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
                  <div className="w-1/3 ml-6 bg-muted rounded-xl flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
                    <span className="text-muted-foreground">Slide Image</span>
                  </div>
                </div>

                {/* Audio Player Bar */}
                <div className="bg-background border-t px-6 py-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="h-10 w-10 rounded-full"
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

                    <div className="flex items-center gap-2 w-32">
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
                        className="flex-1"
                      />
                    </div>
                  </div>
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
                    <h3 className="text-lg font-semibold text-foreground">Assessment</h3>
                    <p className="text-sm text-muted-foreground">
                      {currentAssessment.questions.length} question{currentAssessment.questions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {currentAssessment.questions.map((question, qIndex) => (
                    <div key={question.id} className="bg-muted/50 rounded-xl p-6">
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
                              className="flex items-center gap-3 p-3 bg-background rounded-lg border cursor-pointer hover:border-primary/50 transition-colors"
                            >
                              <div className={`w-5 h-5 border-2 ${
                                question.type === 'checkbox' ? 'rounded' : 'rounded-full'
                              } border-muted-foreground`} />
                              <span className="text-foreground">{opt.label || `Option ${i + 1}`}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {question.type === 'open_ended' && (
                        <div className="bg-background rounded-lg p-4 border-2 border-dashed border-muted-foreground/30 min-h-[120px]">
                          <p className="text-muted-foreground">Student response area...</p>
                        </div>
                      )}
                    </div>
                  ))}
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
              className="rounded-xl"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2 px-4">
              {courseItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => goToItem(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    index === currentItemIndex 
                      ? 'w-8 bg-primary' 
                      : item.type === 'assessment'
                        ? 'w-2.5 bg-primary/40 hover:bg-primary/60'
                        : 'w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              onClick={() => goToItem(currentItemIndex + 1)}
              disabled={currentItemIndex === courseItems.length - 1}
              className="rounded-xl"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Item Counter */}
          <div className="text-center text-sm text-muted-foreground">
            {currentItem?.type === 'slide' ? 'Slide' : 'Assessment'} {currentItemIndex + 1} of {courseItems.length}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-card border-t px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Button variant="outline" onClick={onBack} className="gap-2 rounded-xl">
            <ArrowLeft className="h-4 w-4" />
            {isPreviewOnly ? 'Back to Dashboard' : 'Back to Editing'}
          </Button>
          <div className="text-sm text-muted-foreground">
            {courseItems.filter(i => i.type === 'slide').length} slides • {courseItems.filter(i => i.type === 'assessment').length} assessments
          </div>
        </div>
      </div>
    </div>
  );
}