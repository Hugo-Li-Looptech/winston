import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Course, SlideFile, WizardSettings, Slide, Assessment, AssessmentQuestion, WizardStep, CourseItem, CourseVersion } from '@/types/course';
import { Comment, proxyComments } from '@/types/comment';

interface CompletedSteps {
  upload: boolean;
  wizard: boolean;
  scripting: boolean;
}

interface CourseMetadata {
  duration: string;
  totalSlides: number;
  totalAssessments: number;
  difficulty: string;
  tags: string[];
  learningObjectives: string[];
  prerequisites: string[];
  author: string;
  lastModified: string;
}

interface CourseContextType {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  currentCourse: {
    slideFiles: SlideFile[];
    supplementFiles: SlideFile[];
    wizardSettings: WizardSettings;
    slides: Slide[];
    assessments: Assessment[];
    courseItems: CourseItem[];
    currentStep: WizardStep;
    courseTitle: string;
    courseDescription: string;
    metadata: CourseMetadata;
  };
  completedSteps: CompletedSteps;
  comments: Comment[];
  // Version control
  courseVersions: Map<string, CourseVersion[]>;
  currentVersionIds: Map<string, string>;
  setSlideFiles: (files: SlideFile[]) => void;
  setSupplementFiles: (files: SlideFile[]) => void;
  setWizardSettings: (settings: WizardSettings) => void;
  setSlides: (slides: Slide[]) => void;
  setAssessments: (assessments: Assessment[]) => void;
  setCourseItems: (items: CourseItem[]) => void;
  insertAssessmentAtIndex: (index: number) => void;
  addQuestionToAssessment: (assessmentId: string) => void;
  removeQuestionFromAssessment: (assessmentId: string, questionId: string) => void;
  setCurrentStep: (step: WizardStep) => void;
  setCourseTitle: (title: string) => void;
  setCourseDescription: (description: string) => void;
  setCompletedSteps: React.Dispatch<React.SetStateAction<CompletedSteps>>;
  markStepComplete: (step: 'upload' | 'wizard' | 'scripting') => void;
  setMetadata: (metadata: Partial<CourseMetadata>) => void;
  addComment: (content: string, slideId?: string) => void;
  resolveComment: (commentId: string) => void;
  resetCurrentCourse: () => void;
  deleteCourse: (id: string) => void;
  updateCourseStatus: (id: string, status: Course['status']) => void;
  duplicateCourse: (id: string) => void;
  publishCourse: () => void;
  saveCourseAsDraft: () => void;
  // Version control functions
  saveVersion: (courseId: string, versionName: string, isPublished?: boolean) => void;
  getVersions: (courseId: string) => CourseVersion[];
  getCurrentVersionId: (courseId: string) => string | undefined;
  restoreVersion: (courseId: string, versionId: string) => void;
  branchFromVersion: (courseId: string, versionId: string) => void;
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

// Proxy courses for initial state
const proxyCourses: Course[] = [
  {
    id: 'proxy-1',
    title: 'Introduction to Machine Learning',
    date: 'Dec 1, 2024',
    status: 'published',
    progress: '100%',
  },
  {
    id: 'proxy-2',
    title: 'Advanced React Patterns',
    date: 'Nov 28, 2024',
    status: 'in_progress',
    progress: 'setting_talk_points',
  },
  {
    id: 'proxy-3',
    title: 'UI/UX Design Fundamentals',
    date: 'Nov 25, 2024',
    status: 'pending',
    progress: 'slides_uploaded',
  },
];

// Create initial versions for proxy courses
const createInitialVersionsMap = (): Map<string, CourseVersion[]> => {
  const map = new Map<string, CourseVersion[]>();
  
  // Initial version for proxy-1 (published course)
  map.set('proxy-1', [
    {
      id: 'version-proxy-1-initial',
      versionName: 'Initial Draft',
      timestamp: '2024-11-28T10:00:00.000Z',
      author: 'Course Creator',
      courseSnapshot: {
        title: 'Introduction to Machine Learning',
        description: 'A comprehensive introduction to ML concepts',
        slides: defaultSlides,
        assessments: [],
        courseItems: buildCourseItemsFromSlides(defaultSlides),
        wizardSettings: defaultWizardSettings,
      },
    },
    {
      id: 'version-proxy-1-published',
      versionName: 'Published - Dec 1, 2024',
      timestamp: '2024-12-01T14:00:00.000Z',
      author: 'Course Creator',
      parentVersionId: 'version-proxy-1-initial',
      isPublished: true,
      courseSnapshot: {
        title: 'Introduction to Machine Learning',
        description: 'A comprehensive introduction to ML concepts',
        slides: defaultSlides,
        assessments: [],
        courseItems: buildCourseItemsFromSlides(defaultSlides),
        wizardSettings: defaultWizardSettings,
      },
    },
  ]);
  
  // Initial version for proxy-2 (in progress)
  map.set('proxy-2', [
    {
      id: 'version-proxy-2-initial',
      versionName: 'Initial Draft',
      timestamp: '2024-11-28T09:00:00.000Z',
      author: 'Course Creator',
      courseSnapshot: {
        title: 'Advanced React Patterns',
        description: 'Deep dive into React patterns and best practices',
        slides: defaultSlides,
        assessments: [],
        courseItems: buildCourseItemsFromSlides(defaultSlides),
        wizardSettings: defaultWizardSettings,
      },
    },
  ]);
  
  // Initial version for proxy-3 (pending)
  map.set('proxy-3', [
    {
      id: 'version-proxy-3-initial',
      versionName: 'Initial Draft',
      timestamp: '2024-11-25T08:00:00.000Z',
      author: 'Course Creator',
      courseSnapshot: {
        title: 'UI/UX Design Fundamentals',
        description: 'Learn the basics of UI/UX design',
        slides: defaultSlides,
        assessments: [],
        courseItems: buildCourseItemsFromSlides(defaultSlides),
        wizardSettings: defaultWizardSettings,
      },
    },
  ]);
  
  return map;
};

const createInitialVersionIdsMap = (): Map<string, string> => {
  const map = new Map<string, string>();
  map.set('proxy-1', 'version-proxy-1-published');
  map.set('proxy-2', 'version-proxy-2-initial');
  map.set('proxy-3', 'version-proxy-3-initial');
  return map;
};

const defaultMetadata: CourseMetadata = {
  duration: '45 minutes',
  totalSlides: 10,
  totalAssessments: 0,
  difficulty: 'Beginner',
  tags: ['cooking', 'basics', 'food'],
  learningObjectives: ['Understand PBJ history', 'Select quality ingredients', 'Master assembly technique'],
  prerequisites: ['None'],
  author: 'Course Creator',
  lastModified: new Date().toISOString(),
};

const CourseContext = createContext<CourseContextType | undefined>(undefined);

// Build initial course items from default slides
const buildCourseItemsFromSlides = (slides: Slide[]): CourseItem[] => {
  return slides.map((slide) => ({
    id: slide.id,
    type: 'slide' as const,
    slideData: slide,
  }));
};

export function CourseProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>(proxyCourses);

