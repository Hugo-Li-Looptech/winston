import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Course, SlideFile, WizardSettings, Slide, Assessment, AssessmentQuestion, WizardStep, CourseItem, CourseVersion, FinalAssessment } from '@/types/course';
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
    finalAssessment: FinalAssessment | null;
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
  markStepComplete: (step: 'upload' | 'wizard' | 'scripting' | 'preview') => void;
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
  // Final Assessment
  finalAssessment: FinalAssessment | null;
  setFinalAssessment: (assessment: FinalAssessment | null) => void;
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
    title: 'Summary & Next Steps',
    content: ['Review key points', 'Practice makes perfect', 'Share your creations'],
    talkPoints: 'Congratulations! You now know how to make the perfect PBJ sandwich. Practice your technique and share your creations with others.',
    keywords: ['summary', 'conclusion', 'practice'],
    summary: 'Course conclusion and encouragement to practice.',
  },
];

// Version-specific slide content generators
const createMLSlidesV1 = (): Slide[] => [
  { id: 'ml-1', title: 'What is Machine Learning?', content: ['Definition of ML', 'Types of learning'], talkPoints: 'Machine learning is a subset of artificial intelligence that enables systems to learn from data.', keywords: ['ML', 'AI'], summary: 'Introduction to ML concepts.' },
  { id: 'ml-2', title: 'Supervised Learning', content: ['Labeled data', 'Classification', 'Regression'], talkPoints: 'Supervised learning uses labeled datasets to train algorithms.', keywords: ['supervised', 'classification'], summary: 'Overview of supervised learning.' },
  { id: 'ml-3', title: 'Unsupervised Learning', content: ['Clustering', 'Pattern recognition'], talkPoints: 'Unsupervised learning finds hidden patterns in unlabeled data.', keywords: ['unsupervised', 'clustering'], summary: 'Introduction to unsupervised methods.' },
];

const createMLSlidesV2 = (): Slide[] => [
  { id: 'ml-1', title: 'What is Machine Learning?', content: ['Definition of ML', 'Types of learning', 'Real-world applications'], talkPoints: 'Machine learning is a powerful subset of artificial intelligence that enables computer systems to automatically learn and improve from experience without being explicitly programmed.', keywords: ['ML', 'AI', 'applications'], summary: 'Introduction to ML concepts.' },
  { id: 'ml-2', title: 'Supervised Learning Fundamentals', content: ['Labeled datasets', 'Classification algorithms', 'Regression models', 'Training process'], talkPoints: 'Supervised learning is the most common type of ML. It uses labeled training data to learn a mapping function that predicts outputs for new inputs.', keywords: ['supervised', 'classification', 'regression'], summary: 'Deep dive into supervised learning.' },
  { id: 'ml-3', title: 'Unsupervised Learning', content: ['Clustering', 'Pattern recognition'], talkPoints: 'Unsupervised learning discovers hidden patterns in unlabeled data through algorithms like k-means clustering.', keywords: ['unsupervised', 'clustering'], summary: 'Introduction to unsupervised methods.' },
  { id: 'ml-4', title: 'Neural Networks Basics', content: ['Neurons and layers', 'Activation functions', 'Backpropagation'], talkPoints: 'Neural networks are inspired by biological neurons. They consist of interconnected layers that process information.', keywords: ['neural', 'deep learning'], summary: 'Foundations of neural networks.' },
];

