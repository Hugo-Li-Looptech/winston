import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Course, SlideFile, WizardSettings, Slide, Assessment, WizardStep } from '@/types/course';

interface CourseContextType {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  currentCourse: {
    slideFiles: SlideFile[];
    supplementFiles: SlideFile[];
    wizardSettings: WizardSettings;
    slides: Slide[];
    assessments: Assessment[];
    currentStep: WizardStep;
  };
  setSlideFiles: (files: SlideFile[]) => void;
  setSupplementFiles: (files: SlideFile[]) => void;
  setWizardSettings: (settings: WizardSettings) => void;
  setSlides: (slides: Slide[]) => void;
  setAssessments: (assessments: Assessment[]) => void;
  setCurrentStep: (step: WizardStep) => void;
  resetCurrentCourse: () => void;
}

const defaultWizardSettings: WizardSettings = {
  learningLevel: '',
  audienceTypes: [],
  learningGoals: [],
  deliveryStyle: '',
  voiceId: '',
};

const defaultSlides: Slide[] = [
  {
    id: '1',
    title: 'Introduction to the Course',
    content: ['Welcome to this comprehensive course', 'Today we will cover important topics'],
    talkPoints: 'Welcome everyone to this course. We will be covering essential concepts that will help you understand the fundamentals.',
    keywords: ['introduction', 'welcome', 'fundamentals'],
    summary: 'This slide introduces the course objectives and sets expectations for learners.',
  },
  {
    id: '2',
    title: 'Key Concepts',
    content: ['Understanding the basics', 'Building blocks of knowledge'],
    talkPoints: 'Let\'s dive into the key concepts. These building blocks will form the foundation of your understanding.',
    keywords: ['concepts', 'basics', 'foundation'],
    summary: 'Overview of the fundamental concepts covered in this course.',
  },
];

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([
    { id: '1', title: 'PBJ tutorial 101', date: '05/25/25', status: 'published', progress: '100%' },
    { id: '2', title: 'Food Safety Training', date: '05/25/25', status: 'pending', progress: '0%' },
    { id: '3', title: 'Customer Service Basics', date: '05/25/25', status: 'in_progress', progress: 'slides_uploaded' },
  ]);

  const [slideFiles, setSlideFiles] = useState<SlideFile[]>([]);
  const [supplementFiles, setSupplementFiles] = useState<SlideFile[]>([]);
  const [wizardSettings, setWizardSettings] = useState<WizardSettings>(defaultWizardSettings);
  const [slides, setSlides] = useState<Slide[]>(defaultSlides);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [currentStep, setCurrentStep] = useState<WizardStep>('upload');

  const resetCurrentCourse = () => {
    setSlideFiles([]);
    setSupplementFiles([]);
    setWizardSettings(defaultWizardSettings);
    setSlides(defaultSlides);
    setAssessments([]);
    setCurrentStep('upload');
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        setCourses,
        currentCourse: {
          slideFiles,
          supplementFiles,
          wizardSettings,
          slides,
          assessments,
          currentStep,
        },
        setSlideFiles,
        setSupplementFiles,
        setWizardSettings,
        setSlides,
        setAssessments,
        setCurrentStep,
        resetCurrentCourse,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourse() {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
}
