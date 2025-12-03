import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useCourse } from '@/contexts/CourseContext';
import { Plus, Trash2, CheckCircle, X, Edit2, Save, ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react';
import { Assessment, QuestionType, RubricCriteria, RubricCell, RUBRIC_LEVELS } from '@/types/course';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { CourseEditorHeader } from '@/components/CourseEditorHeader';
import { RubricEditor } from '@/components/RubricEditor';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AssessmentStepProps {
  onContinue: () => void;
  onBack: () => void;
}

export function AssessmentStep({ onContinue, onBack }: AssessmentStepProps) {
  const navigate = useNavigate();
  const { currentCourse, setAssessments } = useCourse();
  const [assessments, setLocalAssessments] = useState<Assessment[]>(
    currentCourse.assessments
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newQuestionType, setNewQuestionType] = useState<QuestionType>('multi_selection');
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(true);
  const [currentAssessmentIndex, setCurrentAssessmentIndex] = useState(0);

  const addAssessment = () => {
    const newAssessment: Assessment = {
      id: Date.now().toString(),
      question: '',
      type: newQuestionType,
      weight: 10,
      passingThreshold: 50,
      options: newQuestionType !== 'open_ended' ? [
        { label: '', isCorrect: false },
        { label: '', isCorrect: false },
        { label: '', isCorrect: false },
      ] : undefined,
      rubricCriteria: newQuestionType === 'open_ended' ? [] : undefined,
      rubricCells: newQuestionType === 'open_ended' ? [] : undefined,
    };
    setLocalAssessments([...assessments, newAssessment]);
    setEditingId(newAssessment.id);
    setCurrentAssessmentIndex(assessments.length);
  };

  const updateAssessment = (id: string, updates: Partial<Assessment>) => {
    setLocalAssessments(
      assessments.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  };

  const removeAssessment = (id: string) => {
    const newAssessments = assessments.filter((a) => a.id !== id);
    setLocalAssessments(newAssessments);
    if (currentAssessmentIndex >= newAssessments.length) {
      setCurrentAssessmentIndex(Math.max(0, newAssessments.length - 1));
    }
  };

  const toggleCorrectAnswer = (assessmentId: string, optionIndex: number) => {
    setLocalAssessments(
      assessments.map((a) => {
        if (a.id === assessmentId && a.options) {
          const newOptions = a.options.map((opt, i) => {
            if (a.type === 'multi_selection') {
              // Single correct answer for multi_selection
              return { ...opt, isCorrect: i === optionIndex };
            } else {
              // Toggle for checkbox (multiple correct)
              return i === optionIndex ? { ...opt, isCorrect: !opt.isCorrect } : opt;
            }
          });
          return { ...a, options: newOptions };
        }
        return a;
      })
    );
  };

  const updateOptionLabel = (assessmentId: string, optionIndex: number, label: string) => {
    setLocalAssessments(
      assessments.map((a) => {
        if (a.id === assessmentId && a.options) {
          const newOptions = [...a.options];
          newOptions[optionIndex] = { ...newOptions[optionIndex], label };
          return { ...a, options: newOptions };
        }
        return a;
      })
    );
  };

  const addOption = (assessmentId: string) => {
    setLocalAssessments(
      assessments.map((a) => {
        if (a.id === assessmentId && a.options && a.options.length < 6) {
          return { ...a, options: [...a.options, { label: '', isCorrect: false }] };
        }
        return a;
      })
    );
  };

  const removeOption = (assessmentId: string, optionIndex: number) => {
    setLocalAssessments(
      assessments.map((a) => {
        if (a.id === assessmentId && a.options && a.options.length > 2) {
          const newOptions = a.options.filter((_, i) => i !== optionIndex);
          return { ...a, options: newOptions };
        }
        return a;
      })
    );
  };

  const updateRubricCriteria = (assessmentId: string, criteria: RubricCriteria[]) => {
    updateAssessment(assessmentId, { rubricCriteria: criteria });
  };

  const updateRubricCells = (assessmentId: string, cells: RubricCell[]) => {
    updateAssessment(assessmentId, { rubricCells: cells });
  };

  const handleContinue = () => {
    setAssessments(assessments);
    onContinue();
  };

  const getQuestionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case 'multi_selection': return 'Multi-Selection';
      case 'checkbox': return 'Checkbox';
      case 'open_ended': return 'Open-Ended';
    }
  };

  const totalWeight = assessments.reduce((sum, a) => sum + a.weight, 0);
  const passingScore = Math.ceil(totalWeight * 0.5);

  const currentAssessment = assessments[currentAssessmentIndex];

  // Carousel navigation
  const visibleCount = 5;
  const startIndex = Math.max(0, Math.min(currentAssessmentIndex - 2, assessments.length - visibleCount));
  const visibleAssessments = assessments.slice(startIndex, startIndex + visibleCount);

  return (
    <div className="h-full flex flex-col">
      {/* Header with Progress Bar */}
      <CourseEditorHeader
        currentStep="scripting"
        courseTitle="How to Make a PBJ Sand - Assessments"
        isCollapsed={isHeaderCollapsed}
        onToggleCollapse={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
        onClose={() => navigate('/dashboard')}
        showActions={true}
      />

      {/* Main Content with Resizable Panels */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel - Question Editor */}
          <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
            <div className="h-full bg-card flex flex-col">
              {/* Assessment Carousel */}
              <div className="px-6 py-4 border-b">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setCurrentAssessmentIndex(Math.max(0, currentAssessmentIndex - 1))}
                    disabled={currentAssessmentIndex === 0 || assessments.length === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-2">
                    {visibleAssessments.map((assessment, idx) => {
                      const actualIndex = startIndex + idx;
                      const isActive = actualIndex === currentAssessmentIndex;
                      return (
                        <button
                          key={assessment.id}
                          onClick={() => setCurrentAssessmentIndex(actualIndex)}
                          className={`relative rounded-lg overflow-hidden transition-all ${
                            isActive
                              ? 'ring-2 ring-primary shadow-lg scale-105'
                              : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          <div className="w-12 h-12 bg-muted flex items-center justify-center">
                            <span className="text-xs font-medium text-muted-foreground">
                              Q{actualIndex + 1}
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
                    onClick={() => setCurrentAssessmentIndex(Math.min(assessments.length - 1, currentAssessmentIndex + 1))}
                    disabled={currentAssessmentIndex >= assessments.length - 1 || assessments.length === 0}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  {/* Plus Button with Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full ml-2"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setNewQuestionType('multi_selection'); addAssessment(); }}>
                        Multi-Selection Question
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setNewQuestionType('checkbox'); addAssessment(); }}>
                        Checkbox Question
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setNewQuestionType('open_ended'); addAssessment(); }}>
                        Open-Ended Question
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {assessments.length === 0 ? (
                  /* Empty State */
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <ClipboardList className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No assessments yet</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                      Add questions to test learner understanding. Click the + button above to get started.
                    </p>
                    <div className="flex gap-2">
                      <Select 
                        value={newQuestionType} 
                        onValueChange={(value: QuestionType) => setNewQuestionType(value)}
                      >
                        <SelectTrigger className="w-[180px] rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multi_selection">Multi-Selection</SelectItem>
                          <SelectItem value="checkbox">Checkbox</SelectItem>
                          <SelectItem value="open_ended">Open-Ended</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={addAssessment} className="rounded-xl gap-2">
                        <Plus className="h-4 w-4" />
                        Add Question
                      </Button>
                    </div>
                  </div>
                ) : currentAssessment ? (
                  /* Question Editor */
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                          Q{currentAssessmentIndex + 1}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {getQuestionTypeLabel(currentAssessment.type)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => removeAssessment(currentAssessment.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    {/* Question Text */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Question</label>
                      <Input
                        value={currentAssessment.question}
                        onChange={(e) => updateAssessment(currentAssessment.id, { question: e.target.value })}
                        placeholder="Enter your question..."
                        className="rounded-xl"
                      />
                    </div>

                    {/* Question Type Specific Editors */}
                    {(currentAssessment.type === 'multi_selection' || currentAssessment.type === 'checkbox') && (
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground">
                          Options {currentAssessment.type === 'multi_selection' ? '(select one correct)' : '(select all correct)'}
                        </label>
                        {currentAssessment.options?.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-3">
                            <button
                              onClick={() => toggleCorrectAnswer(currentAssessment.id, optIndex)}
                              className={`h-5 w-5 shrink-0 flex items-center justify-center transition-colors ${
                                currentAssessment.type === 'multi_selection'
                                  ? `rounded-full border-2 ${option.isCorrect ? 'border-primary bg-primary' : 'border-muted-foreground/30 hover:border-primary'}`
                                  : `rounded border-2 ${option.isCorrect ? 'border-primary bg-primary' : 'border-muted-foreground/30 hover:border-primary'}`
                              }`}
                            >
                              {option.isCorrect && (
                                <CheckCircle className="h-3 w-3 text-primary-foreground" />
                              )}
                            </button>
                            <span className="text-sm font-medium text-muted-foreground w-6">
                              {String.fromCharCode(65 + optIndex)})
                            </span>
                            <Input
                              value={option.label}
                              onChange={(e) => updateOptionLabel(currentAssessment.id, optIndex, e.target.value)}
                              placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                              className="flex-1 rounded-xl"
                            />
                            {currentAssessment.options && currentAssessment.options.length > 2 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0"
                                onClick={() => removeOption(currentAssessment.id, optIndex)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                        
                        {currentAssessment.options && currentAssessment.options.length < 6 && (
                          <button
                            onClick={() => addOption(currentAssessment.id)}
                            className="text-sm text-primary hover:underline"
                          >
                            + Add new option
                          </button>
                        )}
                      </div>
                    )}

                    {currentAssessment.type === 'open_ended' && (
                      <RubricEditor
                        criteria={currentAssessment.rubricCriteria || []}
                        cells={currentAssessment.rubricCells || []}
                        onCriteriaChange={(criteria) => updateRubricCriteria(currentAssessment.id, criteria)}
                        onCellsChange={(cells) => updateRubricCells(currentAssessment.id, cells)}
                      />
                    )}

                    {/* Question Settings */}
                    <div className="space-y-4 pt-4 border-t">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-foreground">Weight (points)</label>
                          <span className="text-sm text-muted-foreground">{currentAssessment.weight} pts</span>
                        </div>
                        <Slider
                          value={[currentAssessment.weight]}
                          onValueChange={([value]) => updateAssessment(currentAssessment.id, { weight: value })}
                          min={1}
                          max={50}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-foreground">Passing Threshold</label>
                          <span className="text-sm text-muted-foreground">{currentAssessment.passingThreshold}%</span>
                        </div>
                        <Slider
                          value={[currentAssessment.passingThreshold]}
                          onValueChange={([value]) => updateAssessment(currentAssessment.id, { passingThreshold: value })}
                          min={0}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Passing Score Summary */}
              {assessments.length > 0 && (
                <div className="px-6 pb-6">
                  <div className="bg-primary/5 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">
                        Total: {totalWeight} points | Passing: {passingScore} points (50%)
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {assessments.length} question{assessments.length !== 1 ? 's' : ''} configured
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Live Preview */}
          <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
            <div className="h-full bg-muted/20 p-6 overflow-y-auto">
              <h3 className="text-lg font-semibold text-foreground mb-6">Assessment Preview</h3>
              
              {assessments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <p className="text-sm text-muted-foreground">
                    Questions you add will appear here as a preview.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {assessments.map((assessment, index) => (
                    <div 
                      key={assessment.id} 
                      className={`bg-card rounded-xl shadow-sm border p-5 transition-all ${
                        index === currentAssessmentIndex ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setCurrentAssessmentIndex(index)}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          {getQuestionTypeLabel(assessment.type)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {assessment.weight} pts
                        </span>
                      </div>
                      
                      <p className="font-medium text-foreground mb-4">
                        {index + 1}. {assessment.question || 'Question text here...'}
                      </p>
                      
                      {(assessment.type === 'multi_selection' || assessment.type === 'checkbox') && (
                        <div className="space-y-2">
                          {assessment.options?.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 cursor-pointer transition-colors"
                            >
                              <div className={`h-5 w-5 border-2 border-muted-foreground/30 ${
                                assessment.type === 'multi_selection' ? 'rounded-full' : 'rounded'
                              }`} />
                              <span className="text-sm text-foreground">
                                {option.label || `Option ${String.fromCharCode(65 + optIndex)}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {assessment.type === 'open_ended' && (
                        <div className="space-y-3">
                          <div className="h-24 border rounded-lg bg-muted/30 flex items-center justify-center">
                            <span className="text-sm text-muted-foreground">Text input area</span>
                          </div>
                          {assessment.rubricCriteria && assessment.rubricCriteria.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Rubric: {assessment.rubricCriteria.map(c => c.name || 'Unnamed').join(', ')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t bg-card">
        <Button variant="outline" onClick={onBack} className="rounded-xl">
          Back
        </Button>
        
        <Button onClick={handleContinue} className="rounded-xl px-8">
          Preview Course
        </Button>
      </div>
    </div>
  );
}
