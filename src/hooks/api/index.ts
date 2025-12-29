/**
 * API Hooks
 *
 * Centralized exports for all React Query API hooks.
 * Import from this file for clean imports:
 *
 * import { useCourses, useSlides, useVoices } from '@/hooks/api';
 */

// Course hooks
export {
  useCourses,
  useCourse,
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
  usePublishCourse,
  courseKeys,
} from './useCourses';

export type {
  Course,
  CourseStatus,
  CreateCourseRequest,
  UpdateCourseRequest,
  PublishCourseResponse,
} from './useCourses';

// Slide hooks
export {
  useSlides,
  useUpdateScript,
  useGenerateScript,
  useRefineScript,
  useGenerateAllScripts,
  slideKeys,
  scriptKeys,
} from './useSlides';

export type {
  Slide,
  GenerateScriptResponse,
  RefineScriptResponse,
} from './useSlides';

// Document hooks
export {
  useUploadDocument,
  useJobStatus,
  usePollJobStatus,
} from './useDocuments';

export type {
  UploadDocumentResponse,
  ProcessingJob,
} from './useDocuments';

// Audio hooks
export {
  useVoices,
  useGenerateAudio,
  useAudioJobStatus,
  useGenerateAllAudio,
  voiceKeys,
  audioKeys,
} from './useAudio';

export type {
  Voice,
  GenerateAudioRequest,
  GenerateAudioResponse,
  AudioJobStatus,
} from './useAudio';
