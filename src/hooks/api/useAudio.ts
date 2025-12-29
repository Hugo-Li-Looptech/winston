/**
 * Audio API Hooks
 *
 * React Query hooks for TTS audio generation.
 * Handles voice selection, audio generation, and job status polling.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { slideKeys } from './useSlides';
import { courseKeys } from './useCourses';

// Types
export interface Voice {
  id: string;
  name: string;
  provider: 'elevenlabs' | 'azure';
  language: string;
  gender?: 'male' | 'female' | 'neutral';
  previewUrl?: string;
  description?: string;
}

export interface GenerateAudioRequest {
  slideId: string;
  script: string;
  voiceId: string;
}

export interface GenerateAudioResponse {
  jobId: string;
  slideId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export interface AudioJobStatus {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  audioUrl?: string;
  audioDuration?: number;
  error?: string;
}

// Query keys
export const voiceKeys = {
  all: ['voices'] as const,
  list: () => [...voiceKeys.all, 'list'] as const,
};

export const audioKeys = {
  all: ['audio'] as const,
  job: (jobId: string) => [...audioKeys.all, 'job', jobId] as const,
};

/**
 * Fetch available TTS voices
 */
export function useVoices() {
  return useQuery({
    queryKey: voiceKeys.list(),
    queryFn: () => api.get<Voice[]>('/api/voices'),
    staleTime: 10 * 60 * 1000, // Voices rarely change, cache for 10 minutes
  });
}

/**
 * Generate audio for a slide
 */
export function useGenerateAudio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateAudioRequest) =>
      api.post<GenerateAudioResponse>('/api/audio', data),
    onSuccess: () => {
      // Audio generation is async, we'll poll for status separately
    },
  });
}

/**
 * Get audio generation job status
 */
export function useAudioJobStatus(jobId: string | undefined) {
  return useQuery({
    queryKey: audioKeys.job(jobId ?? ''),
    queryFn: () => api.get<AudioJobStatus>(`/api/audio/${jobId}/status`),
    enabled: !!jobId,
    refetchInterval: (query) => {
      // Auto-poll while job is pending or running
      const status = query.state.data?.status;
      if (status === 'pending' || status === 'running') {
        return 2000; // Poll every 2 seconds
      }
      return false; // Stop polling when complete or failed
    },
  });
}

/**
 * Generate audio for all slides in a course
 */
export function useGenerateAllAudio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      voiceId,
      slides,
    }: {
      courseId: string;
      voiceId: string;
      slides: Array<{ id: string; script?: string }>;
    }) => {
      // Filter slides with scripts that need audio
      const slidesWithScripts = slides.filter(s => s.script);

      const results = await Promise.allSettled(
        slidesWithScripts.map(slide =>
          api.post<GenerateAudioResponse>('/api/audio', {
            slideId: slide.id,
            script: slide.script,
            voiceId,
          })
        )
      );

      const jobIds = results
        .filter((r): r is PromiseFulfilledResult<GenerateAudioResponse> => r.status === 'fulfilled')
        .map(r => r.value.jobId);

      return {
        total: slidesWithScripts.length,
        jobIds,
        successful: jobIds.length,
        failed: results.filter(r => r.status === 'rejected').length,
      };
    },
    onSuccess: (_data, { courseId }) => {
      // Invalidate course and slides to reflect processing status
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
      queryClient.invalidateQueries({ queryKey: slideKeys.list(courseId) });
    },
  });
}
