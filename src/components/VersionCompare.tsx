import { useState, useMemo } from "react";
import { CourseVersion, Assessment, Slide } from "@/types/course";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Edit3, ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface VersionCompareProps {
  selectedVersion: CourseVersion;
  currentVersion: CourseVersion;
}

interface LineDiff {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
}

interface SlideDiff {
  slideId: string;
  title: string;
  status: 'added' | 'removed' | 'modified' | 'unchanged';
  titleDiff?: { old: string; new: string };
  contentDiffs: LineDiff[];
  talkPointsDiffs: LineDiff[];
}

interface AssessmentDiff {
  assessmentId: string;
  status: 'added' | 'removed' | 'modified';
  title: string;
  changes: string[];
}

// Compute line-by-line diff using LCS approach
function computeLineDiff(oldLines: string[], newLines: string[]): LineDiff[] {
  const result: LineDiff[] = [];
  
  // Simple diff algorithm - find matching lines and mark additions/removals
  const oldSet = new Set(oldLines);
  const newSet = new Set(newLines);
  
  let oldIdx = 0;
  let newIdx = 0;
  
  while (oldIdx < oldLines.length || newIdx < newLines.length) {
    const oldLine = oldLines[oldIdx];
    const newLine = newLines[newIdx];
    
    if (oldIdx >= oldLines.length) {
      // All remaining new lines are additions
      result.push({ type: 'added', content: newLines[newIdx] });
      newIdx++;
    } else if (newIdx >= newLines.length) {
      // All remaining old lines are removals
      result.push({ type: 'removed', content: oldLines[oldIdx] });
      oldIdx++;
    } else if (oldLine === newLine) {
      // Lines match
      result.push({ type: 'unchanged', content: oldLine });
      oldIdx++;
      newIdx++;
    } else if (!newSet.has(oldLine) && !oldSet.has(newLine)) {
      // Both are unique - show as removal then addition
      result.push({ type: 'removed', content: oldLine });
      result.push({ type: 'added', content: newLine });
      oldIdx++;
      newIdx++;
    } else if (!newSet.has(oldLine)) {
      // Old line was removed
      result.push({ type: 'removed', content: oldLine });
      oldIdx++;
    } else {
      // New line was added
      result.push({ type: 'added', content: newLine });
      newIdx++;
    }
  }
  
  return result;
}

// Compute comprehensive slide diffs
function computeSlideDiffs(selectedSlides: Slide[], currentSlides: Slide[]): SlideDiff[] {
  const diffs: SlideDiff[] = [];
  const selectedMap = new Map(selectedSlides.map(s => [s.id, s]));
  const currentMap = new Map(currentSlides.map(s => [s.id, s]));
  
  // Check for removed slides (in selected but not in current)
  selectedSlides.forEach(slide => {
    if (!currentMap.has(slide.id)) {
      diffs.push({
        slideId: slide.id,
        title: slide.title,
        status: 'removed',
        contentDiffs: slide.content.map(c => ({ type: 'removed', content: c })),
        talkPointsDiffs: slide.talkPoints.split('. ').filter(Boolean).map(t => ({ type: 'removed', content: t })),
      });
    }
  });
  
  // Check for added slides (in current but not in selected)
  currentSlides.forEach(slide => {
    if (!selectedMap.has(slide.id)) {
      diffs.push({
        slideId: slide.id,
        title: slide.title,
        status: 'added',
        contentDiffs: slide.content.map(c => ({ type: 'added', content: c })),
        talkPointsDiffs: slide.talkPoints.split('. ').filter(Boolean).map(t => ({ type: 'added', content: t })),
      });
    }
  });
  
  // Check for modified slides
  currentSlides.forEach(currentSlide => {
    const selectedSlide = selectedMap.get(currentSlide.id);
    if (selectedSlide) {
      const titleChanged = selectedSlide.title !== currentSlide.title;
      const contentDiffs = computeLineDiff(selectedSlide.content, currentSlide.content);
      const talkPointsDiffs = computeLineDiff(
        selectedSlide.talkPoints.split('. ').filter(Boolean),
        currentSlide.talkPoints.split('. ').filter(Boolean)
      );
      
      const hasContentChanges = contentDiffs.some(d => d.type !== 'unchanged');
      const hasTalkPointChanges = talkPointsDiffs.some(d => d.type !== 'unchanged');
      
      if (titleChanged || hasContentChanges || hasTalkPointChanges) {
        diffs.push({
          slideId: currentSlide.id,
          title: currentSlide.title,
          status: 'modified',
          titleDiff: titleChanged ? { old: selectedSlide.title, new: currentSlide.title } : undefined,
          contentDiffs,
          talkPointsDiffs,
        });
      }
    }
  });
  
  return diffs;
}

