import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Upload, Wand2, FileText, Eye, ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCourse } from '@/contexts/CourseContext';

interface TutorialSlideshowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const tutorialSlides = [
  {
    icon: GraduationCap,
    title: 'Welcome to Winston',
    description: 'Your AI-powered course creation platform. Transform your presentations into engaging learning experiences with intelligent talk points and assessments.',
    highlight: 'Let\'s walk you through how it works!',
  },
  {
    icon: Upload,
    title: 'Upload Your Slides',
    description: 'Start by uploading your presentation file (PDF, PPT, or PPTX). You can also add supplementary materials that Winston can reference to enrich your course content.',
    highlight: 'Supported formats: PDF, PPT, PPTX, DOC, DOCX',
  },
  {
    icon: Wand2,
    title: 'Configure Your AI',
    description: 'Tell Winston about your audience and learning goals. Set the learning level, target audience, and delivery style so Winston can tailor the content perfectly.',
    highlight: 'Winston adapts to your teaching style',
  },
  {
    icon: FileText,
    title: 'Edit Talk Points',
    description: 'Winston generates talk points for each slide. Review and refine them, add assessments between slides, and customize the learning experience to your needs.',
    highlight: 'Full control over your content',
  },
  {
    icon: Eye,
    title: 'Preview & Publish',
    description: 'Preview your course from a student\'s perspective before publishing. Make sure everything looks perfect, then share it with your learners!',
    highlight: 'You\'re ready to create amazing courses!',
  },
];

export function TutorialSlideshow({ open, onOpenChange }: TutorialSlideshowProps) {
  const navigate = useNavigate();
  const { resetCurrentCourse } = useCourse();
  const [currentSlide, setCurrentSlide] = useState(0);

  const isLastSlide = currentSlide === tutorialSlides.length - 1;
  const isFirstSlide = currentSlide === 0;
  const slide = tutorialSlides[currentSlide];
  const Icon = slide.icon;

  const handleNext = () => {
    if (isLastSlide) {
      resetCurrentCourse();
      onOpenChange(false);
      navigate('/create');
    } else {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstSlide) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleClose = () => {
    setCurrentSlide(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl">
        {/* Content */}
        <div className="p-8 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Icon className="h-8 w-8 text-primary" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-foreground mb-4">{slide.title}</h2>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed mb-4">{slide.description}</p>

          {/* Highlight */}
          <p className="text-sm font-medium text-primary">{slide.highlight}</p>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8">
          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-6">
            {tutorialSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? 'w-6 bg-primary'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isFirstSlide}
              className="rounded-xl gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            <Button onClick={handleNext} className="rounded-xl gap-2 flex-1 max-w-[200px]">
              {isLastSlide ? 'Get Started' : 'Next'}
              {!isLastSlide && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}