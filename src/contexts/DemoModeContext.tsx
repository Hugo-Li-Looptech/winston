import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type DemoScenarioId = 
  | 'upload-network'
  | 'upload-format'
  | 'title-required'
  | 'pref-save'
  | 'voice-preview'
  | 'ai-quota'
  | 'autosave-fail'
  | 'add-test-fail'
  | 'max-questions'
  | 'save-fail'
  | 'version-conflict'
  | 'audio-fail'
  | 'publish-fail';

export interface DemoScenario {
  id: DemoScenarioId;
  stage: 'upload' | 'wizard' | 'voice' | 'scripting' | 'preview';
  title: string;
  instruction: string;
  trigger: string;
  pattern: string;
  completed: boolean;
}

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'upload-network',
    stage: 'upload',
    title: 'Upload Network Failure',
    instruction: 'Drag a file to the upload area. The upload will fail due to a simulated network error.',
    trigger: 'Drop any file',
    pattern: 'Progress bar fails, inline error appears, retry button available',
    completed: false,
  },
  {
    id: 'upload-format',
    stage: 'upload',
    title: 'Unsupported File Format',
    instruction: 'Try uploading again. This time you\'ll see an unsupported format error.',
    trigger: 'Drop any file',
    pattern: 'Toast notification with file requirements',
    completed: false,
  },
  {
    id: 'title-required',
    stage: 'upload',
    title: 'Title Validation',
    instruction: 'Try clicking Continue without entering a course title.',
    trigger: 'Click Continue with empty title',
    pattern: 'Inline error under the input field',
    completed: false,
  },
  {
    id: 'pref-save',
    stage: 'wizard',
    title: 'Preference Save Failed',
    instruction: 'Toggle any audience type checkbox. The save will fail.',
    trigger: 'Click any audience checkbox',
    pattern: 'Warning toast, checkbox still toggles locally',
    completed: false,
  },
  {
    id: 'voice-preview',
    stage: 'voice',
    title: 'Voice Preview Unavailable',
    instruction: 'Click the Preview button on any voice card.',
    trigger: 'Click Preview button',
    pattern: 'Toast notification, button shows unavailable state',
    completed: false,
  },
  {
    id: 'ai-quota',
    stage: 'voice',
    title: 'AI Quota Exceeded',
    instruction: 'Click "Generate Talk Points" to proceed. The generation will fail.',
    trigger: 'Click Generate Talk Points',
    pattern: 'Destructive toast with retry suggestion',
    completed: false,
  },
  {
    id: 'autosave-fail',
    stage: 'scripting',
    title: 'Auto-Save Interrupted',
    instruction: 'Wait a few seconds. An auto-save will be triggered and fail.',
    trigger: 'Automatic (5 seconds)',
    pattern: 'Warning toast, "unsaved" badge pulses',
    completed: false,
  },
  {
    id: 'add-test-fail',
    stage: 'scripting',
    title: 'Unable to Add Test',
    instruction: 'Click the "+" button to add an assessment between slides.',
    trigger: 'Click + (add assessment)',
    pattern: 'Destructive toast + inline error',
    completed: false,
  },
  {
    id: 'max-questions',
    stage: 'scripting',
    title: 'Maximum Questions Reached',
    instruction: 'Try adding another question to the assessment.',
    trigger: 'Click Add Question',
    pattern: 'Warning toast showing limit reached',
    completed: false,
  },
  {
    id: 'save-fail',
    stage: 'scripting',
    title: 'Save Failed',
    instruction: 'Click the Save button in the header.',
    trigger: 'Click Save',
    pattern: 'Destructive toast with retry option',
    completed: false,
  },
  {
    id: 'version-conflict',
    stage: 'scripting',
    title: 'Version Conflict',
    instruction: 'Click the Publish button. A conflict will be detected.',
    trigger: 'Click Publish',
    pattern: 'Warning dialog about concurrent edit',
    completed: false,
  },
  {
    id: 'audio-fail',
    stage: 'preview',
    title: 'Audio Playback Failed',
    instruction: 'Click the Play button to hear the narration.',
    trigger: 'Click Play',
    pattern: 'Inline error with retry option',
    completed: false,
  },
  {
    id: 'publish-fail',
    stage: 'preview',
    title: 'Server Error on Publish',
    instruction: 'Click Publish to complete the course.',
    trigger: 'Click Publish',
    pattern: 'Destructive toast with server error (500)',
    completed: false,
  },
];

interface DemoModeContextType {
  isActive: boolean;
  currentCheckpoint: number;
  scenarios: DemoScenario[];
  showIntroModal: boolean;
  showCompleteModal: boolean;
  guidanceVisible: boolean;
  
