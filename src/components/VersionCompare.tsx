import { CourseVersion, Assessment } from "@/types/course";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Minus, Edit3 } from "lucide-react";

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
  
  // Compare question counts
  if (selectedAssessment.questions.length !== currentAssessment.questions.length) {
    changes.push(`Questions: ${selectedAssessment.questions.length} → ${currentAssessment.questions.length}`);
  }
  
  // Compare individual questions
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
    
    // Compare options for multiple choice/checkbox
    if (selectedQ.options && currentQ.options) {
      if (selectedQ.options.length !== currentQ.options.length) {
        changes.push(`Q${i + 1} options: ${selectedQ.options.length} → ${currentQ.options.length}`);
      }
    }
    
    // Compare rubric for open-ended
    if (selectedQ.rubricCriteria && currentQ.rubricCriteria) {
      if (selectedQ.rubricCriteria.length !== currentQ.rubricCriteria.length) {
        changes.push(`Q${i + 1} rubric criteria: ${selectedQ.rubricCriteria.length} → ${currentQ.rubricCriteria.length}`);
      }
    }
  }
  
  // Compare passing threshold
  if (selectedAssessment.passingThreshold !== currentAssessment.passingThreshold) {
    changes.push(`Passing threshold: ${selectedAssessment.passingThreshold}% → ${currentAssessment.passingThreshold}%`);
  }
  
  return changes;
}

function computeDiff(selected: CourseVersion, current: CourseVersion): DiffItem[] {
  const diffs: DiffItem[] = [];
  
  const selectedSlides = new Map(selected.courseSnapshot.slides.map(s => [s.id, s]));
  const currentSlides = new Map(current.courseSnapshot.slides.map(s => [s.id, s]));
  
  // Find removed slides (in selected but not in current)
  selected.courseSnapshot.slides.forEach((slide) => {
    if (!currentSlides.has(slide.id)) {
      diffs.push({
        type: 'removed',
        itemType: 'slide',
        title: slide.title,
      });
    }
  });
  
  // Find added slides (in current but not in selected)
  current.courseSnapshot.slides.forEach((slide) => {
    if (!selectedSlides.has(slide.id)) {
      diffs.push({
        type: 'added',
        itemType: 'slide',
        title: slide.title,
      });
    }
  });
  
  // Find modified slides
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
  
  // Compare assessments by ID
  const selectedAssessments = new Map(selected.courseSnapshot.assessments.map(a => [a.id, a]));
  const currentAssessments = new Map(current.courseSnapshot.assessments.map(a => [a.id, a]));
  
  // Find removed assessments
  selected.courseSnapshot.assessments.forEach((assessment) => {
    if (!currentAssessments.has(assessment.id)) {
      diffs.push({
        type: 'removed',
        itemType: 'assessment',
        title: `Assessment (${assessment.questions.length} question${assessment.questions.length !== 1 ? 's' : ''})`,
      });
    }
  });
  
  // Find added assessments
  current.courseSnapshot.assessments.forEach((assessment) => {
    if (!selectedAssessments.has(assessment.id)) {
      diffs.push({
        type: 'added',
        itemType: 'assessment',
        title: `Assessment (${assessment.questions.length} question${assessment.questions.length !== 1 ? 's' : ''})`,
      });
    }
  });
  
  // Find modified assessments
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

export function VersionCompare({ selectedVersion, currentVersion }: VersionCompareProps) {
  const diffs = computeDiff(selectedVersion, currentVersion);
  
  if (diffs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
        <Edit3 className="h-8 w-8 mb-2 opacity-50" />
        <p className="text-sm">No differences found</p>
        <p className="text-xs mt-1">This version is identical to the current version</p>
      </div>
    );
  }
  
  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-3">
        <div className="text-sm text-muted-foreground mb-4">
          Comparing <span className="font-medium text-foreground">{selectedVersion.versionName}</span> with{" "}
          <span className="font-medium text-foreground">{currentVersion.versionName}</span>
        </div>
        
        {diffs.map((diff, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${
              diff.type === 'added'
                ? 'bg-green-500/10 border-green-500/30'
                : diff.type === 'removed'
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-amber-500/10 border-amber-500/30'
            }`}
          >
            <div className="flex items-center gap-2">
              {diff.type === 'added' && <Plus className="h-4 w-4 text-green-500" />}
              {diff.type === 'removed' && <Minus className="h-4 w-4 text-red-500" />}
              {diff.type === 'modified' && <Edit3 className="h-4 w-4 text-amber-500" />}
              
              <span className={`text-sm font-medium ${
                diff.type === 'added'
                  ? 'text-green-600 dark:text-green-400'
                  : diff.type === 'removed'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}>
                {diff.itemType === 'slide' ? 'Slide' : 'Assessment'}: {diff.title}
              </span>
              
              <span className={`text-xs px-1.5 py-0.5 rounded ${
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
              <div className="mt-2 pl-6 space-y-1">
                {diff.details.map((detail, i) => (
                  <div key={i} className="text-xs text-muted-foreground">
                    • {detail}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
