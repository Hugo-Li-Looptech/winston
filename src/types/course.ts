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
}

export interface Assessment {
  id: string;
  question: string;
  type: 'multiple_choice' | 'open_ended';
  options?: { label: string; isCorrect: boolean }[];
}

export type WizardStep = 'upload' | 'wizard' | 'scripting' | 'preview';