// Compute assessment diffs
function computeAssessmentDiffs(selectedAssessments: Assessment[], currentAssessments: Assessment[]): AssessmentDiff[] {
  const diffs: AssessmentDiff[] = [];
  const selectedMap = new Map(selectedAssessments.map(a => [a.id, a]));
  const currentMap = new Map(currentAssessments.map(a => [a.id, a]));
  
  // Removed assessments
  selectedAssessments.forEach(assessment => {
    if (!currentMap.has(assessment.id)) {
      diffs.push({
        assessmentId: assessment.id,
        status: 'removed',
        title: `Assessment (${assessment.questions.length} questions)`,
        changes: [`Removed ${assessment.questions.length} question(s)`],
      });
    }
  });
  
  // Added assessments
  currentAssessments.forEach(assessment => {
    if (!selectedMap.has(assessment.id)) {
      diffs.push({
        assessmentId: assessment.id,
        status: 'added',
        title: `Assessment (${assessment.questions.length} questions)`,
        changes: [`Added ${assessment.questions.length} question(s)`],
      });
    }
  });
  
  // Modified assessments
  currentAssessments.forEach(currentAssessment => {
    const selectedAssessment = selectedMap.get(currentAssessment.id);
    if (selectedAssessment) {
      const changes: string[] = [];
      
      if (selectedAssessment.questions.length !== currentAssessment.questions.length) {
        changes.push(`Questions: ${selectedAssessment.questions.length} → ${currentAssessment.questions.length}`);
      }
      
      if (selectedAssessment.passingThreshold !== currentAssessment.passingThreshold) {
        changes.push(`Threshold: ${selectedAssessment.passingThreshold}% → ${currentAssessment.passingThreshold}%`);
      }
      
      if (changes.length > 0) {
        diffs.push({
          assessmentId: currentAssessment.id,
          status: 'modified',
          title: 'Assessment',
          changes,
        });
      }
    }
  });
  
  return diffs;
}