const createMLSlidesV3 = (): Slide[] => [
  { id: 'ml-1', title: 'Introduction to Machine Learning', content: ['What is ML?', 'Why ML matters today', 'Industry applications', 'Course roadmap'], talkPoints: 'Welcome to this comprehensive course on machine learning! ML is revolutionizing every industry from healthcare to finance. By the end of this course, you will understand core ML concepts and be ready to apply them.', keywords: ['ML', 'AI', 'introduction'], summary: 'Course introduction and overview.' },
  { id: 'ml-2', title: 'Supervised Learning Mastery', content: ['Training with labeled data', 'Classification vs Regression', 'Model evaluation metrics', 'Overfitting prevention'], talkPoints: 'Supervised learning is the backbone of most practical ML applications. We will explore how to train models effectively, evaluate their performance, and avoid common pitfalls like overfitting.', keywords: ['supervised', 'classification', 'evaluation'], summary: 'Comprehensive supervised learning guide.' },
  { id: 'ml-3', title: 'Unsupervised Learning Techniques', content: ['Clustering algorithms', 'Dimensionality reduction', 'Anomaly detection'], talkPoints: 'Unsupervised learning helps us find structure in data without labels. K-means, hierarchical clustering, and PCA are essential tools in your ML toolkit.', keywords: ['unsupervised', 'clustering', 'PCA'], summary: 'Advanced unsupervised methods.' },
  { id: 'ml-4', title: 'Deep Learning Foundations', content: ['Neural network architecture', 'Training deep networks', 'GPU acceleration'], talkPoints: 'Deep learning has transformed ML with its ability to learn complex representations. Understanding neural network fundamentals is crucial for modern ML practitioners.', keywords: ['deep learning', 'neural networks'], summary: 'Deep learning essentials.' },
  { id: 'ml-5', title: 'Practical ML Projects', content: ['Project setup', 'Data preparation', 'Model deployment'], talkPoints: 'Putting theory into practice is essential. We will walk through complete ML projects from data collection to production deployment.', keywords: ['projects', 'deployment'], summary: 'Hands-on ML implementation.' },
];

const createMLSlidesBranch = (): Slide[] => [
  { id: 'ml-1', title: 'ML for Beginners', content: ['Simple explanations', 'No math required', 'Visual examples'], talkPoints: 'This beginner-friendly approach to machine learning focuses on intuition over mathematics. Perfect for those new to the field.', keywords: ['beginner', 'simple'], summary: 'Beginner-friendly ML intro.' },
  { id: 'ml-2', title: 'Understanding Data', content: ['What is data?', 'Data types', 'Data quality'], talkPoints: 'Before diving into algorithms, we need to understand data. Good data is the foundation of any successful ML project.', keywords: ['data', 'basics'], summary: 'Data fundamentals.' },
  { id: 'ml-3', title: 'Your First Model', content: ['Simple linear regression', 'Making predictions', 'Evaluating results'], talkPoints: 'Let\'s build your very first ML model together! Linear regression is the perfect starting point.', keywords: ['first model', 'linear regression'], summary: 'Building your first model.' },
];

const createReactSlidesV1 = (): Slide[] => [
  { id: 'react-1', title: 'React Fundamentals Review', content: ['Components', 'Props', 'State'], talkPoints: 'Let\'s review React fundamentals before diving into advanced patterns.', keywords: ['react', 'fundamentals'], summary: 'React basics recap.' },
  { id: 'react-2', title: 'Component Patterns', content: ['Container/Presentational', 'Render Props'], talkPoints: 'Component patterns help organize code and improve reusability.', keywords: ['patterns', 'components'], summary: 'Common component patterns.' },
  { id: 'react-3', title: 'State Management', content: ['Context API', 'Redux basics'], talkPoints: 'Managing state at scale requires thoughtful architecture.', keywords: ['state', 'redux'], summary: 'State management strategies.' },
];

