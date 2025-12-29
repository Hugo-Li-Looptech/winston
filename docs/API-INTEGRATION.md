# Winston API Integration

This document describes how the frontend integrates with the Winston backend API.

## Overview

The frontend uses React Query (TanStack Query) to manage server state and communicate with the Winston REST API. All API calls include graceful fallback to local state when the backend is unavailable.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  React Components (Dashboard, Wizard Steps, etc.)       │
├─────────────────────────────────────────────────────────┤
│  React Query Hooks (useCourses, useSlides, etc.)        │
├─────────────────────────────────────────────────────────┤
│  API Client (src/lib/api-client.ts)                     │
├─────────────────────────────────────────────────────────┤
│  Winston REST API (TanStack Start)                      │
└─────────────────────────────────────────────────────────┘
```

## Configuration

### Environment Variables

Copy `.env.example` to `.env.local`:

```bash
# Winston Backend API URL
VITE_WINSTON_API_URL=http://localhost:3000

# Enable debug logging for API calls
VITE_API_DEBUG=false
```

## API Client

Location: `src/lib/api-client.ts`

The API client provides typed methods for HTTP requests:

```typescript
import { api } from '@/lib/api-client';

// GET request
const courses = await api.get<Course[]>('/api/courses');

// POST request
const newCourse = await api.post<Course>('/api/courses', { title: 'New Course' });

// PUT request
const updated = await api.put<Course>('/api/courses/123', { title: 'Updated' });

// DELETE request
await api.delete('/api/courses/123');

// File upload
const result = await api.upload<UploadResponse>('/api/documents', formData);
```

## React Query Hooks

### Courses (`src/hooks/api/useCourses.ts`)

```typescript
// List all courses
const { data: courses, isLoading, error } = useCourses();

// Get single course
const { data: course } = useCourse(courseId);

// Create course
const createMutation = useCreateCourse();
await createMutation.mutateAsync({ title: 'New Course' });

// Update course
const updateMutation = useUpdateCourse();
await updateMutation.mutateAsync({ id: '123', title: 'Updated' });

// Delete course
const deleteMutation = useDeleteCourse();
await deleteMutation.mutateAsync('123');

// Publish course
const publishMutation = usePublishCourse();
await publishMutation.mutateAsync({ courseId: '123', publish: true });
```

### Slides & Scripts (`src/hooks/api/useSlides.ts`)

```typescript
// Get slides for a course
const { data: slides } = useCourseSlides(courseId);

// Get single slide
const { data: slide } = useSlide(slideId);

// Generate AI script
const generateMutation = useGenerateScript();
await generateMutation.mutateAsync(slideId);

// Refine script with instructions
const refineMutation = useRefineScript();
await refineMutation.mutateAsync({
  slideId,
  instructions: 'Make it more concise'
});

// Update script manually
const updateMutation = useUpdateScript();
await updateMutation.mutateAsync({ slideId, content: 'New script...' });
```

### Documents (`src/hooks/api/useDocuments.ts`)

```typescript
// Upload PPTX file
const uploadMutation = useUploadDocument();
const { jobId } = await uploadMutation.mutateAsync({
  file: pptxFile,
  title: 'My Presentation'
});

// Poll job status
const { data: jobStatus } = usePollJobStatus(jobId, {
  enabled: !!jobId,
  refetchInterval: 2000, // Poll every 2 seconds
});
```

### Audio & Voices (`src/hooks/api/useAudio.ts`)

```typescript
// Get available voices
const { data: voices, isLoading } = useVoices();

// Generate audio for slide
const generateMutation = useGenerateAudio();
await generateMutation.mutateAsync({
  slideId,
  voiceId: 'professional-female-us'
});

// Check audio generation status
const { data: status } = useAudioJobStatus(jobId);
```

## Type Mapping

Location: `src/lib/course-mapper.ts`

Transforms between API types and local frontend types:

```typescript
import { apiCourseToLocal, localCourseToApi } from '@/lib/course-mapper';

// API → Local
const localCourse = apiCourseToLocal(apiCourse);

// Local → API
const apiCourse = localCourseToApi(localCourse);
```

## Component Integration

### Dashboard

Uses `useCourses`, `useDeleteCourse`, `usePublishCourse`:
- Displays merged list of API + local courses
- Shows loading/error states with retry
- Handles delete and publish actions

### UploadStep

Uses `useUploadDocument`, `usePollJobStatus`:
- Uploads PPTX via API with progress
- Polls job status until complete
- Shows processing/error/indexed states

### ScriptingStep

Uses `useGenerateScript`, `useRefineScript`, `useUpdateScript`:
- AI script generation via API
- Script refinement with instructions
- Manual script editing with save

### WizardConfirmStep

Uses `useVoices`:
- Fetches voice catalog from API
- Audio preview playback
- Fallback to hardcoded voices if API unavailable

### PreviewStep

Uses `usePublishCourse`:
- Publishes course via API
- Fallback to local publish if API fails

## Error Handling

All hooks include:
1. **Try/catch** around API calls
2. **Fallback** to local state on failure
3. **Error state** exposed via `error` property
4. **Retry** via React Query's built-in retry logic

Example:
```typescript
const { data, error, isLoading, refetch } = useCourses();

if (error) {
  return (
    <div>
      <p>Failed to load courses</p>
      <button onClick={() => refetch()}>Retry</button>
    </div>
  );
}
```

## Query Keys

Structured query keys for cache management:

```typescript
// Course keys
courseKeys.all           // ['courses']
courseKeys.lists()       // ['courses', 'list']
courseKeys.detail(id)    // ['courses', 'detail', id]

// Slide keys
slideKeys.all            // ['slides']
slideKeys.byCourse(id)   // ['slides', 'course', id]
slideKeys.detail(id)     // ['slides', 'detail', id]

// Voice keys
voiceKeys.all           // ['voices']
voiceKeys.list()        // ['voices', 'list']
```

## Related Documents

- [Winston API Routes](../../apps/web/src/routes/api/README.md)
- [React Query Documentation](https://tanstack.com/query/latest)