  const [slideFiles, setSlideFiles] = useState<SlideFile[]>([]);
  const [supplementFiles, setSupplementFiles] = useState<SlideFile[]>([]);
  const [wizardSettings, setWizardSettings] = useState<WizardSettings>(defaultWizardSettings);
  const [slides, setSlidesState] = useState<Slide[]>(defaultSlides);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [courseItems, setCourseItems] = useState<CourseItem[]>(buildCourseItemsFromSlides(defaultSlides));
  const [currentStep, setCurrentStep] = useState<WizardStep>('upload');
  const [courseTitle, setCourseTitle] = useState<string>('');
  const [courseDescription, setCourseDescription] = useState<string>('');
  const [completedSteps, setCompletedSteps] = useState<CompletedSteps>({
    upload: false,
    wizard: false,
    scripting: false,
  });
  const [metadata, setMetadataState] = useState<CourseMetadata>(defaultMetadata);
  const [comments, setComments] = useState<Comment[]>(proxyComments);
  
  // Version control state - initialized with proxy course versions
  const [courseVersions, setCourseVersions] = useState<Map<string, CourseVersion[]>>(createInitialVersionsMap);
  const [currentVersionIds, setCurrentVersionIds] = useState<Map<string, string>>(createInitialVersionIdsMap);

