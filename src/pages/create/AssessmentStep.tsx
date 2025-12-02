import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCourse } from '@/contexts/CourseContext';
import { Plus, Trash2, CheckCircle, X, Edit2, Save } from 'lucide-react';
import { Assessment } from '@/types/course';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AssessmentStepProps {
  onContinue: () => void;
  onBack: () => void;
}

export function AssessmentStep({ onContinue, onBack }: AssessmentStepProps) {
  const { currentCourse, setAssessments } = useCourse();
  const [assessments, setLocalAssessments] = useState<Assessment[]>(
    currentCourse.assessments.length > 0
      ? currentCourse.assessments
      : [
          {
            id: '1',
            question: 'Where is the HQ of Cook Medical Located?',
            type: 'multiple_choice',
            options: [
              { label: 'Bloomington, IN', isCorrect: true },
              { label: 'Bloomington, IL', isCorrect: false },
              { label: 'Indy, IN', isCorrect: false },
            ],
          },
        ]
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newQuestionType, setNewQuestionType] = useState<'multiple_choice' | 'open_ended'>('multiple_choice');

  const addAssessment = () => {
    const newAssessment: Assessment = {
      id: Date.now().toString(),
      question: '',
      type: newQuestionType,
      options: newQuestionType === 'multiple_choice' ? [
        { label: '', isCorrect: false },
        { label: '', isCorrect: false },
        { label: '', isCorrect: false },
      ] : undefined,
    };
    setLocalAssessments([...assessments, newAssessment]);
    setEditingId(newAssessment.id);
  };

  const updateAssessment = (id: string, updates: Partial<Assessment>) => {
    setLocalAssessments(
      assessments.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  };

  const removeAssessment = (id: string) => {
    setLocalAssessments(assessments.filter((a) => a.id !== id));
  };

  const toggleCorrectAnswer = (assessmentId: string, optionIndex: number) => {
    setLocalAssessments(
      assessments.map((a) => {
        if (a.id === assessmentId && a.options) {
          const newOptions = a.options.map((opt, i) => ({
            ...opt,
            isCorrect: i === optionIndex,
          }));
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
        if (a.id === assessmentId && a.options && a.options.length < 5) {
          return { ...a, options: [...a.options, { label: '', isCorrect: false }] };
        }
        return a;
      })
    );
  };

  const handleContinue = () => {
    setAssessments(assessments);
    onContinue();
  };

  const passingScore = Math.ceil(assessments.length / 2);

  return (
    <div className="h-full flex flex-col">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid md:grid-cols-2 gap-0">
          {/* Left Panel - Question Editor */}
          <div className="border-r bg-card p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Add Assessments</h3>
              <Button variant="outline" size="sm" className="rounded-xl">
                Preview
              </Button>
            </div>

            {/* Assessment Questions */}
            <div className="space-y-4">
              {assessments.map((assessment, index) => (
                <div
                  key={assessment.id}
                  className="bg-muted/30 rounded-xl p-5 relative group"
                >
                  {/* Close Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeAssessment(assessment.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                        Q{index + 1}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {assessment.type === 'multiple_choice' ? 'Multiple Choice' : 'Open Ended'}
                      </span>
                    </div>

                    {editingId === assessment.id ? (
                      <div className="space-y-3">
                        <Input
                          value={assessment.question}
                          onChange={(e) => updateAssessment(assessment.id, { question: e.target.value })}
                          placeholder="Enter question..."
                          className="rounded-xl font-medium"
                        />
                        
                        {assessment.type === 'multiple_choice' && (
                          <>
                            <p className="text-xs text-muted-foreground">select checkbox for correct answer</p>
                            {assessment.options?.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-3">
                                <button
                                  onClick={() => toggleCorrectAnswer(assessment.id, optIndex)}
                                  className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                                    option.isCorrect
                                      ? 'border-primary bg-primary'
                                      : 'border-muted-foreground/30 hover:border-primary'
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
                                  onChange={(e) => updateOptionLabel(assessment.id, optIndex, e.target.value)}
                                  placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                                  className="flex-1 rounded-xl"
                                />
                              </div>
                            ))}
                            
                            {assessment.options && assessment.options.length < 5 && (
                              <button
                                onClick={() => addOption(assessment.id)}
                                className="text-sm text-primary hover:underline"
                              >
                                + Add new Options
                              </button>
                            )}
                          </>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => setEditingId(null)}
                            className="rounded-xl gap-2"
                          >
                            <Save className="h-3 w-3" />
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingId(null)}
                            className="rounded-xl"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-foreground mb-3">
                          {assessment.question || 'New Question'}
                        </p>
                        {assessment.type === 'multiple_choice' && (
                          <div className="space-y-2">
                            {assessment.options?.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-2">
                                {option.isCorrect ? (
                                  <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                                ) : (
                                  <div className="h-4 w-4 rounded border-2 border-muted-foreground/30 shrink-0" />
                                )}
                                <span className="text-sm text-muted-foreground">
                                  {String.fromCharCode(65 + optIndex)}) {option.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingId(assessment.id)}
                          className="mt-3 rounded-xl gap-2"
                        >
                          <Edit2 className="h-3 w-3" />
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Question Type Selector & Add Button */}
            <div className="flex items-center gap-3 mt-4">
              <Select 
                value={newQuestionType} 
                onValueChange={(value: 'multiple_choice' | 'open_ended') => setNewQuestionType(value)}
              >
                <SelectTrigger className="w-[180px] rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="open_ended">Open Ended</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={addAssessment}
                className="rounded-full border-dashed"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Passing Score */}
            <div className="bg-primary/5 rounded-xl p-4 flex items-center gap-3 mt-6">
              <CheckCircle className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="font-medium text-foreground">
                  Passing Score: {passingScore} / {assessments.length} points (50%)
                </p>
                <p className="text-sm text-muted-foreground">
                  Learners must score at least 50% to pass
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel - Live Preview */}
          <div className="bg-muted/20 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-foreground mb-6">Assessments</h3>
            
            <div className="space-y-6">
              {assessments.map((assessment, index) => (
                <div key={assessment.id} className="bg-card rounded-xl shadow-sm border p-5">
                  <p className="font-medium text-foreground mb-4">
                    {index + 1}. {assessment.question || 'Question text here...'}
                  </p>
                  
                  {assessment.type === 'multiple_choice' && (
                    <div className="space-y-3">
                      {assessment.options?.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 cursor-pointer transition-colors"
                        >
                          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                          <span className="text-sm text-foreground">
                            {option.label || `Option ${String.fromCharCode(65 + optIndex)}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {assessment.type === 'open_ended' && (
                    <div className="h-24 border rounded-lg bg-muted/30 flex items-center justify-center">
                      <span className="text-sm text-muted-foreground">Text input area</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
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
