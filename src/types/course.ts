export type CourseStatus = 'pending' | 'in_progress' | 'published';

export type ProgressStep = 'slides_uploaded' | 'wizard_complete' | 'setting_talk_points' | 'awaiting_preview' | '0%' | '100%';

export interface Course {
  id: string;
  title: string;
  date: string;
  status: CourseStatus;
  progress: ProgressStep;
}

export interface SlideFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedDate: string;
  status: 'indexed' | 'processing' | 'error';
  chunks: number;
}

export interface WizardSettings {
  learningLevel: string;
  audienceTypes: string[];
  learningGoals: string[];
  deliveryStyle: string;
  voiceId: string;
}

export interface Slide {
  id: string;
  title: string;
  content: string[];
  talkPoints: string;
  keywords: string[];
  summary: string;
  imageUrl?: string;
}

// Assessment Types
export type QuestionType = 'multi_selection' | 'checkbox' | 'open_ended';

export interface RubricCriteria {
  id: string;
  name: string;
}

export type RubricLevel = 'beginning' | 'approaching' | 'meeting' | 'exceeding';

export interface RubricCell {
  criteriaId: string;
  level: RubricLevel;
  description: string;
}

export const RUBRIC_POINTS: Record<RubricLevel, number> = {
  beginning: 2,
  approaching: 4,
  meeting: 6,
  exceeding: 10,
};

export const RUBRIC_LEVELS: { level: RubricLevel; label: string; points: number }[] = [
  { level: 'beginning', label: 'Beginning', points: 2 },
  { level: 'approaching', label: 'Approaching', points: 4 },
  { level: 'meeting', label: 'Meeting', points: 6 },
  { level: 'exceeding', label: 'Exceeding', points: 10 },
];

// Individual question within an assessment
export interface AssessmentQuestion {
  id: string;
  question: string;
  type: QuestionType;
  // For multi_selection (single correct) and checkbox (multiple correct)
  options?: { label: string; isCorrect: boolean }[];
  // For open_ended with rubric
  rubricCriteria?: RubricCriteria[];
  rubricCells?: RubricCell[];
}

// Assessment is now a collection of questions
export interface Assessment {
  id: string;
  weight: number;
  passingThreshold: number;
  questions: AssessmentQuestion[];
}

export type WizardStep = 'upload' | 'wizard' | 'scripting' | 'preview';

// Unified Course Item System for inline assessments
export type CourseItemType = 'slide' | 'assessment';

export interface CourseItem {
  id: string;
  type: CourseItemType;
  slideData?: Slide;
  assessmentData?: Assessment;
}