const createReactSlidesV2 = (): Slide[] => [
  { id: 'react-1', title: 'React Fundamentals Review', content: ['Components & JSX', 'Props drilling', 'State lifecycle', 'Hooks introduction'], talkPoints: 'Before exploring advanced patterns, let\'s ensure we have a solid foundation. We\'ll review components, props, state, and introduce the hooks paradigm that has transformed React development.', keywords: ['react', 'fundamentals', 'hooks'], summary: 'Comprehensive React basics.' },
  { id: 'react-2', title: 'Advanced Component Patterns', content: ['Container/Presentational', 'Render Props', 'Higher-Order Components', 'Compound Components'], talkPoints: 'These patterns have evolved over time. Compound components and render props offer powerful composition strategies for building flexible UI libraries.', keywords: ['patterns', 'HOC', 'composition'], summary: 'Advanced pattern deep dive.' },
  { id: 'react-3', title: 'Modern State Management', content: ['Context API optimization', 'Zustand', 'Jotai', 'React Query'], talkPoints: 'The state management landscape has shifted. While Redux remains popular, newer solutions like Zustand and React Query offer simpler APIs for specific use cases.', keywords: ['state', 'zustand', 'react-query'], summary: 'Modern state solutions.' },
  { id: 'react-4', title: 'Performance Optimization', content: ['Memoization', 'Code splitting', 'Virtual DOM'], talkPoints: 'Performance matters. Learn to use React.memo, useMemo, and useCallback effectively without premature optimization.', keywords: ['performance', 'memo'], summary: 'React performance tips.' },
];

const createUIUXSlidesV1 = (): Slide[] => [
  { id: 'uiux-1', title: 'Design Thinking', content: ['Empathize', 'Define', 'Ideate'], talkPoints: 'Design thinking is a user-centered approach to problem solving.', keywords: ['design thinking'], summary: 'Design thinking intro.' },
  { id: 'uiux-2', title: 'Visual Hierarchy', content: ['Size', 'Color', 'Contrast'], talkPoints: 'Visual hierarchy guides users through your interface.', keywords: ['hierarchy', 'visual'], summary: 'Visual design basics.' },
];

const createUIUXSlidesV2 = (): Slide[] => [
  { id: 'uiux-1', title: 'Design Thinking Process', content: ['Empathize with users', 'Define the problem', 'Ideate solutions', 'Prototype quickly'], talkPoints: 'Design thinking puts users at the center of every decision. This iterative process helps create products people actually want to use.', keywords: ['design thinking', 'process'], summary: 'Complete design thinking overview.' },
  { id: 'uiux-2', title: 'Visual Hierarchy Mastery', content: ['Size and scale', 'Color psychology', 'Contrast and whitespace', 'Typography hierarchy'], talkPoints: 'Mastering visual hierarchy is essential for effective design. Learn to guide the user\'s eye and communicate importance through visual cues.', keywords: ['hierarchy', 'visual', 'typography'], summary: 'Advanced visual hierarchy.' },
  { id: 'uiux-3', title: 'User Research Methods', content: ['Interviews', 'Surveys', 'Usability testing'], talkPoints: 'Good design starts with understanding your users. We\'ll explore various research methods to gather meaningful insights.', keywords: ['research', 'usability'], summary: 'User research fundamentals.' },
];

const createUIUXSlidesV3 = (): Slide[] => [
  { id: 'uiux-1', title: 'Introduction to UI/UX', content: ['What is UI?', 'What is UX?', 'The relationship between them'], talkPoints: 'UI and UX are related but distinct disciplines. UI focuses on visual elements while UX encompasses the entire user experience. Together they create products users love.', keywords: ['UI', 'UX', 'intro'], summary: 'UI/UX foundations.' },
  { id: 'uiux-2', title: 'Design Thinking Deep Dive', content: ['Empathy mapping', 'Problem framing', 'Brainstorming techniques', 'Rapid prototyping'], talkPoints: 'Design thinking is more than a process—it\'s a mindset. We\'ll practice each phase with hands-on exercises and real-world examples.', keywords: ['design thinking', 'empathy'], summary: 'Comprehensive design thinking.' },
  { id: 'uiux-3', title: 'Visual Design Principles', content: ['Gestalt principles', 'Color theory', 'Grid systems', 'Responsive design'], talkPoints: 'Visual design principles are the foundation of beautiful, functional interfaces. Understanding Gestalt psychology helps create cohesive designs.', keywords: ['visual', 'gestalt', 'color'], summary: 'Visual design mastery.' },
  { id: 'uiux-4', title: 'Prototyping & Testing', content: ['Low-fidelity prototypes', 'High-fidelity mockups', 'User testing sessions', 'Iterating on feedback'], talkPoints: 'Prototyping allows us to test ideas quickly and cheaply. We\'ll cover tools and techniques for creating effective prototypes at every fidelity level.', keywords: ['prototype', 'testing'], summary: 'Prototyping essentials.' },
];