  // Actions
  startDemo: () => void;
  exitDemo: () => void;
  shouldTriggerError: (scenarioId: DemoScenarioId) => boolean;
  markScenarioComplete: (scenarioId: DemoScenarioId) => void;
  skipScenario: () => void;
  nextScenario: () => void;
  dismissIntroModal: () => void;
  dismissCompleteModal: () => void;
  toggleGuidance: () => void;
  getCurrentScenario: () => DemoScenario | null;
  getProgress: () => { current: number; total: number };
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentCheckpoint, setCurrentCheckpoint] = useState(0);
  const [scenarios, setScenarios] = useState<DemoScenario[]>(DEMO_SCENARIOS);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [guidanceVisible, setGuidanceVisible] = useState(true);
  const [triggeredScenarios, setTriggeredScenarios] = useState<Set<DemoScenarioId>>(new Set());

  const startDemo = useCallback(() => {
    setIsActive(true);
    setCurrentCheckpoint(0);
    setScenarios(DEMO_SCENARIOS.map(s => ({ ...s, completed: false })));
    setTriggeredScenarios(new Set());
    setShowIntroModal(true);
    setGuidanceVisible(true);
  }, []);

  const exitDemo = useCallback(() => {
    setIsActive(false);
    setShowIntroModal(false);
    setShowCompleteModal(false);
  }, []);

  const shouldTriggerError = useCallback((scenarioId: DemoScenarioId): boolean => {
    if (!isActive) return false;
    
    const currentScenario = scenarios[currentCheckpoint];
    if (!currentScenario || currentScenario.id !== scenarioId) return false;
    
    // Prevent double-triggering the same scenario
    if (triggeredScenarios.has(scenarioId)) return false;
    
    setTriggeredScenarios(prev => new Set(prev).add(scenarioId));
    return true;
  }, [isActive, currentCheckpoint, scenarios, triggeredScenarios]);

  const markScenarioComplete = useCallback((scenarioId: DemoScenarioId) => {
    setScenarios(prev => prev.map(s => 
      s.id === scenarioId ? { ...s, completed: true } : s
    ));
    
    // Auto-advance to next scenario
    setCurrentCheckpoint(prev => {
      const nextIndex = prev + 1;
      if (nextIndex >= scenarios.length) {
        setShowCompleteModal(true);
        return prev;
      }
      // Clear triggered status for the next scenario
      setTriggeredScenarios(new Set());
      return nextIndex;
    });
  }, [scenarios.length]);

  const skipScenario = useCallback(() => {
    setScenarios(prev => prev.map((s, i) => 
      i === currentCheckpoint ? { ...s, completed: true } : s
    ));
    
    setCurrentCheckpoint(prev => {
      const nextIndex = prev + 1;
      if (nextIndex >= scenarios.length) {
        setShowCompleteModal(true);
        return prev;
      }
      setTriggeredScenarios(new Set());
      return nextIndex;
    });
  }, [currentCheckpoint, scenarios.length]);

  const nextScenario = useCallback(() => {
    setCurrentCheckpoint(prev => {
      const nextIndex = prev + 1;
      if (nextIndex >= scenarios.length) {
        setShowCompleteModal(true);
        return prev;
      }
      setTriggeredScenarios(new Set());
      return nextIndex;
    });
  }, [scenarios.length]);

  const dismissIntroModal = useCallback(() => {
    setShowIntroModal(false);
  }, []);

  const dismissCompleteModal = useCallback(() => {
    setShowCompleteModal(false);
    setIsActive(false);
  }, []);

  const toggleGuidance = useCallback(() => {
    setGuidanceVisible(prev => !prev);
  }, []);

  const getCurrentScenario = useCallback((): DemoScenario | null => {
    return scenarios[currentCheckpoint] || null;
  }, [scenarios, currentCheckpoint]);

  const getProgress = useCallback(() => {
    return {
      current: currentCheckpoint + 1,
      total: scenarios.length,
    };
  }, [currentCheckpoint, scenarios.length]);

  return (
    <DemoModeContext.Provider
      value={{
        isActive,
        currentCheckpoint,
        scenarios,
        showIntroModal,
        showCompleteModal,
        guidanceVisible,
        startDemo,
        exitDemo,
        shouldTriggerError,
        markScenarioComplete,
        skipScenario,
        nextScenario,
        dismissIntroModal,
        dismissCompleteModal,
        toggleGuidance,
        getCurrentScenario,
        getProgress,
      }}
    >
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (context === undefined) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
}
