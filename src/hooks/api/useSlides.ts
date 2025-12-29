/**
 * Slide API Hooks
 *
 * React Query hooks for slide and script operations.
 * Replaces mock slide data in CourseContext with real API calls.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { courseKeys } from './useCourses';

// Types (mirroring @winston/shared-types)
export interface Slide {
  id: string;
  courseId: string;
  slideIndex: number;
  imageUrl: string;
  script?: string;
  audioUrl?: string;
  audioDuration?: number;
  speakerNotes?: string;
  title?: string;
  description?: string;
}

export interface GenerateScriptResponse {
  slideId: string;
  script: string;
  tokensUsed: number;
}

export interface RefineScriptResponse {
  slideId: string;
  script: string;
  tokensUsed: number;
}

// Query keys for cache management
export const slideKeys = {
  all: ['slides'] as const,
  lists: () => [...slideKeys.all, 'list'] as const,
  list: (courseId: string) => [...slideKeys.lists(), courseId] as const,
  details: () => [...slideKeys.all, 'detail'] as const,
  detail: (slideId: string) => [...slideKeys.details(), slideId] as const,
};

export const scriptKeys = {
  all: ['scripts'] as const,
  detail: (slideId: string) => [...scriptKeys.all, slideId] as const,
};

/**
 * Fetch all slides for a course
 */
export function useSlides(courseId: string | undefined) {
  return useQuery({
    queryKey: slideKeys.list(courseId ?? ''),
    queryFn: () => api.get<Slide[]>(`/api/courses/${courseId}/slides`),
    enabled: !!courseId,
  });
}

/**
 * Update a slide script manually
 */
export function useUpdateScript() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slideId, content }: { slideId: string; content: string }) =>
      api.post<Slide>(`/api/scripts/${slideId}`, { content }),
    onSuccess: (updatedSlide) => {
      // Update the slide in cache
      queryClient.setQueryData(slideKeys.detail(updatedSlide.id), updatedSlide);
      // Invalidate slides list for the course
      queryClient.invalidateQueries({ queryKey: slideKeys.list(updatedSlide.courseId) });
    },
  });
}

/**
 * Generate a script for a slide using AI
 */
export function useGenerateScript() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slideId: string) =>
      api.post<GenerateScriptResponse>(`/api/scripts/${slideId}/generate`),
    onSuccess: (response) => {
      // Invalidate slide queries to refetch with new script
      queryClient.invalidateQueries({ queryKey: slideKeys.details() });
      // Also invalidate parent course slides list
      queryClient.invalidateQueries({ queryKey: slideKeys.lists() });
    },
  });
}

/**
 * Refine a script with user feedback
 */
export function useRefineScript() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slideId, feedback, currentScript }: {
      slideId: string;
      feedback: string;
      currentScript: string;
    }) =>
      api.post<RefineScriptResponse>(`/api/scripts/${slideId}/refine`, {
        feedback,
        currentScript
      }),
    onSuccess: (response) => {
      // Invalidate slide queries to refetch with refined script
      queryClient.invalidateQueries({ queryKey: slideKeys.details() });
      queryClient.invalidateQueries({ queryKey: slideKeys.lists() });
    },
  });
}

/**
 * Batch generate scripts for all slides in a course
 */
export function useGenerateAllScripts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      // First get all slides
      const slides = await api.get<Slide[]>(`/api/courses/${courseId}/slides`);

      // Generate scripts for slides without scripts
      const slidesWithoutScripts = slides.filter(s => !s.script);

      const results = await Promise.allSettled(
        slidesWithoutScripts.map(slide =>
          api.post<GenerateScriptResponse>(`/api/scripts/${slide.id}/generate`)
        )
      );

      return {
        total: slidesWithoutScripts.length,
        successful: results.filter(r => r.status === 'fulfilled').length,
        failed: results.filter(r => r.status === 'rejected').length,
      };
    },
    onSuccess: (_data, courseId) => {
      // Invalidate all slide queries for this course
      queryClient.invalidateQueries({ queryKey: slideKeys.list(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
    },
  });
}