const createUIUXSlidesBranchA = (): Slide[] => [
  { id: 'uiux-1', title: 'Mobile-First Design', content: ['Why mobile first?', 'Touch interactions', 'Small screen constraints'], talkPoints: 'Mobile-first design ensures your product works on the most constrained devices first, then progressively enhances for larger screens.', keywords: ['mobile', 'responsive'], summary: 'Mobile-first approach.' },
  { id: 'uiux-2', title: 'App Navigation Patterns', content: ['Tab bars', 'Hamburger menus', 'Bottom sheets'], talkPoints: 'Navigation is critical for mobile apps. We\'ll explore patterns that work well on small screens and follow platform conventions.', keywords: ['navigation', 'mobile'], summary: 'Mobile navigation patterns.' },
  { id: 'uiux-3', title: 'Gesture Design', content: ['Swipe', 'Pinch', 'Long press'], talkPoints: 'Touch gestures are a powerful vocabulary for mobile interactions. Learn to use them intuitively without confusing users.', keywords: ['gestures', 'touch'], summary: 'Touch gesture design.' },
];

const createUIUXSlidesBranchB = (): Slide[] => [
  { id: 'uiux-1', title: 'iOS Design Guidelines', content: ['Human Interface Guidelines', 'SF Symbols', 'iOS patterns'], talkPoints: 'Apple\'s Human Interface Guidelines provide a foundation for creating intuitive iOS apps. Following platform conventions helps users feel at home.', keywords: ['iOS', 'Apple', 'HIG'], summary: 'iOS design fundamentals.' },
  { id: 'uiux-2', title: 'SwiftUI Components', content: ['Native components', 'Custom styling', 'Animations'], talkPoints: 'SwiftUI provides beautiful native components. Learn when to use them and when custom designs are appropriate.', keywords: ['SwiftUI', 'components'], summary: 'SwiftUI component guide.' },
];

// Error Handling course slides - 8 comprehensive slides with interactive demos
const createErrorHandlingSlides = (): Slide[] => [
  { id: 'error-1', title: 'Introduction to Error Handling', content: ['Why error handling matters', 'Types of errors in React', 'User experience impact', 'Course overview'], talkPoints: 'Welcome to this comprehensive course on error handling patterns in React! Proper error handling is crucial for creating robust applications that gracefully handle unexpected situations. You\'ll learn about boundaries, upload failures, save errors, and more.', keywords: ['error handling', 'introduction', 'React'], summary: 'Introduction to error handling concepts and importance.' },
  { id: 'error-2', title: 'Error Boundaries in Action', content: ['What are Error Boundaries', 'Catching component errors', 'Fallback UI patterns', 'Recovery strategies'], talkPoints: 'Error Boundaries are React components that catch JavaScript errors anywhere in their child component tree. They let you display a fallback UI instead of crashing the entire application. Try the interactive demo to see it in action!', keywords: ['error boundary', 'fallback', 'React'], summary: 'Learn how Error Boundaries catch and handle component errors.' },
  { id: 'error-3', title: 'File Upload Errors', content: ['Upload failed scenarios', 'Unsupported file formats', 'File size limits', 'Timeout handling'], talkPoints: 'File uploads are prone to many types of failures: network issues, wrong file types, size limits, and timeouts. This slide demonstrates how to handle each scenario with appropriate user feedback and retry options.', keywords: ['upload', 'file', 'network'], summary: 'Handling various file upload failure scenarios.' },
  { id: 'error-4', title: 'Assessment & Test Errors', content: ['Unable to add test', 'Question save failures', 'Maximum limits', 'Validation errors'], talkPoints: 'When creating assessments and tests, users may encounter server rejections, save failures, or validation issues. Each error type requires appropriate feedback—from inline errors to toast notifications.', keywords: ['assessment', 'test', 'validation'], summary: 'Managing errors in test and assessment creation workflows.' },
  { id: 'error-5', title: 'Save & Publish Errors', content: ['Auto-save interruptions', 'Publish failures', 'Draft save issues', 'Version conflicts'], talkPoints: 'Saving and publishing are critical operations. When they fail, users need clear guidance on what happened and how to recover. This includes auto-save failures, publish errors, and version conflicts from concurrent editing.', keywords: ['save', 'publish', 'conflict'], summary: 'Handling persistence and publishing failures gracefully.' },
  { id: 'error-6', title: 'Network Error Recovery', content: ['Connection lost detection', 'Request timeouts', 'Server 503 errors', 'Rate limiting (429)'], talkPoints: 'Network errors come in many forms: complete connection loss, slow responses, server unavailability, and rate limiting. Each requires specific handling strategies and user communication.', keywords: ['network', 'offline', 'timeout'], summary: 'Comprehensive network error handling strategies.' },
  { id: 'error-7', title: 'Inline Form Validation', content: ['Real-time validation', 'Error message placement', 'Accessibility considerations', 'Multi-field errors'], talkPoints: 'Inline errors appear directly next to the form field with the issue. This pattern provides immediate, contextual feedback that helps users correct mistakes quickly. Toast notifications work well for multiple validation errors.', keywords: ['validation', 'forms', 'inline errors'], summary: 'Implementing inline validation with accessible error messages.' },
  { id: 'error-8', title: 'Retry Mechanisms', content: ['Handling network failures', 'Retry buttons', 'Exponential backoff', 'User-initiated recovery'], talkPoints: 'Network failures are inevitable. Implementing retry mechanisms gives users a way to recover from temporary issues without refreshing the entire page. This demo shows a simulated API with a 70% failure rate.', keywords: ['retry', 'network', 'resilience'], summary: 'Building resilient applications with retry functionality.' },
];

