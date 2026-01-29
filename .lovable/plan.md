
# Error Handling Demo Course - Experiential Redesign

## Vision

Create an **immersive guided experience** where users walk through the actual course creation workflow and encounter scripted error scenarios at each stage. Instead of clicking isolated "trigger error" buttons, users perform real actions (upload, add test, save) that intentionally fail, teaching them error handling patterns in context.

---

## User Journey Flow

```text
Dashboard
    │
    ├── Click "Error Handling Demo" course card
    │
    ▼
Demo Intro Modal
    │  "Welcome! You'll experience error handling
    │   patterns by creating a demo course.
    │   Errors are intentional - observe how the
    │   app handles each failure."
    │
    ▼
Stage 1: UPLOAD (3 error scenarios)
    │
    ├─→ [Error 1] Upload slide file → "Network Error"
    │   Shows: Progress bar fails, inline error, retry button
    │
    ├─→ [Error 2] Upload wrong format → "Unsupported Format"
    │   Shows: Toast notification with file requirements
    │
    ├─→ [Success] Upload valid file
    │
    ├─→ [Error 3] Title validation → "Title is required"
    │   Shows: Inline red error under input
    │
    ├─→ [Success] Enter title and continue
    │
    ▼
Stage 2: WIZARD (2 error scenarios)
    │
    ├─→ [Error 4] Toggle audience → "Preference save failed"
    │   Shows: Warning toast, preferences still toggle locally
    │
    ├─→ Continue to voice settings
    │
    ▼
Stage 3: VOICE SETTINGS (2 error scenarios)
    │
    ├─→ [Error 5] Preview voice → "Voice unavailable"
    │   Shows: Toast, button shows "Unavailable" state
    │
    ├─→ [Error 6] Generate talk points → "AI quota exceeded"
    │   Shows: Destructive toast, suggestion to retry later
    │
    ├─→ [Success] Retry and proceed
    │
    ▼
Stage 4: SCRIPTING (5 error scenarios)
    │
    ├─→ [Error 7] Auto-save triggers → "Auto-save interrupted"
    │   Shows: Warning toast, "unsaved" badge pulses
    │
    ├─→ [Error 8] Add assessment → "Unable to add test"
    │   Shows: Toast + inline error at insertion point
    │
    ├─→ [Error 9] Add question → "Maximum questions reached"
    │   Shows: Warning toast (limit simulation)
    │
    ├─→ [Error 10] Save manually → "Save failed"
    │   Shows: Destructive toast with retry
    │
    ├─→ [Error 11] Publish → "Version conflict (409)"
    │   Shows: Warning dialog about concurrent edit
    │
    ▼
Stage 5: PREVIEW (2 error scenarios)
    │
    ├─→ [Error 12] Play audio → "Audio playback failed"
    │   Shows: Inline error with retry
    │
    ├─→ [Error 13] Final publish → "Server error (500)"
    │   Shows: Full-page error fallback demo
    │
    ▼
Demo Complete Modal
    │  "You've experienced 13 error handling patterns!
    │   Summary of what you learned..."
    │
    ▼
Return to Dashboard
```

---

## Implementation Approach

### 1. Demo Mode Context

Create a `DemoModeContext` that tracks:
- Whether demo mode is active
- Current demo step/checkpoint
- Which errors should trigger next
- Guidance messages for each step

```typescript
interface DemoModeState {
  isActive: boolean;
  currentCheckpoint: number;
  errorQueue: DemoError[];
  guidanceMessage: string | null;
  completedScenarios: string[];
}
```

### 2. Error Injection Points

Wrap existing action handlers to check if demo mode is active and inject failures:

**UploadStep.tsx**
```typescript
const handleFileDrop = async (files: FileList) => {
  if (demoMode.shouldTriggerError('upload-network')) {
    await simulateDelay(1500);
    showNetworkError();
    setUploadError("Network error during upload");
    return;
  }
  // Normal upload logic...
};
```

