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
    title: 'Introduction to PBJ Sandwiches',
    content: ['Welcome to this comprehensive course', 'Learn the art of the perfect PBJ'],
    talkPoints: 'Welcome everyone to this course on making the perfect peanut butter and jelly sandwich. We will cover everything from ingredient selection to presentation.',
    keywords: ['introduction', 'PBJ', 'sandwich'],
    summary: 'This slide introduces the course objectives and sets expectations for learners.',
  },
  {
    id: '2',
    title: 'History of the PBJ',
    content: ['Origins in early 1900s America', 'Rise to popularity during WWII'],
    talkPoints: 'The peanut butter and jelly sandwich has a rich history dating back to the early 1900s. It became a staple during World War II due to its convenience and nutrition.',
    keywords: ['history', 'origins', 'WWII'],
    summary: 'Overview of the historical background of the PBJ sandwich.',
  },
  {
    id: '3',
    title: 'Gathering Your Ingredients',
    content: ['Bread selection', 'Peanut butter types', 'Jelly varieties'],
    talkPoints: 'First, let\'s talk about ingredients. You\'ll need bread, peanut butter, and jelly. The quality of each ingredient matters for the final result.',
    keywords: ['ingredients', 'bread', 'peanut butter', 'jelly'],
    summary: 'This slide covers the essential ingredients needed.',
  },
  {
    id: '4',
    title: 'Choosing the Right Bread',
    content: ['White vs whole wheat', 'Fresh bread importance', 'Thickness considerations'],
    talkPoints: 'Bread selection is crucial. White bread is traditional, but whole wheat adds nutrition. Make sure your bread is fresh and consider the thickness.',
    keywords: ['bread', 'white', 'whole wheat', 'fresh'],
    summary: 'Detailed guide on selecting the perfect bread.',
  },
  {
    id: '5',
    title: 'Peanut Butter Selection',
    content: ['Creamy vs chunky', 'Natural vs processed', 'Allergy alternatives'],
    talkPoints: 'Peanut butter comes in many varieties. Creamy spreads easier, while chunky adds texture. Consider natural options and be aware of allergies.',
    keywords: ['peanut butter', 'creamy', 'chunky', 'natural'],
    summary: 'Guide to selecting and understanding peanut butter options.',
  },
  {
    id: '6',
    title: 'Jelly and Jam Options',
    content: ['Grape - the classic choice', 'Strawberry - popular alternative', 'Exotic flavors'],
    talkPoints: 'Grape jelly is the traditional choice, but strawberry is equally popular. Don\'t be afraid to experiment with other fruit options.',
    keywords: ['jelly', 'jam', 'grape', 'strawberry'],
    summary: 'Overview of jelly and jam varieties for PBJ sandwiches.',
  },
  {
    id: '7',
    title: 'Assembly Technique',
    content: ['Spreading evenly', 'Edge-to-edge coverage', 'Layering order'],
    talkPoints: 'Now for assembly. Spread peanut butter on one slice and jelly on the other. Make sure to cover edge-to-edge for consistent flavor in every bite.',
    keywords: ['assembly', 'spreading', 'technique'],
    summary: 'Step-by-step assembly instructions.',
  },
  {
    id: '8',
    title: 'Cutting Styles',
    content: ['Diagonal - classic triangle', 'Horizontal - rectangles', 'No cut - whole sandwich'],
    talkPoints: 'How you cut your sandwich matters! Diagonal cuts create the classic triangle look. Some prefer horizontal cuts or leaving it whole.',
    keywords: ['cutting', 'diagonal', 'triangle', 'presentation'],
    summary: 'Different ways to cut and present your sandwich.',
  },
  {
    id: '9',
    title: 'Serving Suggestions',
    content: ['Pair with milk', 'Add chips on the side', 'Pack for lunch'],
    talkPoints: 'A PBJ pairs perfectly with a cold glass of milk. Add some chips for crunch, or pack it for a convenient lunch option.',
    keywords: ['serving', 'pairing', 'milk', 'lunch'],
    summary: 'Suggestions for serving and enjoying your PBJ.',
  },
  {
    id: '10',
    title: 'Summary & Next Steps',
    content: ['Review key points', 'Practice makes perfect', 'Share your creations'],
    talkPoints: 'Congratulations! You now know how to make the perfect PBJ sandwich. Practice your technique and share your creations with others.',
    keywords: ['summary', 'conclusion', 'practice'],
    summary: 'Course conclusion and encouragement to practice.',
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
