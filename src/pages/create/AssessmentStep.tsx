import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCourse } from '@/contexts/CourseContext';
import { Plus, Trash2, GripVertical, CheckCircle } from 'lucide-react';
import { Assessment } from '@/types/course';

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

  const addAssessment = () => {
    const newAssessment: Assessment = {
      id: Date.now().toString(),
      question: '',
      type: 'multiple_choice',
      options: [
        { label: '', isCorrect: false },
        { label: '', isCorrect: false },
        { label: '', isCorrect: false },
      ],
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

  const handleContinue = () => {
    setAssessments(assessments);
    onContinue();
  };

  const passingScore = Math.ceil(assessments.length / 2);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground">Add Assessments</h2>
        <p className="text-muted-foreground mt-2">
          Create questions to test learner understanding
        </p>
      </div>

      {/* Existing Assessments */}
      <div className="space-y-4">
        {assessments.map((assessment, index) => (
          <div
            key={assessment.id}
            className="bg-muted/30 rounded-xl p-5 group"
          >
            <div className="flex items-start gap-3">
              <GripVertical className="h-5 w-5 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                    Q{index + 1}
                  </span>
                  <span className="text-xs text-muted-foreground">Multiple Choice</span>
                </div>

                {editingId === assessment.id ? (
                  <div className="space-y-3">
                    <Input
                      value={assessment.question}
                      onChange={(e) => updateAssessment(assessment.id, { question: e.target.value })}
                      placeholder="Enter question..."
                      className="rounded-lg"
                    />
                    {assessment.options?.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-3">
                        <button
                          onClick={() => toggleCorrectAnswer(assessment.id, optIndex)}
                          className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                            option.isCorrect
                              ? 'border-primary bg-primary'
                              : 'border-muted-foreground/50'
                          }`}
                        >
                          {option.isCorrect && (
                            <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                          )}
                        </button>
                        <Input
                          value={option.label}
                          onChange={(e) => updateOptionLabel(assessment.id, optIndex, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                          className="flex-1 rounded-lg"
                        />
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(null)}
                      className="rounded-lg"
                    >
                      Done
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-foreground mb-3">{assessment.question || 'New Question'}</p>
                    <div className="space-y-2">
                      {assessment.options?.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          {option.isCorrect ? (
                            <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                          )}
                          <span className="text-sm text-muted-foreground">
                            {String.fromCharCode(65 + optIndex)}) {option.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(assessment.id)}
                      className="mt-3 rounded-lg"
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeAssessment(assessment.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Button */}
      <Button
        variant="outline"
        onClick={addAssessment}
        className="w-full h-14 rounded-xl border-dashed gap-2"
      >
        <Plus className="h-5 w-5" />
        Add Assessment Question
      </Button>

      {/* Passing Score */}
      <div className="bg-primary/5 rounded-xl p-4 flex items-center gap-3">
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

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="rounded-xl">
          Back
        </Button>
        <Button onClick={handleContinue} size="lg" className="rounded-xl px-8">
          Preview Course
        </Button>
      </div>
    </div>
  );
}