**ScriptingStep.tsx**
```typescript
const handleAddAssessment = () => {
  if (demoMode.shouldTriggerError('add-test')) {
    showErrorToast("Unable to add test");
    setInlineError("Server rejected the request");
    return;
  }
  // Normal add logic...
};
```

### 3. Guidance Overlay Component

A floating panel that appears during demo mode showing:
- Current scenario name
- What error to expect
- What UI pattern to observe
- "Next Step" instructions

```text
┌─────────────────────────────────────┐
│ 🎓 Demo Step 3/13                   │
│                                     │
│ SCENARIO: Upload Network Failure    │
│                                     │
│ TRY THIS: Drag a file to the        │
│ upload area. The upload will fail.  │
│                                     │
│ OBSERVE: Progress bar, inline       │
│ error message, and retry button.    │
│                                     │
│ [Skip] [Continue when ready]        │
└─────────────────────────────────────┘
```

### 4. Error Scenarios Catalog

| ID | Stage | Trigger | Error Type | UI Pattern |
|----|-------|---------|------------|------------|
| upload-network | Upload | Drop file | Network | Progress fail + Inline + Retry |
| upload-format | Upload | Drop .exe | Validation | Toast |
| upload-size | Upload | Drop 100MB | Validation | Toast |
| title-required | Upload | Empty title + Continue | Validation | Inline under input |
| pref-save | Wizard | Toggle audience | Network | Warning toast |
| voice-preview | Voice | Click Preview | Network | Toast + disabled state |
| ai-quota | Voice | Generate talk points | Server | Destructive toast |
| autosave-fail | Scripting | After 5s | Network | Warning toast |
| add-test-fail | Scripting | Click + button | Server | Toast + Inline |
| max-questions | Scripting | Add 11th question | Limit | Warning toast |
| save-fail | Scripting | Click Save | Server | Destructive toast |
| version-conflict | Scripting | Click Publish | Conflict | Warning dialog |
| audio-fail | Preview | Click Play | Network | Inline error |

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/contexts/DemoModeContext.tsx` | Demo mode state management |
| `src/components/demo/DemoGuidancePanel.tsx` | Floating guidance overlay |
| `src/components/demo/DemoIntroModal.tsx` | Welcome modal explaining the experience |
| `src/components/demo/DemoCompleteModal.tsx` | Summary modal at the end |
| `src/hooks/use-demo-error.ts` | Hook for injecting errors based on demo state |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/create/UploadStep.tsx` | Add demo error injection points |
| `src/pages/create/WizardStep.tsx` | Add demo error injection for preferences |
| `src/pages/create/WizardConfirmStep.tsx` | Add demo errors for voice/AI |
| `src/pages/create/ScriptingStep.tsx` | Add demo errors for add/save/publish |
| `src/pages/create/PreviewStep.tsx` | Add demo errors for playback/publish |
| `src/pages/CreateCourse.tsx` | Wrap with DemoModeProvider |
| `src/contexts/CourseContext.tsx` | Update demo course to trigger demo mode |

---

## Demo Entry Point

The "Error Handling Patterns" course on Dashboard will:
1. Instead of opening in preview mode, open with `?mode=demo`
2. Show the intro modal explaining the experience
3. Start the user at Upload step with demo mode active
4. Guide them through all 13 error scenarios
5. Show completion modal with summary

---

## Technical Considerations

1. **Non-Destructive**: Demo mode is entirely separate from normal course creation - no real data is affected
2. **Skippable**: Users can skip any scenario or exit demo mode at any time
3. **Progress Tracking**: LocalStorage saves completed scenarios for return visits
4. **Replayable**: Users can restart the demo from the beginning
5. **Educational**: Each error shows both the UI and explains the pattern being demonstrated

---

## Summary

This redesign transforms the "Error Handling Patterns" course from a static presentation into an **interactive learning experience** where users encounter real error UIs in the context of the actual course creation workflow. They'll learn:

- How upload failures appear and recover
- How validation errors display inline vs. toast
- How save/publish failures are communicated
- How network errors trigger retry mechanisms
- How version conflicts are resolved

The demo mode infrastructure can also be reused for onboarding new users to the platform.
