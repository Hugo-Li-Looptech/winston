
# Demo Mode CTA Highlighting

## Overview

Add a visual highlight (animated ring border) to the next CTA button during demo mode. This guides users to the exact action they need to take for each error scenario. The highlighting will **only apply during the Error Handling demo mode**, not during normal course creation.

---

## Approach

### 1. Define CTA Targets Per Scenario

Each demo scenario has a specific trigger action. We'll map scenario IDs to CTA identifiers:

| Scenario ID | Stage | CTA to Highlight |
|-------------|-------|------------------|
| `upload-network` | Upload | Upload drop zone / Browse button |
| `upload-format` | Upload | Upload drop zone / Browse button |
| `pref-save` | Wizard | Audience checkboxes area |
| `voice-preview` | Voice | Preview button on voice cards |
| `ai-quota` | Voice | "Generate Talk Points" button |
| `autosave-fail` | Scripting | (No CTA - automatic trigger) |
| `add-test-fail` | Scripting | "+" button between slides |
| `max-questions` | Scripting | "Add Question" button |
| `save-fail` | Scripting | "Save" button in header |
| `version-conflict` | Scripting | "Publish" button in header |
| `audio-fail` | Preview | "Play" button |
| `publish-fail` | Preview | "Publish" button in header |

---

### 2. Create Helper Hook

Add a `getHighlightedCTA()` function to `DemoModeContext` that returns the current CTA identifier based on the active scenario:

```typescript
type DemoCTATarget = 
  | 'upload-zone'
  | 'audience-checkbox'
  | 'voice-preview'
  | 'generate-button'
  | 'add-test-button'
  | 'add-question-button'
  | 'save-button'
  | 'publish-button'
  | 'play-button'
  | null;

getHighlightedCTA: () => DemoCTATarget
```

---

### 3. CSS Animation Class

Create a reusable highlight style that creates an animated pulsing ring:

```css
.demo-highlight {
  @apply ring-2 ring-primary ring-offset-2 ring-offset-background;
  animation: demo-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes demo-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(var(--primary), 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(var(--primary), 0); }
}
```

---

### 4. Component Updates

Each component with a CTA will check if demo mode is active and if its CTA is the current target:

**Pattern:**
```typescript
const { isActive: isDemoMode, getHighlightedCTA } = useDemoMode();
const highlightTarget = isDemoMode ? getHighlightedCTA() : null;

// On the button:
className={cn(
  "existing-classes",
  highlightTarget === 'generate-button' && "demo-highlight"
)}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/contexts/DemoModeContext.tsx` | Add `DemoCTATarget` type and `getHighlightedCTA()` function |
| `src/index.css` | Add `.demo-highlight` animation class |
| `src/pages/create/UploadStep.tsx` | Highlight upload zone for `upload-network`, `upload-format` |
| `src/pages/create/WizardStep.tsx` | Highlight first audience checkbox for `pref-save` |
| `src/pages/create/WizardConfirmStep.tsx` | Highlight Preview buttons for `voice-preview`, Generate button for `ai-quota` |
| `src/pages/create/ScriptingStep.tsx` | Highlight "+" button for `add-test-fail`, Add Question for `max-questions` |
| `src/components/CourseEditorHeader.tsx` | Highlight Save/Publish buttons when applicable |
| `src/pages/create/PreviewStep.tsx` | Highlight Play button for `audio-fail`, Publish for `publish-fail` |

---

## Technical Details

### DemoModeContext Addition

```typescript
// Add to DemoModeContext.tsx

type DemoCTATarget = 
  | 'upload-zone'
  | 'audience-checkbox'
  | 'voice-preview'
  | 'generate-button'
  | 'add-test-button'
  | 'add-question-button'
  | 'save-button'
  | 'publish-button'
  | 'play-button'
  | null;

const CTA_MAP: Record<DemoScenarioId, DemoCTATarget> = {
  'upload-network': 'upload-zone',
  'upload-format': 'upload-zone',
  'pref-save': 'audience-checkbox',
  'voice-preview': 'voice-preview',
  'ai-quota': 'generate-button',
  'autosave-fail': null, // Auto-triggered, no CTA
  'add-test-fail': 'add-test-button',
  'max-questions': 'add-question-button',
  'save-fail': 'save-button',
  'version-conflict': 'publish-button',
  'audio-fail': 'play-button',
  'publish-fail': 'publish-button',
};

const getHighlightedCTA = useCallback((): DemoCTATarget => {
  if (!isActive) return null;
  const scenario = scenarios[currentCheckpoint];
  return scenario ? CTA_MAP[scenario.id] : null;
}, [isActive, scenarios, currentCheckpoint]);
```

### CSS Animation

```css
/* src/index.css */
.demo-highlight {
  @apply ring-2 ring-primary ring-offset-2 ring-offset-background;
  animation: demo-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes demo-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 hsl(var(--primary) / 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px hsl(var(--primary) / 0);
  }
}
```

### Example Component Update (WizardConfirmStep.tsx)

```typescript
// Import
import { useDemoMode } from '@/contexts/DemoModeContext';
import { cn } from '@/lib/utils';

// Inside component
const { isActive: isDemoMode, getHighlightedCTA } = useDemoMode();
const highlightTarget = isDemoMode ? getHighlightedCTA() : null;

// On Generate button
<Button 
  onClick={handleContinue} 
  disabled={isGenerating} 
  size="lg" 
  className={cn(
    "rounded-xl px-8 gap-2",
    highlightTarget === 'generate-button' && "demo-highlight"
  )}
>
  Generate Talk Points
</Button>

// On Preview button (voice cards)
<Button 
  variant="outline" 
  size="sm" 
  className={cn(
    "w-full rounded-lg gap-2",
    highlightTarget === 'voice-preview' && "demo-highlight"
  )}
>
  Preview
</Button>
```

---

## Visual Result

The highlighted CTA will have:
- A visible ring around the button using the primary color
- A gentle pulsing animation to draw attention
- Automatic transition to the next CTA when the scenario advances

This creates a clear visual guide through the demo without affecting normal course creation.
