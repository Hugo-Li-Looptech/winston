import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useCourse } from '@/contexts/CourseContext';
import { Plus, X, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { Assessment } from '@/types/course';

interface AssessmentStepProps {
  onContinue: () => void;
  onBack: () => void;
}

export function AssessmentStep({ onContinue, onBack }: AssessmentStepProps) {
  const { currentCourse, setAssessments, setSlides } = useCourse();
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

  const slides = currentCourse.slides;
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

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

  const goToSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlideIndex(index);
    }
  };

  const passingScore = Math.ceil(assessments.length / 2);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-secondary flex items-center justify-center">
            <div className="h-4 w-4 bg-muted-foreground" />
          </div>
          <div>
            <h1 className="font-bold">How to Make a PBJ Sand</h1>
            <p className="text-sm text-muted-foreground">-Intro</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground bg-secondary px-3 py-1">
            unsaved changes
          </span>
          <Button variant="outline" size="sm">Comments</Button>
          <Button variant="outline" size="sm">Saved</Button>
          <Button size="sm">Publish</Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="bg-foreground text-background px-3 py-1 font-medium">
          Scripting
        </div>
        <Button variant="outline" size="sm">Metadata</Button>
      </div>

      <div className="flex gap-6">
        {/* Left Panel - Add Assessments */}
        <div className="w-1/3 space-y-4">
          <div className="border-2 border-foreground p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Add Assessments</h2>
              <Button variant="outline" size="sm">Preview</Button>
            </div>

            <div className="space-y-4">
              {assessments.map((assessment, index) => (
                <div key={assessment.id} className="bg-secondary p-4 relative">
                  <button
                    onClick={() => removeAssessment(assessment.id)}
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <p className="font-semibold mb-1">
                    {index + 1}. Q: {assessment.question || 'New Question'}
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    select checkbox for correct answer
                  </p>

                  {editingId === assessment.id ? (
                    <div className="space-y-2">
                      <Input
                        value={assessment.question}
                        onChange={(e) =>
                          updateAssessment(assessment.id, { question: e.target.value })
                        }
                        placeholder="Enter question..."
                        className="mb-2"
                      />
                      {assessment.options?.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <Checkbox
                            checked={option.isCorrect}
                            onCheckedChange={() =>
                              toggleCorrectAnswer(assessment.id, optIndex)
                            }
                          />
                          <Input
                            value={option.label}
                            onChange={(e) =>
                              updateOptionLabel(assessment.id, optIndex, e.target.value)
                            }
                            placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                            className="flex-1"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {assessment.options?.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <div
                            className={`h-4 w-4 border-2 ${
                              option.isCorrect ? 'bg-foreground' : 'border-foreground'
                            }`}
                          />
                          <span className="text-sm">
                            {String.fromCharCode(65 + optIndex)}) {option.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(assessment.id)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))}

              <div className="flex justify-center">
                <Button variant="ghost" size="icon" onClick={addAssessment}>
                  <Plus className="h-6 w-6" />
                </Button>
              </div>
            </div>

            {/* Passing Score */}
            <div className="mt-6 bg-green-50 border border-green-200 p-3">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">
                  Passing Score: {passingScore} / {assessments.length} points (50%)
                </span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                Learners must score at least 50% to pass this checkpoint.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Assessment Preview */}
        <div className="flex-1 space-y-4">
          {/* Slide Thumbnails */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Button variant="ghost" size="icon" onClick={() => goToSlide(currentSlideIndex - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                onClick={() => goToSlide(index)}
                className={`h-12 w-16 bg-secondary border-2 cursor-pointer flex-shrink-0 ${
                  index === currentSlideIndex ? 'border-foreground shadow-sm' : 'border-muted'
                }`}
              />
            ))}
            <Button variant="ghost" size="icon" onClick={() => goToSlide(currentSlideIndex + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Assessment Preview */}
          <div className="bg-secondary border-2 border-foreground p-8 min-h-[500px]">
            <h2 className="text-3xl font-bold mb-8">Assessments</h2>
            <div className="space-y-6 max-h-[400px] overflow-y-auto">
              {assessments.map((assessment, index) => (
                <div key={assessment.id}>
                  <p className="font-semibold mb-2">
                    Q{index + 1}. {assessment.question}
                  </p>
                  <div className="space-y-1 ml-4">
                    {assessment.options?.map((option, optIndex) => (
                      <p key={optIndex}>
                        {String.fromCharCode(65 + optIndex)}) {option.label}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slide Info */}
          <div className="border-2 border-foreground p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Slide {currentSlideIndex + 1} of {slides.length}
              </span>
              <span className="font-semibold">Details</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleContinue}>
          Next
        </Button>
      </div>
    </div>
  );
}
