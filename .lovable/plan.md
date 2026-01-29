

# Enhanced Error Handling Demo Course

## Problem Statement

The current "Error Handling Patterns" demo course lacks:
1. **Interactive trigger elements** - Buttons and actions to simulate real failures
2. **Real-world error scenarios** - Specific errors like "upload failed", "unable to add tests", "save failed"
3. **Context-specific demos** - Errors that mirror actual app operations

## Solution Overview

Expand the error handling demo to include 8 slides with specific, real-world error scenarios that users would encounter in the course creation workflow.

---

## New Slide Structure

| Slide | Title | Error Scenarios |
|-------|-------|-----------------|
| 1 | Introduction | Overview of all error types |
| 2 | Error Boundaries | Component crash demo |
| 3 | File Upload Errors | Upload failed, unsupported format, file too large |
| 4 | Assessment Errors | Unable to add test, question save failed |
| 5 | Save & Publish Errors | Auto-save failed, publish failed, draft save failed |
| 6 | Network Errors | Connection lost, timeout, server unavailable |
| 7 | Validation Errors | Form validation, missing fields, invalid data |
| 8 | Retry Mechanisms | Recovery patterns with exponential backoff |

---

## New Interactive Components

### 1. Upload Error Demo
Simulates file upload failures with different error types:
- **"Upload Failed"** - Simulates network failure during upload
- **"Unsupported Format"** - Shows error for wrong file type
- **"File Too Large"** - Exceeds size limit error
- **"Upload Timeout"** - Connection timeout

Each button shows progress bar that fails, with inline error and retry option.

### 2. Assessment Error Demo
Simulates course assessment/test errors:
- **"Unable to Add Test"** - Server rejection when adding assessment
- **"Question Save Failed"** - Error saving individual question
- **"Maximum Questions Reached"** - Limit exceeded warning
- **"Invalid Question Format"** - Validation error on question data

### 3. Save & Publish Error Demo
Simulates course persistence failures:
- **"Auto-Save Failed"** - Background save interruption
- **"Publish Failed"** - Server error during publish
- **"Draft Save Failed"** - Unable to save progress
- **"Version Conflict"** - Concurrent edit warning

### 4. Comprehensive Network Error Demo
Enhanced network failure simulations:
- **"Connection Lost"** - Complete network failure
- **"Request Timeout"** - Slow server response
- **"Server Unavailable (503)"** - Service temporarily down
- **"Rate Limited (429)"** - Too many requests

---

## Implementation Details

### File: `src/components/demo/ErrorHandlingDemo.tsx`

Add new demo components:

```text
UploadErrorDemo
├── simulateUploadError(type: 'network' | 'format' | 'size' | 'timeout')
├── Progress bar with failure animation
├── InlineError with specific message
└── Retry button

AssessmentErrorDemo
├── simulateAddTestError()
├── simulateQuestionSaveError()
├── Toast notifications for each error type
└── InlineError with contextual messages

SavePublishErrorDemo
├── simulateAutoSaveError()
├── simulatePublishError()
├── Warning toasts for recoverable errors
└── Destructive toasts for failures

NetworkErrorDemo (enhanced)
├── simulateConnectionLost()
├── simulateTimeout()
├── simulateServerError(status: number)
└── Error toast with specific status codes
```

### File: `src/contexts/CourseContext.tsx`

Update `createErrorHandlingSlides()` to include 8 slides with new content.

---

## UI Design for Each Demo

### Upload Error Demo

```text
┌─────────────────────────────────────────────┐
│  📁 File Upload Error Simulation            │
├─────────────────────────────────────────────┤
│                                             │
│  [🔴 Upload Failed]  [📄 Wrong Format]      │
│                                             │
│  [📏 File Too Large] [⏱️ Upload Timeout]    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ ████████░░░░░░░░░░░░░  45%         │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ⚠️ Upload failed: Network error            │
│     [Retry Upload]                          │
│                                             │
└─────────────────────────────────────────────┘
```

### Assessment Error Demo

```text
┌─────────────────────────────────────────────┐
│  📝 Assessment Error Simulation             │
├─────────────────────────────────────────────┤
│                                             │
│  [➕ Add Test (Fails)]                      │
│  [💾 Save Question (Fails)]                 │
│  [🔢 Max Questions (Warning)]               │
│  [❌ Invalid Question (Validation)]         │
│                                             │
│  Toast: "Unable to add test. Please try     │
│          again or contact support."         │
│                                             │
└─────────────────────────────────────────────┘
```

### Save/Publish Error Demo

```text
┌─────────────────────────────────────────────┐
│  💾 Save & Publish Error Simulation         │
├─────────────────────────────────────────────┤
│                                             │
│  [⚡ Auto-Save Failed]  [🚀 Publish Failed] │
│                                             │
│  [📝 Draft Save Failed] [⚠️ Version Conflict]│
│                                             │
│  Simulates saving state with loading        │
│  spinner, then shows failure toast          │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Error Messages (User-Friendly)

| Scenario | Message |
|----------|---------|
| Upload Failed | "Unable to upload file. Please check your connection and try again." |
| Unsupported Format | "This file type is not supported. Please use PDF, PPTX, or DOCX." |
| File Too Large | "File exceeds the 50MB limit. Please compress or split your file." |
| Unable to Add Test | "Couldn't add the assessment. Please try again in a moment." |
| Question Save Failed | "Unable to save this question. Your changes may not be preserved." |
| Auto-Save Failed | "Auto-save interrupted. Click 'Save' manually to preserve your work." |
| Publish Failed | "Publishing failed due to a server error. Please try again." |
| Connection Lost | "You appear to be offline. Reconnect to continue." |
| Timeout | "The request took too long. Please try again." |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/demo/ErrorHandlingDemo.tsx` | Add UploadErrorDemo, AssessmentErrorDemo, SavePublishErrorDemo, enhance NetworkErrorDemo |
| `src/contexts/CourseContext.tsx` | Update createErrorHandlingSlides() with 8 slides |

---

## Technical Approach

All demo components will:
1. Use simulated delays (1-2 seconds) to feel realistic
2. Show loading states before failures
3. Use existing error components (InlineError, ErrorToast, ErrorBoundary)
4. Log errors via useErrorLogger hook
5. Provide retry functionality where appropriate
6. Be fully accessible with ARIA labels

This approach extends the existing demo pattern without disrupting any production functionality - all error scenarios are simulated within the demo course.

