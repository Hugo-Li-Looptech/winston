import { useState } from "react";
import { CourseVersion, Assessment, Slide } from "@/types/course";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Edit3, ChevronLeft, ChevronRight } from "lucide-react";

interface VersionCompareProps {
  selectedVersion: CourseVersion;
  currentVersion: CourseVersion;
}

interface DiffItem {
  type: 'added' | 'removed' | 'modified';
  itemType: 'slide' | 'assessment';
  title: string;
  details?: string[];
}

function compareAssessments(selectedAssessment: Assessment, currentAssessment: Assessment): string[] {
  const changes: string[] = [];
  
  if (selectedAssessment.questions.length !== currentAssessment.questions.length) {
    changes.push(`Questions: ${selectedAssessment.questions.length} → ${currentAssessment.questions.length}`);
  }
  
  const minQuestions = Math.min(selectedAssessment.questions.length, currentAssessment.questions.length);
  for (let i = 0; i < minQuestions; i++) {
    const selectedQ = selectedAssessment.questions[i];
    const currentQ = currentAssessment.questions[i];
    
    if (selectedQ.question !== currentQ.question) {
      changes.push(`Q${i + 1} text changed`);
    }
    
    if (selectedQ.type !== currentQ.type) {
      changes.push(`Q${i + 1} type: ${selectedQ.type} → ${currentQ.type}`);
    }
    
    if (selectedQ.options && currentQ.options) {
      if (selectedQ.options.length !== currentQ.options.length) {
        changes.push(`Q${i + 1} options: ${selectedQ.options.length} → ${currentQ.options.length}`);
      }
    }
    
    if (selectedQ.rubricCriteria && currentQ.rubricCriteria) {
      if (selectedQ.rubricCriteria.length !== currentQ.rubricCriteria.length) {
        changes.push(`Q${i + 1} rubric criteria: ${selectedQ.rubricCriteria.length} → ${currentQ.rubricCriteria.length}`);
      }
    }
  }
  
  if (selectedAssessment.passingThreshold !== currentAssessment.passingThreshold) {
    changes.push(`Passing threshold: ${selectedAssessment.passingThreshold}% → ${currentAssessment.passingThreshold}%`);
  }
  
  return changes;
}

function computeDiff(selected: CourseVersion, current: CourseVersion): DiffItem[] {
  const diffs: DiffItem[] = [];
  
  const selectedSlides = new Map(selected.courseSnapshot.slides.map(s => [s.id, s]));
  const currentSlides = new Map(current.courseSnapshot.slides.map(s => [s.id, s]));
  
  selected.courseSnapshot.slides.forEach((slide) => {
    if (!currentSlides.has(slide.id)) {
      diffs.push({
        type: 'removed',
        itemType: 'slide',
        title: slide.title,
      });
    }
  });
  
  current.courseSnapshot.slides.forEach((slide) => {
    if (!selectedSlides.has(slide.id)) {
      diffs.push({
        type: 'added',
        itemType: 'slide',
        title: slide.title,
      });
    }
  });
  
  selected.courseSnapshot.slides.forEach((selectedSlide) => {
    const currentSlide = currentSlides.get(selectedSlide.id);
    if (currentSlide) {
      const changes: string[] = [];
      
      if (selectedSlide.title !== currentSlide.title) {
        changes.push(`Title: "${selectedSlide.title}" → "${currentSlide.title}"`);
      }
      
      if (selectedSlide.talkPoints !== currentSlide.talkPoints) {
        const selectedWords = selectedSlide.talkPoints.split(' ').length;
        const currentWords = currentSlide.talkPoints.split(' ').length;
        changes.push(`Talk points: ${selectedWords} words → ${currentWords} words`);
      }
      
      if (changes.length > 0) {
        diffs.push({
          type: 'modified',
          itemType: 'slide',
          title: currentSlide.title,
          details: changes,
        });
      }
    }
  });
  
  const selectedAssessments = new Map(selected.courseSnapshot.assessments.map(a => [a.id, a]));
  const currentAssessments = new Map(current.courseSnapshot.assessments.map(a => [a.id, a]));
  
  selected.courseSnapshot.assessments.forEach((assessment) => {
    if (!currentAssessments.has(assessment.id)) {
      diffs.push({
        type: 'removed',
        itemType: 'assessment',
        title: `Assessment (${assessment.questions.length} question${assessment.questions.length !== 1 ? 's' : ''})`,
      });
    }
  });
  
  current.courseSnapshot.assessments.forEach((assessment) => {
    if (!selectedAssessments.has(assessment.id)) {
      diffs.push({
        type: 'added',
        itemType: 'assessment',
        title: `Assessment (${assessment.questions.length} question${assessment.questions.length !== 1 ? 's' : ''})`,
      });
    }
  });
  
  selected.courseSnapshot.assessments.forEach((selectedAssessment) => {
    const currentAssessment = currentAssessments.get(selectedAssessment.id);
    if (currentAssessment) {
      const changes = compareAssessments(selectedAssessment, currentAssessment);
      if (changes.length > 0) {
        diffs.push({
          type: 'modified',
          itemType: 'assessment',
          title: `Assessment`,
          details: changes,
        });
      }
    }
  });
  
  return diffs;
}

