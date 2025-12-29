/**
 * Document API Hooks
 *
 * React Query hooks for document upload and processing.
 * Handles PPTX file upload and Docling extraction.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { courseKeys } from './useCourses';
import { slideKeys } from './useSlides';

// Types
export interface UploadDocumentResponse {
  courseId: string;
  documentId: string;
  jobId: string;
  fileName: string;
  slideCount: number;
}

export interface ProcessingJob {
  id: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  result?: unknown;
  error?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

/**
 * Upload a PPTX document to create a course
 */
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      title,
      description,
      voiceId,
    }: {
      file: File;
      title?: string;
      description?: string;
      voiceId?: string;
    }) => {
      const formData = new FormData();
      formData.append('file', file);
      if (title) formData.append('title', title);
      if (description) formData.append('description', description);
      if (voiceId) formData.append('voiceId', voiceId);

      return api.upload<UploadDocumentResponse>('/api/documents', formData);
    },
    onSuccess: () => {
      // Invalidate course list to show new course
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}

/**
 * Poll job status for document processing
 */
export function useJobStatus(jobId: string | undefined, options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.get<ProcessingJob>(`/api/jobs/${jobId}`),
    onSuccess: (job) => {
      if (job.status === 'completed') {
        // Refetch courses and slides when processing completes
        queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
        queryClient.invalidateQueries({ queryKey: slideKeys.lists() });
      }
    },
  });
}

/**
 * Hook for polling job status with interval
 */
export function usePollJobStatus(
  jobId: string | undefined,
  options: {
    onComplete?: (job: ProcessingJob) => void;
    onError?: (error: Error) => void;
    pollInterval?: number;
  } = {}
) {
  const { onComplete, onError, pollInterval = 2000 } = options;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!jobId) throw new Error('No job ID provided');

      return new Promise<ProcessingJob>((resolve, reject) => {
        const poll = async () => {
          try {
            const job = await api.get<ProcessingJob>(`/api/jobs/${jobId}`);

            if (job.status === 'completed') {
              resolve(job);
            } else if (job.status === 'failed') {
              reject(new Error(job.error || 'Job failed'));
            } else {
              // Continue polling
              setTimeout(poll, pollInterval);
            }
          } catch (error) {
            reject(error);
          }
        };

        poll();
      });
    },
    onSuccess: (job) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: slideKeys.lists() });
      onComplete?.(job);
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });
}
