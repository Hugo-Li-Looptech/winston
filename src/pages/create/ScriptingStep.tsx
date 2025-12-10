import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Plus, Trash2, Clock, User, Tag, BookOpen } from "lucide-react";
import { useCourse } from "@/contexts/CourseContext";
import { QuickEditsPanel } from "@/components/QuickEditsPanel";
import { RichTextToolbar } from "@/components/RichTextToolbar";
import { SlideDetailsPanel } from "@/components/SlideDetailsPanel";
import { CommentsPanel } from "@/components/CommentsPanel";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { CourseEditorHeader } from "@/components/CourseEditorHeader";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ClipboardList } from "lucide-react";
import { WizardStep, QuestionType, Assessment, AssessmentQuestion } from "@/types/course";
import { RubricEditor } from "@/components/RubricEditor";
import { Badge } from "@/components/ui/badge";

interface ScriptingStepProps {
  onContinue: () => void;
  onBack: () => void;
  onStepClick?: (step: WizardStep) => void;
}

export function ScriptingStep({ onContinue, onBack, onStepClick }: ScriptingStepProps) {
  const navigate = useNavigate();
  const { 
    currentCourse, 
    setSlides, 
    insertAssessmentAtIndex, 
    addQuestionToAssessment, 
    removeQuestionFromAssessment, 
    setCourseItems, 
    setCourseTitle, 
    publishCourse, 
    saveCourseAsDraft,
    markStepComplete,
    comments,
    addComment,
    resolveComment,
    setMetadata
  } = useCourse();
  const { slides, courseItems, courseTitle, metadata } = currentCourse;
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isVerbose, setIsVerbose] = useState(false);
  const [isStreamlined, setIsStreamlined] = useState(false);
  const [activeTab, setActiveTab] = useState<"scripting" | "metadata">("scripting");
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(true);
  const [isCommentsPanelOpen, setIsCommentsPanelOpen] = useState(false);
  
  // AI Suggestion states
  const [suggestedTalkPoints, setSuggestedTalkPoints] = useState<string | null>(null);
  const [suggestionType, setSuggestionType] = useState<'verbose' | 'streamlined' | 'custom' | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Get current item (slide or assessment)
  const currentItem = courseItems[currentItemIndex];
  const currentSlide = currentItem?.type === "slide" ? currentItem.slideData : null;
  const currentAssessment = currentItem?.type === "assessment" ? currentItem.assessmentData : null;
  const currentQuestion = currentAssessment?.questions?.[currentQuestionIndex] || null;

  // Reset question index when switching assessment items
  useEffect(() => {
    setCurrentQuestionIndex(0);
  }, [currentItemIndex]);

  const updateTalkPoints = (newTalkPoints: string) => {
    if (!currentSlide) return;
    const updatedSlides = slides.map((slide) =>
      slide.id === currentSlide.id
        ? { ...slide, talkPoints: newTalkPoints }
        : slide,
    );
    setSlides(updatedSlides);
    setHasUnsavedChanges(true);
  };

  const goToItem = (index: number) => {
    if (index >= 0 && index < courseItems.length) {
      setCurrentItemIndex(index);
      // Clear suggestions when changing items
      setSuggestedTalkPoints(null);
      setSuggestionType(null);
      setIsVerbose(false);
      setIsStreamlined(false);
    }
  };

  // Mock AI generation for suggestions
  const generateSuggestion = (type: 'verbose' | 'streamlined' | 'custom', prompt?: string) => {
    if (!currentSlide) return;
    
    setIsGenerating(true);
    setSuggestionType(type);
    
    // Simulate AI generation delay
    setTimeout(() => {
      let suggestion = '';
      const currentText = currentSlide.talkPoints;
      
      if (type === 'verbose') {
        suggestion = `${currentText}\n\nLet me elaborate further on this topic. This is an important concept that deserves more detailed explanation. We should consider multiple perspectives and provide concrete examples to help learners fully grasp the material. Additionally, it's worth noting the historical context and practical applications of these ideas.`;
      } else if (type === 'streamlined') {
        // Create a shortened version
        const sentences = currentText.split('. ');
        suggestion = sentences.slice(0, Math.ceil(sentences.length / 2)).join('. ') + '.';
      } else if (type === 'custom' && prompt) {
        suggestion = `Based on your request "${prompt}": ${currentText}\n\n[Winston's customized modification based on your instructions would appear here.]`;
      }
      
      setSuggestedTalkPoints(suggestion);
      setIsGenerating(false);
    }, 1500);
  };

  const handleAskWinston = (prompt: string) => {
    generateSuggestion('custom', prompt);
  };

  const handleApplyQuickEdit = (type: 'verbose' | 'streamlined') => {
    generateSuggestion(type);
  };

  const handleAcceptSuggestion = () => {
    if (suggestedTalkPoints && currentSlide) {
      updateTalkPoints(suggestedTalkPoints);
      setSuggestedTalkPoints(null);
      setSuggestionType(null);
      setIsVerbose(false);
      setIsStreamlined(false);
    }
  };

  const handleRejectSuggestion = () => {
    setSuggestedTalkPoints(null);
    setSuggestionType(null);
    setIsVerbose(false);
    setIsStreamlined(false);
  };

  const handleComment = () => {
    setIsCommentsPanelOpen(true);
  };

  const handleAddComment = (content: string) => {
    addComment(content, currentSlide?.id);
  };

  const handleSave = () => {
    markStepComplete('scripting');
    saveCourseAsDraft();
    // Don't navigate - just save in place
  };

  const handlePublish = () => {
    markStepComplete('scripting');
    publishCourse();
    // Don't navigate - let header handle publish state
  };

  const handleAddAssessment = () => {
    insertAssessmentAtIndex(currentItemIndex);
    setCurrentItemIndex(currentItemIndex + 1);
  };

  // Assessment update functions
  const updateAssessment = (updates: Partial<Assessment>) => {
    if (!currentAssessment) return;
    setCourseItems(
      courseItems.map((item) =>
        item.id === currentAssessment.id
          ? { ...item, assessmentData: { ...currentAssessment, ...updates } }
          : item
      )
    );
  };

  // Question update functions
  const updateCurrentQuestion = (updates: Partial<AssessmentQuestion>) => {
    if (!currentAssessment || !currentQuestion) return;
    const updatedQuestions = currentAssessment.questions.map((q, idx) =>
      idx === currentQuestionIndex ? { ...q, ...updates } : q
    );
    updateAssessment({ questions: updatedQuestions });
  };

  const updateQuestionType = (type: QuestionType) => {
    if (!currentQuestion) return;
    const updates: Partial<AssessmentQuestion> = { type };
    if (type === 'open_ended') {
      updates.options = undefined;
      updates.rubricCriteria = [];
      updates.rubricCells = [];
    } else {
      updates.rubricCriteria = undefined;
      updates.rubricCells = undefined;
      updates.options = [
        { label: '', isCorrect: false },
        { label: '', isCorrect: false },
        { label: '', isCorrect: false },
      ];
    }
    updateCurrentQuestion(updates);
  };

  const updateOptionLabel = (index: number, label: string) => {
    if (!currentQuestion?.options) return;
    const newOptions = [...currentQuestion.options];
    newOptions[index] = { ...newOptions[index], label };
    updateCurrentQuestion({ options: newOptions });
  };

  const toggleCorrectAnswer = (index: number) => {
    if (!currentQuestion?.options) return;
    const newOptions = currentQuestion.options.map((opt, i) => {
      if (currentQuestion.type === 'multi_selection') {
        return { ...opt, isCorrect: i === index };
      }
      return i === index ? { ...opt, isCorrect: !opt.isCorrect } : opt;
    });
    updateCurrentQuestion({ options: newOptions });
  };

  const addOption = () => {
    if (!currentQuestion?.options) return;
    updateCurrentQuestion({
      options: [...currentQuestion.options, { label: '', isCorrect: false }],
    });
  };

  const removeOption = (index: number) => {
    if (!currentQuestion?.options || currentQuestion.options.length <= 2) return;
    updateCurrentQuestion({
      options: currentQuestion.options.filter((_, i) => i !== index),
    });
  };

  const handleAddQuestion = () => {
    if (!currentAssessment) return;
    addQuestionToAssessment(currentAssessment.id);
    // Navigate to the new question
    setCurrentQuestionIndex(currentAssessment.questions.length);
  };

  const handleDeleteQuestion = () => {
    if (!currentAssessment || !currentQuestion) return;
    if (currentAssessment.questions.length <= 1) {
      // If it's the last question, delete the whole assessment
      deleteAssessment();
      return;
    }
    removeQuestionFromAssessment(currentAssessment.id, currentQuestion.id);
    setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1));
  };

  const deleteAssessment = () => {
    if (!currentAssessment) return;
    const newItems = courseItems.filter((item) => item.id !== currentAssessment.id);
    setCourseItems(newItems);
    setCurrentItemIndex(Math.max(0, currentItemIndex - 1));
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentItemIndex < courseItems.length - 1) {
      goToItem(currentItemIndex + 1);
    } else {
      markStepComplete('scripting');
      onContinue();
    }
  };

  const handleBack = () => {
    if (currentItemIndex > 0) {
      goToItem(currentItemIndex - 1);
    } else {
      onBack();
    }
  };

  // Calculate visible thumbnails (show 5 at a time)
  const visibleCount = 5;
  const startIndex = Math.max(0, Math.min(currentItemIndex - 2, courseItems.length - visibleCount));
  const visibleItems = courseItems.slice(startIndex, startIndex + visibleCount);

  // Calculate metadata
  const totalSlides = courseItems.filter(i => i.type === 'slide').length;
  const totalAssessments = courseItems.filter(i => i.type === 'assessment').length;

  return (
    <div className="h-full flex flex-col">
      {/* Header with Progress Bar */}
      <CourseEditorHeader
        currentStep="scripting"
        courseTitle={courseTitle || 'Untitled Course'}
        isCollapsed={isHeaderCollapsed}
        onToggleCollapse={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
        onClose={() => navigate("/dashboard")}
        onStepClick={onStepClick}
        showActions={true}
        onTitleChange={setCourseTitle}
        onComment={handleComment}
        onSave={handleSave}
        onPublish={handlePublish}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* Main Content Area with Resizable Panels */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel - Editor */}
          <ResizablePanel defaultSize={40} minSize={25} maxSize={60}>
            <div className="h-full bg-card flex flex-col">
              {/* Tab Navigation - aligned with carousel */}
              <div className="bg-card border-b px-6 h-14 flex items-end">
                <div className="flex gap-4">
                  <button
                    onClick={() => setActiveTab("scripting")}
                    className={`text-sm font-medium pb-2 border-b-2 transition-colors ${activeTab === "scripting" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                  >
                    Scripting
                  </button>
                  <button
                    onClick={() => setActiveTab("metadata")}
                    className={`text-sm font-medium pb-2 border-b-2 transition-colors ${activeTab === "metadata" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                  >
                    Metadata
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activeTab === "scripting" && (
                  <>
                    {/* Show different content based on item type */}
                    {currentItem?.type === "slide" && currentSlide && (
                      <>
                        {/* Talk Points Header */}
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-1">Talk Points</h3>
                          <div className="h-0.5 w-20 bg-primary rounded-full" />
                        </div>

                        {/* Quick Edits - Horizontal Layout */}
                        <QuickEditsPanel
                          isVerbose={isVerbose}
                          isStreamlined={isStreamlined}
                          onVerboseChange={setIsVerbose}
                          onStreamlinedChange={setIsStreamlined}
                          onAskWinston={handleAskWinston}
                          onApplyQuickEdit={handleApplyQuickEdit}
                          suggestedTalkPoints={suggestedTalkPoints}
                          suggestionType={suggestionType}
                          isGenerating={isGenerating}
                          onAcceptSuggestion={handleAcceptSuggestion}
                          onRejectSuggestion={handleRejectSuggestion}
                        />

                        {/* Rich Text Toolbar */}
                        <RichTextToolbar />

                        {/* Talk Points Textarea */}
                        <Textarea
                          value={currentSlide?.talkPoints || ""}
                          onChange={(e) => updateTalkPoints(e.target.value)}
                          placeholder="Enter talk points for this slide..."
                          className="min-h-[280px] resize-none text-sm leading-relaxed"
                        />

                        {/* Preview Button */}
                        <Button variant="outline" className="w-full rounded-xl">
                          Preview
                        </Button>
                      </>
                    )}

                    {currentItem?.type === "assessment" && currentAssessment && currentQuestion && (
                      <>
                        {/* Question Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                              <ClipboardList className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium text-primary">
                                Q{currentQuestionIndex + 1} - {currentQuestion.type === 'multi_selection' ? 'Multiple Choice' : currentQuestion.type === 'checkbox' ? 'Checkbox' : 'Open Ended'}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDeleteQuestion}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            {currentAssessment.questions.length <= 1 ? 'Delete Assessment' : 'Delete Question'}
                          </Button>
                        </div>

                        {/* Question Type */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Question Type</label>
                          <Select
                            value={currentQuestion.type}
                            onValueChange={(val) => updateQuestionType(val as QuestionType)}
                          >
                            <SelectTrigger className="rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="multi_selection">Multiple Choice (Single Answer)</SelectItem>
                              <SelectItem value="checkbox">Multiple Choice (Multiple Answers)</SelectItem>
                              <SelectItem value="open_ended">Open Ended</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Question Text */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Question</label>
                          <Textarea
                            value={currentQuestion.question}
                            onChange={(e) => updateCurrentQuestion({ question: e.target.value })}
                            placeholder="Enter your question..."
                            className="min-h-[100px] resize-none rounded-xl"
                          />
                        </div>

                        {/* Options for multi_selection and checkbox */}
                        {(currentQuestion.type === 'multi_selection' || currentQuestion.type === 'checkbox') && (
                          <div className="space-y-3">
                            <label className="text-sm font-medium text-foreground">
                              Answer Options {currentQuestion.type === 'checkbox' && '(select all correct)'}
                            </label>
                            {currentQuestion.options?.map((option, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => toggleCorrectAnswer(index)}
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    option.isCorrect
                                      ? 'border-primary bg-primary text-primary-foreground'
                                      : 'border-muted-foreground'
                                  }`}
                                >
                                  {option.isCorrect && <span className="text-xs">✓</span>}
                                </button>
                                <Input
                                  value={option.label}
                                  onChange={(e) => updateOptionLabel(index, e.target.value)}
                                  placeholder={`Option ${index + 1}`}
                                  className="flex-1 rounded-xl"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeOption(index)}
                                  disabled={currentQuestion.options!.length <= 2}
                                  className="h-8 w-8"
                                >
                                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={addOption}
                              className="gap-1 rounded-xl"
                            >
                              <Plus className="h-3 w-3" />
                              Add Option
                            </Button>
                          </div>
                        )}

                        {/* Rubric for open_ended */}
                        {currentQuestion.type === 'open_ended' && (
                          <RubricEditor
                            criteria={currentQuestion.rubricCriteria || []}
                            cells={currentQuestion.rubricCells || []}
                            onUpdate={(criteria, cells) => updateCurrentQuestion({ rubricCriteria: criteria, rubricCells: cells })}
                          />
                        )}

                        {/* Weight & Threshold (Assessment level) */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                              Assessment Weight: {currentAssessment.weight}%
                            </label>
                            <Slider
                              value={[currentAssessment.weight]}
                              onValueChange={([val]) => updateAssessment({ weight: val })}
                              min={0}
                              max={100}
                              step={5}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                              Passing: {currentAssessment.passingThreshold}%
                            </label>
                            <Slider
                              value={[currentAssessment.passingThreshold]}
                              onValueChange={([val]) => updateAssessment({ passingThreshold: val })}
                              min={0}
                              max={100}
                              step={5}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}

                {activeTab === "metadata" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">Course Metadata</h3>
                      <div className="h-0.5 w-20 bg-primary rounded-full" />
                    </div>

                    {/* Auto-calculated stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/50 rounded-xl">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <BookOpen className="h-4 w-4" />
                          <span className="text-xs font-medium">Total Slides</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{totalSlides}</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-xl">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <ClipboardList className="h-4 w-4" />
                          <span className="text-xs font-medium">Assessments</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{totalAssessments}</p>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Estimated Duration
                      </label>
                      <Input
                        value={metadata.duration}
                        onChange={(e) => setMetadata({ duration: e.target.value })}
                        placeholder="e.g., 45 minutes"
                        className="rounded-xl"
                      />
                    </div>

                    {/* Difficulty */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Difficulty Level</label>
                      <Select
                        value={metadata.difficulty}
                        onValueChange={(val) => setMetadata({ difficulty: val })}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Author */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Author
                      </label>
                      <Input
                        value={metadata.author}
                        onChange={(e) => setMetadata({ author: e.target.value })}
                        placeholder="Course author name"
                        className="rounded-xl"
                      />
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {metadata.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="gap-1">
                            {tag}
                            <button
                              onClick={() => setMetadata({ tags: metadata.tags.filter((_, i) => i !== index) })}
                              className="ml-1 hover:text-destructive"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <Input
                        placeholder="Add a tag and press Enter"
                        className="rounded-xl"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.currentTarget;
                            const value = input.value.trim();
                            if (value && !metadata.tags.includes(value)) {
                              setMetadata({ tags: [...metadata.tags, value] });
                              input.value = '';
                            }
                          }
                        }}
                      />
                    </div>

                    {/* Learning Objectives */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Learning Objectives</label>
                      <div className="space-y-2">
                        {metadata.learningObjectives.map((obj, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{index + 1}.</span>
                            <Input
                              value={obj}
                              onChange={(e) => {
                                const newObjectives = [...metadata.learningObjectives];
                                newObjectives[index] = e.target.value;
                                setMetadata({ learningObjectives: newObjectives });
                              }}
                              className="flex-1 rounded-xl"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setMetadata({
                                  learningObjectives: metadata.learningObjectives.filter((_, i) => i !== index)
                                });
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setMetadata({ learningObjectives: [...metadata.learningObjectives, ''] })}
                          className="gap-1 rounded-xl"
                        >
                          <Plus className="h-3 w-3" />
                          Add Objective
                        </Button>
                      </div>
                    </div>

                    {/* Prerequisites */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Prerequisites</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {metadata.prerequisites.map((prereq, index) => (
                          <Badge key={index} variant="outline" className="gap-1">
                            {prereq}
                            <button
                              onClick={() => setMetadata({ prerequisites: metadata.prerequisites.filter((_, i) => i !== index) })}
                              className="ml-1 hover:text-destructive"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <Input
                        placeholder="Add prerequisite and press Enter"
                        className="rounded-xl"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.currentTarget;
                            const value = input.value.trim();
                            if (value && !metadata.prerequisites.includes(value)) {
                              setMetadata({ prerequisites: [...metadata.prerequisites, value] });
                              input.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Preview */}
          <ResizablePanel defaultSize={60} minSize={40} maxSize={75}>
            <div className="h-full bg-muted/30 flex flex-col overflow-hidden">
              {/* Item Carousel */}
              <div className="bg-card border-b px-6 h-14 flex items-center">
                <div className="flex items-center justify-center gap-2 w-full">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => goToItem(currentItemIndex - 1)}
                    disabled={currentItemIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-2">
                    {visibleItems.map((item, idx) => {
                      const actualIndex = startIndex + idx;
                      const isActive = actualIndex === currentItemIndex;
                      const isAssessment = item.type === "assessment";
                      return (
                        <button
                          key={item.id}
                          onClick={() => goToItem(actualIndex)}
                          className={`relative rounded-lg overflow-hidden transition-all ${isActive ? "ring-2 ring-primary shadow-lg scale-105" : "opacity-60 hover:opacity-100"}`}
                        >
                          <div
                            className={`w-16 aspect-video flex items-center justify-center ${isAssessment ? "bg-primary/20" : "bg-muted"}`}
                          >
                            <span
                              className={`text-xs font-medium ${isAssessment ? "text-primary" : "text-muted-foreground"}`}
                            >
                              {isAssessment
                                ? "Q"
                                : actualIndex +
                                  1 -
                                  courseItems.slice(0, actualIndex).filter((i) => i.type === "assessment").length}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => goToItem(currentItemIndex + 1)}
                    disabled={currentItemIndex === courseItems.length - 1}
                  >
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

              {/* Question Carousel - Only shown when on assessment */}
              {currentItem?.type === "assessment" && currentAssessment && (
                <div className="bg-muted/50 border-b px-6 h-12 flex items-center">
                  <div className="flex items-center justify-center gap-2 w-full">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full"
                      onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                      disabled={currentQuestionIndex === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-2">
                      {currentAssessment.questions.map((q, idx) => (
                        <button
                          key={q.id}
                          onClick={() => setCurrentQuestionIndex(idx)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            idx === currentQuestionIndex
                              ? "bg-primary/10 border border-primary text-primary"
                              : "bg-background text-muted-foreground hover:bg-background/80"
                          }`}
                        >
                          Q{idx + 1}
                        </button>
                      ))}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full"
                      onClick={() => setCurrentQuestionIndex(Math.min(currentAssessment.questions.length - 1, currentQuestionIndex + 1))}
                      disabled={currentQuestionIndex === currentAssessment.questions.length - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 rounded-full ml-2"
                      onClick={handleAddQuestion}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Content Preview Area */}
              <div className="flex-1 p-6 overflow-y-auto">
                {currentItem?.type === "slide" && currentSlide && (
                  <>
                    {/* 16:9 Slide Preview */}
                    <div className="bg-muted rounded-2xl p-4 mb-6">
                      <div className="aspect-video bg-card rounded-xl shadow-lg overflow-hidden">
                        <div className="h-full p-6 flex">
                          {/* Slide Content */}
                          <div className="flex-1 flex flex-col">
                            <h2 className="text-xl font-bold text-foreground mb-4">{currentSlide?.title}</h2>
                            <div className="space-y-2 flex-1">
                              <p className="text-sm font-medium text-muted-foreground mb-2">talk points:</p>
                              {currentSlide?.talkPoints
                                .split(". ")
                                .filter(Boolean)
                                .map((point, idx) => (
                                  <p key={idx} className="text-sm text-foreground">
                                    {idx + 1}. {point.trim()}
                                    {!point.endsWith(".") ? "." : ""}
                                  </p>
                                ))}
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
                  </>
                )}

                {currentItem?.type === "assessment" && currentAssessment && currentQuestion && (
                  <div className="bg-card rounded-2xl p-6 border">
                    <div className="flex items-center gap-2 mb-4">
                      <ClipboardList className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">
                        Q{currentQuestionIndex + 1} Preview
                      </h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/50 rounded-xl">
                        <p className="font-medium text-foreground mb-3">
                          {currentQuestion.question || "No question text yet"}
                        </p>
                        
                        {(currentQuestion.type === 'multi_selection' || currentQuestion.type === 'checkbox') && 
                          currentQuestion.options && (
                          <div className="space-y-2">
                            {currentQuestion.options.map((opt, i) => (
                              <div
                                key={i}
                                className={`flex items-center gap-2 p-2 rounded-lg ${
                                  opt.isCorrect ? 'bg-primary/10 border border-primary/30' : 'bg-background'
                                }`}
                              >
                                <div className={`w-4 h-4 rounded-full border ${
                                  opt.isCorrect ? 'bg-primary border-primary' : 'border-muted-foreground'
                                }`} />
                                <span className="text-sm">{opt.label || `Option ${i + 1}`}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {currentQuestion.type === 'open_ended' && (
                          <div className="bg-background rounded-lg p-3 border border-dashed border-muted-foreground">
                            <p className="text-sm text-muted-foreground">Open-ended response area</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Questions: {currentAssessment.questions.length}</span>
                        <span>Weight: {currentAssessment.weight}% | Passing: {currentAssessment.passingThreshold}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Footer Navigation */}
      <div className="bg-card border-t px-6 py-4 flex items-center justify-between">
        <Button variant="outline" onClick={handleBack} className="gap-2 rounded-xl">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Button onClick={handleNext} className="gap-2 rounded-xl">
          {currentItemIndex === courseItems.length - 1 ? "Preview Course" : "Next"}
          <ArrowRight className="h-4 w-4" />
        </Button>
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