// Line component for diff display
function DiffLine({ diff }: { diff: LineDiff }) {
  if (diff.type === 'added') {
    return (
      <div className="flex items-start gap-2 bg-green-500/15 border-l-2 border-green-500 px-2 py-0.5">
        <span className="text-green-600 dark:text-green-400 font-mono text-xs select-none">+</span>
        <span className="text-xs text-green-700 dark:text-green-300">{diff.content}</span>
      </div>
    );
  }
  
  if (diff.type === 'removed') {
    return (
      <div className="flex items-start gap-2 bg-red-500/15 border-l-2 border-red-500 px-2 py-0.5">
        <span className="text-red-600 dark:text-red-400 font-mono text-xs select-none">-</span>
        <span className="text-xs text-red-700 dark:text-red-300">{diff.content}</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-start gap-2 px-2 py-0.5">
      <span className="text-muted-foreground font-mono text-xs select-none">&nbsp;</span>
      <span className="text-xs text-muted-foreground">{diff.content}</span>
    </div>
  );
}

// Slide diff block component
function SlideDiffBlock({ diff, defaultOpen = false }: { diff: SlideDiff; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const statusColors = {
    added: 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400',
    removed: 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400',
    modified: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
    unchanged: 'bg-muted/50 border-muted text-muted-foreground',
  };
  
  const statusIcons = {
    added: <Plus className="h-3 w-3" />,
    removed: <Minus className="h-3 w-3" />,
    modified: <Edit3 className="h-3 w-3" />,
    unchanged: null,
  };
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={`rounded-lg border ${statusColors[diff.status]}`}>
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center gap-2 p-2.5 hover:bg-muted/20 transition-colors">
            {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            {statusIcons[diff.status]}
            <span className="text-xs font-medium flex-1 text-left">Slide: {diff.title}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
              diff.status === 'added' ? 'bg-green-500/20' :
              diff.status === 'removed' ? 'bg-red-500/20' :
              'bg-amber-500/20'
            }`}>
              {diff.status}
            </span>
          </button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="border-t border-inherit p-2 space-y-3">
            {/* Title change */}
            {diff.titleDiff && (
              <div className="space-y-1">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Title</span>
                <div className="bg-red-500/15 border-l-2 border-red-500 px-2 py-0.5">
                  <span className="text-red-600 dark:text-red-400 font-mono text-xs">- </span>
                  <span className="text-xs text-red-700 dark:text-red-300">{diff.titleDiff.old}</span>
                </div>
                <div className="bg-green-500/15 border-l-2 border-green-500 px-2 py-0.5">
                  <span className="text-green-600 dark:text-green-400 font-mono text-xs">+ </span>
                  <span className="text-xs text-green-700 dark:text-green-300">{diff.titleDiff.new}</span>
                </div>
              </div>
            )}
            
            {/* Content changes */}
            {diff.contentDiffs.length > 0 && diff.contentDiffs.some(d => d.type !== 'unchanged') && (
              <div className="space-y-1">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Content</span>
                <div className="rounded border bg-muted/20">
                  {diff.contentDiffs.map((lineDiff, i) => (
                    <DiffLine key={i} diff={lineDiff} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Talk points changes */}
            {diff.talkPointsDiffs.length > 0 && diff.talkPointsDiffs.some(d => d.type !== 'unchanged') && (
              <div className="space-y-1">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Talk Points</span>
                <div className="rounded border bg-muted/20">
                  {diff.talkPointsDiffs.map((lineDiff, i) => (
                    <DiffLine key={i} diff={lineDiff} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// Assessment diff block component
function AssessmentDiffBlock({ diff }: { diff: AssessmentDiff }) {
  const statusColors = {
    added: 'bg-green-500/10 border-green-500/30',
    removed: 'bg-red-500/10 border-red-500/30',
    modified: 'bg-amber-500/10 border-amber-500/30',
  };
  
  const statusTextColors = {
    added: 'text-green-600 dark:text-green-400',
    removed: 'text-red-600 dark:text-red-400',
    modified: 'text-amber-600 dark:text-amber-400',
  };
  
  return (
    <div className={`rounded-lg border p-2.5 ${statusColors[diff.status]}`}>
      <div className="flex items-center gap-2">
        {diff.status === 'added' && <Plus className={`h-3 w-3 ${statusTextColors[diff.status]}`} />}
        {diff.status === 'removed' && <Minus className={`h-3 w-3 ${statusTextColors[diff.status]}`} />}
        {diff.status === 'modified' && <Edit3 className={`h-3 w-3 ${statusTextColors[diff.status]}`} />}
        <span className={`text-xs font-medium ${statusTextColors[diff.status]}`}>{diff.title}</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
          diff.status === 'added' ? 'bg-green-500/20 text-green-600 dark:text-green-400' :
          diff.status === 'removed' ? 'bg-red-500/20 text-red-600 dark:text-red-400' :
          'bg-amber-500/20 text-amber-600 dark:text-amber-400'
        }`}>
          {diff.status}
        </span>
      </div>
      {diff.changes.length > 0 && (
        <div className="mt-1.5 pl-5 space-y-0.5">
          {diff.changes.map((change, i) => (
            <div key={i} className="text-[11px] text-muted-foreground">• {change}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export function VersionCompare({ selectedVersion, currentVersion }: VersionCompareProps) {
  const slideDiffs = useMemo(() => 
    computeSlideDiffs(selectedVersion.courseSnapshot.slides, currentVersion.courseSnapshot.slides),
    [selectedVersion, currentVersion]
  );
  
  const assessmentDiffs = useMemo(() =>
    computeAssessmentDiffs(selectedVersion.courseSnapshot.assessments, currentVersion.courseSnapshot.assessments),
    [selectedVersion, currentVersion]
  );
  
  const addedCount = slideDiffs.filter(d => d.status === 'added').length + assessmentDiffs.filter(d => d.status === 'added').length;
  const removedCount = slideDiffs.filter(d => d.status === 'removed').length + assessmentDiffs.filter(d => d.status === 'removed').length;
  const modifiedCount = slideDiffs.filter(d => d.status === 'modified').length + assessmentDiffs.filter(d => d.status === 'modified').length;
  
  const hasChanges = slideDiffs.length > 0 || assessmentDiffs.length > 0;
  
  if (!hasChanges) {
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
      {/* Header */}
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
      
      {/* Summary bar - GitHub style */}
      <div className="px-3 py-2 border-b flex items-center gap-4 text-xs bg-muted/20">
        <span className="text-muted-foreground font-medium">Changes:</span>
        {addedCount > 0 && (
          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <Plus className="h-3 w-3" />
            <span className="font-medium">{addedCount}</span> added
          </span>
        )}
        {removedCount > 0 && (
          <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
            <Minus className="h-3 w-3" />
            <span className="font-medium">{removedCount}</span> removed
          </span>
        )}
        {modifiedCount > 0 && (
          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <Edit3 className="h-3 w-3" />
            <span className="font-medium">{modifiedCount}</span> modified
          </span>
        )}
      </div>
      
      {/* Diff content */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {/* Slide diffs */}
          {slideDiffs.map((diff, index) => (
            <SlideDiffBlock 
              key={diff.slideId} 
              diff={diff} 
              defaultOpen={index === 0}
            />
          ))}
          
          {/* Assessment diffs */}
          {assessmentDiffs.map((diff) => (
            <AssessmentDiffBlock key={diff.assessmentId} diff={diff} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}