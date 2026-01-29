

# Fix: Load Course Data When Editing Existing Courses

## Problem Summary

The "Error Handling Patterns" course shows PBJ sandwich slides because when navigating to `/create?mode=edit&step=preview&courseId=proxy-error-handling`, the application:

1. Reads the `courseId` from URL params correctly
2. BUT never loads the course's actual data into the context state
3. The context retains its default initialization with `defaultSlides` (PBJ content)

The error handling slides **do exist** in the version snapshot (in `createErrorHandlingSlides()`), but `restoreVersion()` is never called to load them.

---

## Solution

Add a `useEffect` hook in `CreateCourse.tsx` that:
1. Reads the `courseId` from URL search params
2. Looks up the current version ID for that course
3. Calls `restoreVersion()` to load the course data into context state

---

## Implementation Details

### File to Modify: `src/pages/CreateCourse.tsx`

**Changes:**

1. Import `restoreVersion` and `getCurrentVersionId` from `useCourse()`
2. Add a `useEffect` that triggers when `courseId` changes (edit/preview mode)
3. Call `restoreVersion(courseId, versionId)` to load the correct slides

**Code Addition (after line 36):**

```typescript
export default function CreateCourse() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { 
    currentCourse, 
    completedSteps, 
    restoreVersion,           // Add this
    getCurrentVersionId       // Add this
  } = useCourse();
  
  const mode = searchParams.get('mode');
  const stepParam = searchParams.get('step');
  const courseId = searchParams.get('courseId');  // Add this
  const isPreviewOnly = mode === 'preview';
  const isEditMode = mode === 'edit';

  // NEW: Load course data when editing an existing course
  useEffect(() => {
    if (courseId && (isEditMode || isPreviewOnly)) {
      const versionId = getCurrentVersionId(courseId);
      if (versionId) {
        restoreVersion(courseId, versionId);
      }
    }
  }, [courseId, isEditMode, isPreviewOnly, getCurrentVersionId, restoreVersion]);
  
  // ... rest of component
```

---

## Why This Works

- `getCurrentVersionId('proxy-error-handling')` returns `'version-error-v1'` (set in `createInitialVersionIdsMap`)
- `restoreVersion('proxy-error-handling', 'version-error-v1')` loads the snapshot which contains `createErrorHandlingSlides()` data
- The slides, courseItems, title, and description are all updated in context state
- PreviewStep then renders the correct error handling content

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/CreateCourse.tsx` | Add courseId param reading, import restoreVersion/getCurrentVersionId, add useEffect to load course data |

---

## Technical Notes

- This fix also benefits all other proxy courses (ML, React, UI/UX) - they will now properly load their versioned content
- The useEffect runs once per navigation, preventing unnecessary re-renders
- If no courseId is provided (new course creation flow), the effect does nothing