// Create initial versions for proxy courses with comprehensive dummy data
const createInitialVersionsMap = (): Map<string, CourseVersion[]> => {
  const map = new Map<string, CourseVersion[]>();
  
  // proxy-1 (Introduction to Machine Learning) - Published course with 3 versions + 1 branch
  map.set('proxy-1', [
    {
      id: 'version-proxy-1-v1',
      versionName: 'v1.0 Initial Draft',
      timestamp: '2024-11-20T10:00:00.000Z',
      author: 'Sarah Chen',
      courseSnapshot: {
        title: 'Introduction to Machine Learning',
        description: 'Basic ML concepts',
        slides: createMLSlidesV1(),
        assessments: [],
        courseItems: createMLSlidesV1().map(s => ({ id: s.id, type: 'slide' as const, slideData: s })),
        wizardSettings: defaultWizardSettings,
      },
    },
    {
      id: 'version-proxy-1-v2',
      versionName: 'v1.1 Added Neural Networks',
      timestamp: '2024-11-25T14:30:00.000Z',
      author: 'Sarah Chen',
      parentVersionId: 'version-proxy-1-v1',
      courseSnapshot: {
        title: 'Introduction to Machine Learning',
        description: 'Expanded ML concepts with neural networks',
        slides: createMLSlidesV2(),
        assessments: [],
        courseItems: createMLSlidesV2().map(s => ({ id: s.id, type: 'slide' as const, slideData: s })),
        wizardSettings: defaultWizardSettings,
      },
    },
    {
      id: 'version-proxy-1-branch',
      versionName: 'v1.0-beginner (Simplified)',
      timestamp: '2024-11-26T09:00:00.000Z',
      author: 'Mike Johnson',
      parentVersionId: 'version-proxy-1-v1',
      courseSnapshot: {
        title: 'ML for Absolute Beginners',
        description: 'Beginner-friendly ML introduction',
        slides: createMLSlidesBranch(),
        assessments: [],
        courseItems: createMLSlidesBranch().map(s => ({ id: s.id, type: 'slide' as const, slideData: s })),
        wizardSettings: defaultWizardSettings,
      },
    },
    {
      id: 'version-proxy-1-v3',
      versionName: 'v2.0 Published',
      timestamp: '2024-12-01T14:00:00.000Z',
      author: 'Sarah Chen',
      parentVersionId: 'version-proxy-1-v2',
      isPublished: true,
      courseSnapshot: {
        title: 'Introduction to Machine Learning',
        description: 'A comprehensive introduction to ML concepts',
        slides: createMLSlidesV3(),
        assessments: [{ id: 'assess-ml-1', weight: 20, passingThreshold: 70, questions: [{ id: 'q1', question: 'What is supervised learning?', type: 'multi_selection', options: [{ label: 'Learning with labels', isCorrect: true }, { label: 'Learning without labels', isCorrect: false }] }] }],
        courseItems: [...createMLSlidesV3().map(s => ({ id: s.id, type: 'slide' as const, slideData: s }))],
        wizardSettings: defaultWizardSettings,
      },
    },
  ]);
  
  // proxy-2 (Advanced React Patterns) - In progress with 2 versions
  map.set('proxy-2', [
    {
      id: 'version-proxy-2-v1',
      versionName: 'v1.0 Initial Draft',
      timestamp: '2024-11-22T09:00:00.000Z',
      author: 'Alex Rivera',
      courseSnapshot: {
        title: 'Advanced React Patterns',
        description: 'React patterns overview',
        slides: createReactSlidesV1(),
        assessments: [],
        courseItems: createReactSlidesV1().map(s => ({ id: s.id, type: 'slide' as const, slideData: s })),
        wizardSettings: defaultWizardSettings,
      },
    },
    {
      id: 'version-proxy-2-v2',
      versionName: 'v1.1 Talk Points Updated',
      timestamp: '2024-11-28T09:00:00.000Z',
      author: 'Alex Rivera',
      parentVersionId: 'version-proxy-2-v1',
      courseSnapshot: {
        title: 'Advanced React Patterns',
        description: 'Deep dive into React patterns and best practices',
        slides: createReactSlidesV2(),
        assessments: [],
        courseItems: createReactSlidesV2().map(s => ({ id: s.id, type: 'slide' as const, slideData: s })),
        wizardSettings: defaultWizardSettings,
      },
    },
  ]);
  
  // proxy-3 (UI/UX Design Fundamentals) - Pending with 4 versions + 2 branches
  map.set('proxy-3', [
    {
      id: 'version-proxy-3-v1',
      versionName: 'v1.0 Initial',
      timestamp: '2024-11-15T08:00:00.000Z',
      author: 'Emma Wilson',
      courseSnapshot: {
        title: 'UI/UX Design Fundamentals',
        description: 'Basic design concepts',
        slides: createUIUXSlidesV1(),
        assessments: [],
        courseItems: createUIUXSlidesV1().map(s => ({ id: s.id, type: 'slide' as const, slideData: s })),
        wizardSettings: defaultWizardSettings,
      },
    },
    {
      id: 'version-proxy-3-v2',
      versionName: 'v1.1 Added Research',
      timestamp: '2024-11-18T11:00:00.000Z',
      author: 'Emma Wilson',
      parentVersionId: 'version-proxy-3-v1',
      courseSnapshot: {
        title: 'UI/UX Design Fundamentals',
        description: 'Design concepts with research methods',
        slides: createUIUXSlidesV2(),
        assessments: [],
        courseItems: createUIUXSlidesV2().map(s => ({ id: s.id, type: 'slide' as const, slideData: s })),
        wizardSettings: defaultWizardSettings,
      },
    },
    {
      id: 'version-proxy-3-branch-a',
      versionName: 'v1.0-mobile (Mobile Focus)',
      timestamp: '2024-11-19T14:00:00.000Z',
      author: 'David Kim',
      parentVersionId: 'version-proxy-3-v1',
      courseSnapshot: {
        title: 'Mobile UI/UX Design',
        description: 'Mobile-first design approach',
        slides: createUIUXSlidesBranchA(),
        assessments: [],
        courseItems: createUIUXSlidesBranchA().map(s => ({ id: s.id, type: 'slide' as const, slideData: s })),
        wizardSettings: defaultWizardSettings,
      },
    },
    {
      id: 'version-proxy-3-branch-b',
      versionName: 'v1.0-ios (iOS Specific)',
      timestamp: '2024-11-21T10:00:00.000Z',
      author: 'David Kim',
      parentVersionId: 'version-proxy-3-branch-a',
      courseSnapshot: {
        title: 'iOS Design Mastery',
        description: 'iOS-specific design patterns',
        slides: createUIUXSlidesBranchB(),
        assessments: [],
        courseItems: createUIUXSlidesBranchB().map(s => ({ id: s.id, type: 'slide' as const, slideData: s })),
        wizardSettings: defaultWizardSettings,
      },
    },
    {
      id: 'version-proxy-3-v3',
      versionName: 'v1.2 Refined Content',
      timestamp: '2024-11-25T08:00:00.000Z',
      author: 'Emma Wilson',
      parentVersionId: 'version-proxy-3-v2',
      courseSnapshot: {
        title: 'UI/UX Design Fundamentals',
        description: 'Learn the basics of UI/UX design',
        slides: createUIUXSlidesV3(),
        assessments: [{ id: 'assess-uiux-1', weight: 15, passingThreshold: 60, questions: [{ id: 'q1', question: 'What is the first step of design thinking?', type: 'multi_selection', options: [{ label: 'Empathize', isCorrect: true }, { label: 'Prototype', isCorrect: false }] }] }],
        courseItems: createUIUXSlidesV3().map(s => ({ id: s.id, type: 'slide' as const, slideData: s })),
        wizardSettings: defaultWizardSettings,
      },
    },
  ]);

  // proxy-error-handling (Error Handling Patterns) - Published demo course
  map.set('proxy-error-handling', [
    {
      id: 'version-error-v1',
      versionName: 'v1.0 Published',
      timestamp: '2025-01-29T10:00:00.000Z',
      author: 'Course Creator',
      isPublished: true,
      courseSnapshot: {
        title: 'Error Handling Patterns',
        description: 'Interactive demonstrations of error handling patterns in React applications',
        slides: createErrorHandlingSlides(),
        assessments: [],
        courseItems: createErrorHandlingSlides().map(s => ({ id: s.id, type: 'slide' as const, slideData: s })),
        wizardSettings: defaultWizardSettings,
      },
    },
  ]);
  
  return map;
};

