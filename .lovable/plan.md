
# Fix Audio Playback Error Display (Step 11)

## Problem

When the user clicks the Play button during Demo Mode Step 11, the error trigger correctly sets `audioError` state, but **no UI element exists to display this error**. The `InlineError` component is imported but never rendered with the `audioError` message.

## Root Cause Analysis

In `src/pages/create/PreviewStep.tsx`:
- Line 74: `const [audioError, setAudioError] = useState<string | null>(null);`
- Line 207: `triggerAudioPlaybackError(setAudioError)` correctly sets the error
- **Missing**: No `{audioError && <InlineError ... />}` anywhere in the JSX

## Solution

Add an `InlineError` component below the floating control pill (lines 318-359) to display the audio error with a retry option.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/create/PreviewStep.tsx` | Add `InlineError` display for `audioError` below the play controls |

---

## Implementation Details

### PreviewStep.tsx Changes

After the floating control pill div (around line 358-359), add:

```tsx
{/* Audio Error Display */}
{audioError && (
  <div className="mt-2">
    <InlineError
      message={audioError}
      onRetry={() => {
        setAudioError(null);
        setDemoPlayAttempt(0);
      }}
    />
  </div>
)}
```

This will:
1. Display the error message below the play controls when `audioError` is set
2. Provide a retry button that clears the error and resets the demo attempt counter
3. Match the expected pattern described in the demo scenario: "Inline error with retry option"

---

## Existing Scenarios Verification

| Scenario | Status | Location |
|----------|--------|----------|
| Connection Error (upload-network) | Already exists | Step 1 - UploadStep.tsx |
| Version Conflict (version-conflict) | Already exists | Step 10 - ScriptingStep.tsx AlertDialog |
| Audio Playback Error (audio-fail) | **NEEDS FIX** | Step 11 - PreviewStep.tsx |

The connection error and version conflict scenarios are already properly implemented. Only the audio playback error needs the UI fix.

---

## Expected Behavior After Fix

1. User navigates to Step 11 (Preview stage)
2. The Play button is highlighted with the demo-highlight ring
3. User clicks the Play button
4. After 500ms delay, an inline error appears below the controls: "Audio playback failed. Please try again."
5. User can click the retry button to dismiss the error
6. Demo advances to Step 12