// Check if two slides are different
function slidesAreDifferent(slide1: Slide, slide2: Slide): boolean {
  return slide1.title !== slide2.title || slide1.talkPoints !== slide2.talkPoints;
}

// Slide comparison card component
function SlideCompareCard({ 
  slide, 
  slideIndex, 
  totalSlides, 
  onPrev, 
  onNext, 
  label,
  isModified 
}: { 
  slide: Slide | null; 
  slideIndex: number; 
  totalSlides: number; 
  onPrev: () => void; 
  onNext: () => void; 
  label: string;
  isModified: boolean;
}) {
  if (!slide) {
    return (
      <div className="flex-1 bg-muted/20 rounded-lg p-3 flex items-center justify-center">
        <span className="text-xs text-muted-foreground">No slide at this position</span>
      </div>
    );
  }

  return (
    <div className={`flex-1 bg-muted/20 rounded-lg p-3 border ${isModified ? 'border-amber-500/50' : 'border-transparent'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {isModified && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">
            Modified
          </span>
        )}
      </div>
      
      <div className="flex items-center justify-between mb-2">
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onPrev} disabled={slideIndex === 0}>
          <ChevronLeft className="h-3 w-3" />
        </Button>
        <span className="text-xs">Slide {slideIndex + 1} / {totalSlides}</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onNext} disabled={slideIndex >= totalSlides - 1}>
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium truncate">{slide.title}</h4>
        <div className="space-y-1">
          {slide.content.slice(0, 3).map((point, i) => (
            <p key={i} className="text-xs text-muted-foreground truncate">• {point}</p>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground">
          Talk points: {slide.talkPoints.split(' ').length} words
        </p>
      </div>
    </div>
  );
}

export function VersionCompare({ selectedVersion, currentVersion }: VersionCompareProps) {
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  
  const diffs = computeDiff(selectedVersion, currentVersion);
  
  const addedCount = diffs.filter(d => d.type === 'added').length;
  const removedCount = diffs.filter(d => d.type === 'removed').length;
  const modifiedCount = diffs.filter(d => d.type === 'modified').length;
  
  const selectedSlides = selectedVersion.courseSnapshot.slides;
  const currentSlides = currentVersion.courseSnapshot.slides;
  
  const selectedSlide = selectedSlides[selectedSlideIndex] || null;
  const currentSlide = currentSlides[currentSlideIndex] || null;
  
  // Check if both slides exist and are the same slide (by ID) but have differences
  const isModified = selectedSlide && currentSlide && 
    selectedSlide.id === currentSlide.id && 
    slidesAreDifferent(selectedSlide, currentSlide);
  
  if (diffs.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-3 py-2 border-b bg-muted/30">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-medium">{selectedVersion.versionName}</span>
              <span className="text-muted-foreground">{new Date(selectedVersion.timestamp).toLocaleDateString()}</span>
            </div>
            <span className="text-muted-foreground">vs</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{currentVersion.versionName}</span>
              <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px]">Current</span>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-4">
          <Edit3 className="h-6 w-6 mb-2 opacity-50" />
          <p className="text-sm">No differences found</p>
          <p className="text-xs mt-0.5">Versions are identical</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* Version comparison header */}
      <div className="px-3 py-2 border-b bg-muted/30">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-medium">{selectedVersion.versionName}</span>
            <span className="text-muted-foreground">{new Date(selectedVersion.timestamp).toLocaleDateString()}</span>
          </div>
          <span className="text-muted-foreground">vs</span>
          <div className="flex items-center gap-2">
            <span className="font-medium">{currentVersion.versionName}</span>
            <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px]">Current</span>
          </div>
        </div>
      </div>
      
      {/* Side-by-side slide comparison */}
      <div className="px-3 py-3 border-b">
        <div className="flex gap-3">
          <SlideCompareCard
            slide={selectedSlide}
            slideIndex={selectedSlideIndex}
            totalSlides={selectedSlides.length}
            onPrev={() => setSelectedSlideIndex(i => Math.max(0, i - 1))}
            onNext={() => setSelectedSlideIndex(i => Math.min(selectedSlides.length - 1, i + 1))}
            label="Selected Version"
            isModified={isModified}
          />
          <SlideCompareCard
            slide={currentSlide}
            slideIndex={currentSlideIndex}
            totalSlides={currentSlides.length}
            onPrev={() => setCurrentSlideIndex(i => Math.max(0, i - 1))}
            onNext={() => setCurrentSlideIndex(i => Math.min(currentSlides.length - 1, i + 1))}
            label="Current Version"
            isModified={isModified}
          />
        </div>
      </div>
      
      {/* Summary bar */}
      <div className="px-3 py-2 border-b flex items-center gap-3 text-xs">
        <span className="text-muted-foreground">Changes:</span>
        {addedCount > 0 && (
          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <Plus className="h-3 w-3" />+{addedCount} added
          </span>
        )}
        {removedCount > 0 && (
          <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
            <Minus className="h-3 w-3" />-{removedCount} removed
          </span>
        )}
        {modifiedCount > 0 && (
          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <Edit3 className="h-3 w-3" />~{modifiedCount} modified
          </span>
        )}
      </div>
      
      {/* Diff list */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {diffs.map((diff, index) => (
            <div
              key={index}
              className={`p-2.5 rounded-lg border ${
                diff.type === 'added'
                  ? 'bg-green-500/10 border-green-500/30'
                  : diff.type === 'removed'
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-amber-500/10 border-amber-500/30'
              }`}
            >
              <div className="flex items-center gap-2">
                {diff.type === 'added' && <Plus className="h-3.5 w-3.5 text-green-500" />}
                {diff.type === 'removed' && <Minus className="h-3.5 w-3.5 text-red-500" />}
                {diff.type === 'modified' && <Edit3 className="h-3.5 w-3.5 text-amber-500" />}
                
                <span className={`text-xs font-medium ${
                  diff.type === 'added'
                    ? 'text-green-600 dark:text-green-400'
                    : diff.type === 'removed'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}>
                  {diff.itemType === 'slide' ? 'Slide' : 'Assessment'}: {diff.title}
                </span>
                
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  diff.type === 'added'
                    ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                    : diff.type === 'removed'
                    ? 'bg-red-500/20 text-red-600 dark:text-red-400'
                    : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                }`}>
                  {diff.type}
                </span>
              </div>
              
              {diff.details && diff.details.length > 0 && (
                <div className="mt-1.5 pl-5 space-y-0.5">
                  {diff.details.map((detail, i) => (
                    <div key={i} className="text-[11px] text-muted-foreground">
                      • {detail}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