const createInitialVersionIdsMap = (): Map<string, string> => {
  const map = new Map<string, string>();
  map.set('proxy-1', 'version-proxy-1-v3');
  map.set('proxy-2', 'version-proxy-2-v2');
  map.set('proxy-3', 'version-proxy-3-v3');
  map.set('proxy-error-handling', 'version-error-v1');
  return map;
};

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
  {
    id: 'proxy-error-handling',
    title: 'Error Handling Patterns',
    date: 'Jan 29, 2025',
    status: 'published',
    progress: '100%',
  },
];

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
  const [finalAssessment, setFinalAssessment] = useState<FinalAssessment | null>(null);
  
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

  const markStepComplete = (step: 'upload' | 'wizard' | 'scripting' | 'preview') => {
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
    setFinalAssessment(null);
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
      // Count existing branches from this version to name the new one
      const branchCount = versions.filter(v => v.parentVersionId === versionId).length;
      const branchName = branchCount === 0 
        ? `${version.versionName} (Branch)` 
        : `${version.versionName} (Branch ${branchCount + 1})`;
      
      // Create a new branch version within the SAME course's version tree
      const branchVersion: CourseVersion = {
        id: `version-branch-${Date.now()}`,
        versionName: branchName,
        timestamp: new Date().toISOString(),
        author: 'Course Creator',
        parentVersionId: versionId, // Link to parent to show as branch
        courseSnapshot: { ...version.courseSnapshot },
      };

      // Add the branch version to the SAME course's version history
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
          finalAssessment,
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
        finalAssessment,
        setFinalAssessment,
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
