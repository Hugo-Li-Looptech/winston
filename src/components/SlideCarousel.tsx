import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slide } from '@/types/course';

interface SlideCarouselProps {
  slides: Slide[];
  currentIndex: number;
  onSlideSelect: (index: number) => void;
}

export function SlideCarousel({ slides, currentIndex, onSlideSelect }: SlideCarouselProps) {
  const scrollLeft = () => {
    const newIndex = Math.max(0, currentIndex - 1);
    onSlideSelect(newIndex);
  };

  const scrollRight = () => {
    const newIndex = Math.min(slides.length - 1, currentIndex + 1);
    onSlideSelect(newIndex);
  };

  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 rounded-xl">
      <Button
        variant="ghost"
        size="icon"
        onClick={scrollLeft}
        disabled={currentIndex === 0}
        className="shrink-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 flex-1">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => onSlideSelect(index)}
            className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
              index === currentIndex
                ? 'border-primary shadow-md scale-105'
                : 'border-transparent hover:border-muted-foreground/30'
            }`}
          >
            <div className="w-full h-full bg-card flex items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground">{index + 1}</span>
            </div>
          </button>
        ))}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={scrollRight}
        disabled={currentIndex === slides.length - 1}
        className="shrink-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
