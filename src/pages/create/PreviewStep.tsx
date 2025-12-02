import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCourse } from '@/contexts/CourseContext';
import { ChevronLeft, ChevronRight, Play, Pause, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface PreviewStepProps {
  onBack: () => void;
}

export function PreviewStep({ onBack }: PreviewStepProps) {
  const navigate = useNavigate();
  const { currentCourse, setCourses, courses } = useCourse();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const slides = currentCourse.slides;
  const currentSlide = slides[currentSlideIndex];

  const goToSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlideIndex(index);
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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Preview Your Course</h2>
        <p className="text-muted-foreground mt-2">
          Experience your course from a student's perspective
        </p>
      </div>

      {/* Main Preview Area */}
      <div className="bg-secondary border-2 border-foreground min-h-[500px] relative">
        {/* Slide Content */}
        <div className="p-12">
          <div className="flex gap-8">
            <div className="flex-1">
              <h2 className="text-4xl font-bold mb-8">{currentSlide?.title || 'Slide Title'}</h2>
              <div className="space-y-4 text-lg">
                {currentSlide?.content.map((point, i) => (
                  <p key={i}>• {point}</p>
                ))}
              </div>
            </div>
            <div className="w-1/3 h-64 bg-muted border-2 border-foreground" />
          </div>
        </div>

        {/* Talk Points Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-background/95 border-t-2 border-foreground p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <div className="flex-1">
              <p className="text-sm font-medium">Winston is speaking:</p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {currentSlide?.talkPoints}
              </p>
            </div>
            <Button variant="ghost" size="icon">
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => goToSlide(currentSlideIndex - 1)}
          disabled={currentSlideIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <div className="flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-3 w-3 rounded-full border-2 border-foreground transition-colors ${
                index === currentSlideIndex ? 'bg-foreground' : 'bg-background'
              }`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          onClick={() => goToSlide(currentSlideIndex + 1)}
          disabled={currentSlideIndex === slides.length - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Slide Counter */}
      <div className="text-center text-sm text-muted-foreground">
        Slide {currentSlideIndex + 1} of {slides.length}
      </div>

      {/* Assessments Preview */}
      {currentCourse.assessments.length > 0 && currentSlideIndex === slides.length - 1 && (
        <div className="border-2 border-foreground p-6">
          <h3 className="text-xl font-bold mb-4">Course Assessment Preview</h3>
          <p className="text-muted-foreground mb-4">
            This course includes {currentCourse.assessments.length} assessment question(s).
          </p>
          <div className="space-y-3">
            {currentCourse.assessments.slice(0, 2).map((assessment, index) => (
              <div key={assessment.id} className="bg-secondary p-3">
                <p className="font-medium">
                  Q{index + 1}: {assessment.question}
                </p>
              </div>
            ))}
            {currentCourse.assessments.length > 2 && (
              <p className="text-sm text-muted-foreground">
                + {currentCourse.assessments.length - 2} more questions
              </p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back to Editing
        </Button>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Save as Draft
          </Button>
          <Button onClick={handlePublish}>
            Publish Course
          </Button>
        </div>
      </div>
    </div>
  );
}
