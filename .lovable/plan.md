
# Demo Mode Navigation on Skip/Back

## Overview

When users click "Skip" or "Back" in the Demo Guidance Panel, the main screen should automatically navigate to the correct step corresponding to the next scenario's stage.

---

## Current Behavior

- **Skip**: Advances the scenario checkpoint but stays on the current page
- **Back**: Goes to previous checkpoint but stays on the current page

## Desired Behavior

- **Skip**: Advances checkpoint AND navigates to the page matching the new scenario's stage
- **Back**: Goes back AND navigates to the page matching that scenario's stage

---

## Stage to SubStep Mapping

| Scenario Stage | CreateCourse SubStep |
|----------------|---------------------|
| `upload` | `upload` |
| `wizard` | `wizard-input` |
| `voice` | `wizard-confirm` |
| `scripting` | `scripting` |
| `preview` | `preview` |

---

## Implementation Approach

### Option: Callback Registration Pattern

The cleanest approach is to have `CreateCourse` register a navigation callback with `DemoModeContext`, which gets called whenever the scenario changes.

### Changes to DemoModeContext

1. Add a `onScenarioChange` callback registration
2. Modify `skipScenario` and `previousScenario` to call this callback with the new scenario's stage
3. Export a helper to get the stage for a given checkpoint

```typescript
// New type and state
type StageChangeCallback = (stage: DemoScenario['stage']) => void;
const [onStageChange, setOnStageChange] = useState<StageChangeCallback | null>(null);

// New function to register callback
const registerStageChangeCallback = useCallback((callback: StageChangeCallback | null) => {
  setOnStageChange(() => callback);
}, []);

// Modify skipScenario to call callback
const skipScenario = useCallback(() => {
  const nextIndex = currentCheckpoint + 1;
  if (nextIndex >= scenarios.length) {
    setShowCompleteModal(true);
    return;
  }
  
  const nextScenario = scenarios[nextIndex];
  setScenarios(prev => prev.map((s, i) => 
    i === currentCheckpoint ? { ...s, completed: true } : s
  ));
  setCurrentCheckpoint(nextIndex);
  setTriggeredScenarios(new Set());
  
  // Navigate to the next scenario's stage
  if (onStageChange && nextScenario) {
    onStageChange(nextScenario.stage);
  }
}, [currentCheckpoint, scenarios, onStageChange]);

// Similar changes for previousScenario
```

### Changes to CreateCourse

Register the callback on mount to handle stage changes:

```typescript
const { registerStageChangeCallback } = useDemoMode();

// Map stage to subStep
const stageToSubStep = (stage: DemoScenario['stage']): SubStep => {
  switch (stage) {
    case 'upload': return 'upload';
    case 'wizard': return 'wizard-input';
    case 'voice': return 'wizard-confirm';
    case 'scripting': return 'scripting';
    case 'preview': return 'preview';
  }
};

// Register callback when in demo mode
useEffect(() => {
  if (isDemoMode) {
    registerStageChangeCallback((stage) => {
      setSubStep(stageToSubStep(stage));
    });
  }
  return () => {
    registerStageChangeCallback(null);
  };
}, [isDemoMode, registerStageChangeCallback]);
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/contexts/DemoModeContext.tsx` | Add callback registration, modify skip/previous to trigger navigation |
| `src/pages/CreateCourse.tsx` | Register navigation callback when in demo mode |

---

## Technical Details

### DemoModeContext Changes

```typescript
// Add to interface
interface DemoModeContextType {
  // ... existing
  registerStageChangeCallback: (callback: ((stage: DemoScenario['stage']) => void) | null) => void;
}

// Add state
const [stageChangeCallback, setStageChangeCallback] = useState<((stage: DemoScenario['stage']) => void) | null>(null);

// Add registration function
const registerStageChangeCallback = useCallback((callback: ((stage: DemoScenario['stage']) => void) | null) => {
  setStageChangeCallback(() => callback);
}, []);

// Modify skipScenario
const skipScenario = useCallback(() => {
  const nextIndex = currentCheckpoint + 1;
  
  if (nextIndex >= scenarios.length) {
    setShowCompleteModal(true);
    return;
  }
  
  setScenarios(prev => prev.map((s, i) => 
    i === currentCheckpoint ? { ...s, completed: true } : s
  ));
  
  setTriggeredScenarios(new Set());
  setCurrentCheckpoint(nextIndex);
  
  // Call the navigation callback with the new stage
  const nextScenario = scenarios[nextIndex];
  if (stageChangeCallback && nextScenario) {
    stageChangeCallback(nextScenario.stage);
  }
}, [currentCheckpoint, scenarios, stageChangeCallback]);

// Modify previousScenario similarly
const previousScenario = useCallback(() => {
  if (currentCheckpoint <= 0) return;
  
  const prevIndex = currentCheckpoint - 1;
  setTriggeredScenarios(new Set());
  setCurrentCheckpoint(prevIndex);
  
  const prevScenario = scenarios[prevIndex];
  if (stageChangeCallback && prevScenario) {
    stageChangeCallback(prevScenario.stage);
  }
}, [currentCheckpoint, scenarios, stageChangeCallback]);
```

### CreateCourse Changes

```typescript
import { useDemoMode, DemoScenario } from '@/contexts/DemoModeContext';

// Inside component
const { registerStageChangeCallback } = useDemoMode();

// Stage to SubStep mapping
const stageToSubStep = (stage: DemoScenario['stage']): SubStep => {
  switch (stage) {
    case 'upload': return 'upload';
    case 'wizard': return 'wizard-input';
    case 'voice': return 'wizard-confirm';
    case 'scripting': return 'scripting';
    case 'preview': return 'preview';
  }
};

// Register callback when in demo mode
useEffect(() => {
  if (isDemoMode) {
    registerStageChangeCallback((stage) => {
      setSubStep(stageToSubStep(stage));
    });
    
    return () => {
      registerStageChangeCallback(null);
    };
  }
}, [isDemoMode, registerStageChangeCallback]);
```

---

## Result

After implementation:
- Clicking **Skip** advances to the next error scenario AND navigates to that scenario's corresponding page
- Clicking **Back** goes to the previous scenario AND navigates to that scenario's page
- This only affects demo mode - regular course creation is unchanged
