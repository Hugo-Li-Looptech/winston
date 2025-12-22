import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Plus, Trash2, Clock, Award, RotateCcw, MessageSquare, Sparkles, RefreshCw } from 'lucide-react';
import { FinalAssessment, AssessmentQuestion, QuestionType, Slide, Assessment } from '@/types/course';
import { RubricEditor } from './RubricEditor';

interface FinalAssessmentEditorProps {
  assessment: FinalAssessment | null;
  onUpdate: (assessment: FinalAssessment | null) => void;
  slides?: Slide[];
  knowledgeChecks?: Assessment[];
}

export function FinalAssessmentEditor({ assessment, onUpdate, slides = [], knowledgeChecks = [] }: FinalAssessmentEditorProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const createDefaultQuestion = (): AssessmentQuestion => ({
    id: `question-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    question: '',
    type: 'multi_selection',
    options: [
      { label: '', isCorrect: false },
      { label: '', isCorrect: false },
      { label: '', isCorrect: false },
    ],
  });

  // Generate questions from course content and knowledge checks
  const generateQuestionsFromContent = (): AssessmentQuestion[] => {
    const generatedQuestions: AssessmentQuestion[] = [];
    
    // Generate questions from slides (based on their content and keywords)
    slides.forEach((slide, index) => {
      if (index % 2 === 0 && generatedQuestions.length < 3) { // Take every other slide to not overwhelm
        generatedQuestions.push({
          id: `question-slide-${Date.now()}-${index}`,
          question: `Based on "${slide.title}", which of the following is correct?`,
          type: 'multi_selection',
          options: [
            { label: slide.content[0] || 'Option A', isCorrect: true },
            { label: `Not related to ${slide.keywords?.[0] || 'the topic'}`, isCorrect: false },
            { label: 'None of the above', isCorrect: false },
          ],
        });
      }
    });

    // Copy questions from knowledge checks
    knowledgeChecks.forEach((kc) => {
      kc.questions.forEach((q) => {
        if (generatedQuestions.length < 6) { // Limit to 6 total questions
          generatedQuestions.push({
            ...q,
            id: `question-kc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          });
        }
      });
    });

    // If no questions generated, add a default one
    if (generatedQuestions.length === 0) {
      generatedQuestions.push(createDefaultQuestion());
    }

    return generatedQuestions;
  };

  const createDefaultAssessment = (): FinalAssessment => ({
    id: `final-assessment-${Date.now()}`,
    title: 'Final Assessment',
    description: 'Test your knowledge from the entire course.',
    timeLimit: 30,
    attemptsAllowed: 3,
    passingThreshold: 70,
    showFeedback: true,
    questions: generateQuestionsFromContent(),
    gradingType: 'percentage',
  });

  const handleEnableAssessment = () => {
    onUpdate(createDefaultAssessment());
  };

  const handleRegenerateQuestions = async () => {
    if (!assessment) return;
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    onUpdate({
      ...assessment,
      questions: generateQuestionsFromContent(),
    });
    setCurrentQuestionIndex(0);
    setIsGenerating(false);
  };

  const handleDisableAssessment = () => {
    onUpdate(null);
  };

  const updateAssessment = (updates: Partial<FinalAssessment>) => {
    if (!assessment) return;
    onUpdate({ ...assessment, ...updates });
  };

  const currentQuestion = assessment?.questions[currentQuestionIndex] || null;

  const updateCurrentQuestion = (updates: Partial<AssessmentQuestion>) => {
    if (!assessment || !currentQuestion) return;
    const updatedQuestions = assessment.questions.map((q, idx) =>
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

  const addQuestion = () => {
    if (!assessment) return;
    const newQuestion = createDefaultQuestion();
    updateAssessment({ questions: [...assessment.questions, newQuestion] });
    setCurrentQuestionIndex(assessment.questions.length);
  };

  const deleteQuestion = () => {
    if (!assessment || assessment.questions.length <= 1) return;
    const updatedQuestions = assessment.questions.filter((_, idx) => idx !== currentQuestionIndex);
    updateAssessment({ questions: updatedQuestions });
    setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1));
  };

  if (!assessment) {
    return (
      <div className="p-6 border-2 border-dashed border-muted-foreground/30 rounded-xl text-center">
        <Award className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Final Assessment</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Add a comprehensive assessment at the end of your course to evaluate learner understanding.
        </p>
        <Button onClick={handleEnableAssessment} className="rounded-xl gap-2">
          <Plus className="h-4 w-4" />
          Add Final Assessment
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Award className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Final Assessment</h3>
            <p className="text-sm text-muted-foreground">
              {assessment.questions.length} question{assessment.questions.length !== 1 ? 's' : ''} • Pre-populated from course content
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRegenerateQuestions}
            disabled={isGenerating}
            className="rounded-xl gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : 'Regenerate'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDisableAssessment} className="text-destructive hover:text-destructive rounded-xl gap-1">
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        </div>
      </div>

      {/* Source info */}
      <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-xl">
        <Sparkles className="h-4 w-4 text-primary" />
        <p className="text-xs text-muted-foreground">
          Questions are generated from <span className="font-medium text-foreground">{slides.length} slides</span> and <span className="font-medium text-foreground">{knowledgeChecks.length} knowledge checks</span>
        </p>
      </div>

      {/* Assessment Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time Limit (minutes)
          </Label>
          <Input
            type="number"
            value={assessment.timeLimit || ''}
            onChange={(e) => updateAssessment({ timeLimit: parseInt(e.target.value) || undefined })}
            placeholder="No limit"
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Attempts Allowed
          </Label>
          <Input
            type="number"
            value={assessment.attemptsAllowed || ''}
            onChange={(e) => updateAssessment({ attemptsAllowed: parseInt(e.target.value) || undefined })}
            placeholder="Unlimited"
            className="rounded-xl"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Grading Type</Label>
          <Select
            value={assessment.gradingType}
            onValueChange={(val) => updateAssessment({ gradingType: val as FinalAssessment['gradingType'] })}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="pass_fail">Pass/Fail</SelectItem>
              <SelectItem value="letter_grade">Letter Grade</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Passing: {assessment.passingThreshold}%</Label>
          <Slider
            value={[assessment.passingThreshold]}
            onValueChange={([val]) => updateAssessment({ passingThreshold: val })}
            min={0}
            max={100}
            step={5}
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-medium">Show Feedback After Completion</Label>
        </div>
        <Switch
          checked={assessment.showFeedback}
          onCheckedChange={(checked) => updateAssessment({ showFeedback: checked })}
        />
      </div>

      {/* Question Navigation */}
      <div className="flex items-center gap-2 pt-4 border-t">
        <span className="text-sm font-medium text-foreground">Questions:</span>
        <div className="flex items-center gap-1 flex-wrap">
          {assessment.questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentQuestionIndex(idx)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                idx === currentQuestionIndex
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Q{idx + 1}
            </button>
          ))}
          <Button variant="outline" size="sm" onClick={addQuestion} className="rounded-lg gap-1">
            <Plus className="h-3 w-3" />
            Add
          </Button>
        </div>
      </div>

      {/* Current Question Editor */}
      {currentQuestion && (
        <div className="space-y-4 p-4 bg-muted/30 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary">Question {currentQuestionIndex + 1}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={deleteQuestion}
              disabled={assessment.questions.length <= 1}
              className="text-destructive hover:text-destructive h-8"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>

          {/* Question Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Question Type</Label>
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
            <Label className="text-sm font-medium">Question</Label>
            <Textarea
              value={currentQuestion.question}
              onChange={(e) => updateCurrentQuestion({ question: e.target.value })}
              placeholder="Enter your question..."
              className="min-h-[80px] resize-none rounded-xl"
            />
          </div>

          {/* Options for multi_selection and checkbox */}
          {(currentQuestion.type === 'multi_selection' || currentQuestion.type === 'checkbox') && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Answer Options {currentQuestion.type === 'checkbox' && '(select all correct)'}
              </Label>
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
              <Button variant="outline" size="sm" onClick={addOption} className="gap-1 rounded-xl">
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
        </div>
      )}
    </div>
  );
}