  // Wrapper to keep slides and courseItems in sync
  const setSlides = (newSlides: Slide[]) => {
    setSlidesState(newSlides);
    // Update courseItems to reflect slide changes
    setCourseItems((prevItems) => {
      const assessmentItems = prevItems.filter((item) => item.type === 'assessment');
      const newSlideItems = newSlides.map((slide) => ({
        id: slide.id,
        type: 'slide' as const,
        slideData: slide,
      }));
      // Re-merge: slides first, then assessments at their positions
      // For now, just rebuild based on slides (assessments handled separately)
      return [...newSlideItems, ...assessmentItems];
    });
  };

  const markStepComplete = (step: 'upload' | 'wizard' | 'scripting') => {
    setCompletedSteps((prev) => ({ ...prev, [step]: true }));
  };

  const setMetadata = (updates: Partial<CourseMetadata>) => {
    setMetadataState((prev) => ({ ...prev, ...updates, lastModified: new Date().toISOString() }));
  };

  const addComment = (content: string, slideId?: string) => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      userId: 'current-user',
      userName: 'You',
      content,
      timestamp: new Date(),
      slideId,
      resolved: false,
    };
    setComments((prev) => [newComment, ...prev]);
  };

  const resolveComment = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, resolved: !c.resolved } : c))
    );
  };

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

  const insertAssessmentAtIndex = (index: number) => {
    const newAssessment: Assessment = {
      id: `assessment-${Date.now()}`,
      weight: 10,
      passingThreshold: 50,
      questions: [createDefaultQuestion()],
    };
    
    const newItem: CourseItem = {
      id: newAssessment.id,
      type: 'assessment',
      assessmentData: newAssessment,
    };
    
    setCourseItems((prevItems) => {
      const newItems = [...prevItems];
      newItems.splice(index + 1, 0, newItem);
      return newItems;
    });
    
    setAssessments((prev) => [...prev, newAssessment]);
  };

  const addQuestionToAssessment = (assessmentId: string) => {
    setCourseItems((prevItems) =>
      prevItems.map((item) => {
        if (item.type === 'assessment' && item.assessmentData?.id === assessmentId) {
          return {
            ...item,
            assessmentData: {
              ...item.assessmentData,
              questions: [...item.assessmentData.questions, createDefaultQuestion()],
            },
          };
        }
        return item;
      })
    );
  };

  const removeQuestionFromAssessment = (assessmentId: string, questionId: string) => {
    setCourseItems((prevItems) =>
      prevItems.map((item) => {
        if (item.type === 'assessment' && item.assessmentData?.id === assessmentId) {
          const updatedQuestions = item.assessmentData.questions.filter((q) => q.id !== questionId);
          // Don't allow removing the last question
          if (updatedQuestions.length === 0) return item;
          return {
            ...item,
            assessmentData: {
              ...item.assessmentData,
              questions: updatedQuestions,
            },
          };
        }
        return item;
      })
    );
  };

  const resetCurrentCourse = () => {
    setSlideFiles([]);
    setSupplementFiles([]);
    setWizardSettings(defaultWizardSettings);
    setSlidesState(defaultSlides);
    setAssessments([]);
    setCourseItems(buildCourseItemsFromSlides(defaultSlides));
    setCurrentStep('upload');
    setCourseTitle('');
    setCourseDescription('');
    setCompletedSteps({ upload: false, wizard: false, scripting: false });
    setMetadataState(defaultMetadata);
  };

  const deleteCourse = (id: string) => {
    setCourses(courses.filter((course) => course.id !== id));
  };

  const updateCourseStatus = (id: string, status: Course['status']) => {
    setCourses(
      courses.map((course) =>
        course.id === id ? { ...course, status } : course
      )
    );
  };

  const duplicateCourse = (id: string) => {
    const courseToDuplicate = courses.find((course) => course.id === id);
    if (courseToDuplicate) {
      const newCourse: Course = {
        ...courseToDuplicate,
        id: Date.now().toString(),
        title: `${courseToDuplicate.title} (Copy)`,
        status: 'pending',
        progress: '0%',
      };
      setCourses([...courses, newCourse]);
    }
  };

  const publishCourse = () => {
    const newCourse: Course = {
      id: Date.now().toString(),
      title: courseTitle || 'Untitled Course',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'published',
      progress: '100%',
    };
    setCourses((prev) => [...prev, newCourse]);
  };

  const saveCourseAsDraft = () => {
    const newCourse: Course = {
      id: Date.now().toString(),
      title: courseTitle || 'Untitled Course',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'in_progress',
      progress: 'setting_talk_points',
    };
    setCourses((prev) => [...prev, newCourse]);
  };

  // Version control functions
  const saveVersion = (courseId: string, versionName: string, isPublished?: boolean) => {
    const newVersion: CourseVersion = {
      id: `version-${Date.now()}`,
      versionName,
      timestamp: new Date().toISOString(),
      author: 'Course Creator',
      parentVersionId: currentVersionIds.get(courseId),
      isPublished,
      courseSnapshot: {
        title: courseTitle,
        description: courseDescription,
        slides: [...slides],
        assessments: [...assessments],
        courseItems: [...courseItems],
        wizardSettings: { ...wizardSettings },
      },
    };

    setCourseVersions((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(courseId) || [];
      newMap.set(courseId, [...existing, newVersion]);
      return newMap;
    });

    setCurrentVersionIds((prev) => {
      const newMap = new Map(prev);
      newMap.set(courseId, newVersion.id);
      return newMap;
    });
  };

  const getCurrentVersionId = (courseId: string): string | undefined => {
    return currentVersionIds.get(courseId);
  };

  const getVersions = (courseId: string): CourseVersion[] => {
    return courseVersions.get(courseId) || [];
  };

  const restoreVersion = (courseId: string, versionId: string) => {
    const versions = courseVersions.get(courseId) || [];
    const version = versions.find((v) => v.id === versionId);
    if (version) {
      setSlidesState(version.courseSnapshot.slides);
      setAssessments(version.courseSnapshot.assessments);
      setCourseItems(version.courseSnapshot.courseItems);
      setCourseTitle(version.courseSnapshot.title);
      setCourseDescription(version.courseSnapshot.description);
      setWizardSettings(version.courseSnapshot.wizardSettings);
      
      setCurrentVersionIds((prev) => {
        const newMap = new Map(prev);
        newMap.set(courseId, versionId);
        return newMap;
      });
    }
  };

  const branchFromVersion = (courseId: string, versionId: string) => {
    const versions = courseVersions.get(courseId) || [];
    const version = versions.find((v) => v.id === versionId);
    if (version) {
      // Create a new branch version within the SAME course's version tree
      const branchVersion: CourseVersion = {
        id: `version-${Date.now()}`,
        versionName: `Branch from ${version.versionName}`,
        timestamp: new Date().toISOString(),
        author: 'Course Creator',
        parentVersionId: versionId, // Links to the source version, creating a branch in the tree
        courseSnapshot: { ...version.courseSnapshot },
      };

      // Add the branch to the same course's version history
      setCourseVersions((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(courseId) || [];
        newMap.set(courseId, [...existing, branchVersion]);
        return newMap;
      });

      // Set the new branch as the current version
      setCurrentVersionIds((prev) => {
        const newMap = new Map(prev);
        newMap.set(courseId, branchVersion.id);
        return newMap;
      });
    }
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
          courseItems,
          currentStep,
          courseTitle,
          courseDescription,
          metadata,
        },
        completedSteps,
        comments,
        courseVersions,
        currentVersionIds,
        setSlideFiles,
        setSupplementFiles,
        setWizardSettings,
        setSlides,
        setAssessments,
        setCourseItems,
        insertAssessmentAtIndex,
        addQuestionToAssessment,
        removeQuestionFromAssessment,
        setCurrentStep,
        setCourseTitle,
        setCourseDescription,
        setCompletedSteps,
        markStepComplete,
        setMetadata,
        addComment,
        resolveComment,
        resetCurrentCourse,
        deleteCourse,
        updateCourseStatus,
        duplicateCourse,
        publishCourse,
        saveCourseAsDraft,
        saveVersion,
        getVersions,
        getCurrentVersionId,
        restoreVersion,
        branchFromVersion,
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
