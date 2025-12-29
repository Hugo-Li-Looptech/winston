/**
 * Course API Hooks
 *
 * React Query hooks for course CRUD operations.
 * Replaces mock data in CourseContext with real API calls.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api-client';

// Types (mirroring @winston/shared-types)
export type CourseStatus = 'draft' | 'processing' | 'ready' | 'published' | 'archived';

export interface Course {
  id: string;
  title: string;
  description?: string;
  ownerId: string;
  voiceId?: string;
  status: CourseStatus;
  slideCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  totalDuration?: number;
  language?: string;
  coverImageUrl?: string;
}

export interface CreateCourseRequest {
  title: string;
  description?: string;
  voiceId?: string;
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  voiceId?: string;
  status?: CourseStatus;
}

export interface PublishCourseResponse {
  courseId: string;
  publishedAt: string;
  scormPackageUrl?: string;
}

// Query keys for cache management
export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (filters: Record<string, string>) => [...courseKeys.lists(), filters] as const,
  details: () => [...courseKeys.all, 'detail'] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,
};

/**
 * Fetch all courses
 */
export function useCourses() {
  return useQuery({
    queryKey: courseKeys.lists(),
    queryFn: () => api.get<Course[]>('/api/courses'),
  });
}

/**
 * Fetch a single course by ID
 */
export function useCourse(courseId: string | undefined) {
  return useQuery({
    queryKey: courseKeys.detail(courseId ?? ''),
    queryFn: () => api.get<Course>(`/api/courses/${courseId}`),
    enabled: !!courseId,
  });
}

/**
 * Create a new course
 */
export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCourseRequest) =>
      api.post<Course>('/api/courses', data),
    onSuccess: (newCourse) => {
      // Invalidate course list to refetch
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      // Optionally set the new course in cache
      queryClient.setQueryData(courseKeys.detail(newCourse.id), newCourse);
    },
  });
}

/**
 * Update an existing course
 */
export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string; data: UpdateCourseRequest }) =>
      api.put<Course>(`/api/courses/${courseId}`, data),
    onSuccess: (updatedCourse, { courseId }) => {
      // Update the course in cache
      queryClient.setQueryData(courseKeys.detail(courseId), updatedCourse);
      // Invalidate list to reflect changes
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}

/**
 * Delete a course
 */
export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) =>
      api.delete<void>(`/api/courses/${courseId}`),
    onSuccess: (_data, courseId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: courseKeys.detail(courseId) });
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}

/**
 * Publish a course
 */
export function usePublishCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, scormPackage = false }: { courseId: string; scormPackage?: boolean }) =>
      api.post<PublishCourseResponse>(`/api/courses/${courseId}/publish`, { scormPackage }),
    onSuccess: (_data, { courseId }) => {
      // Invalidate course to refetch with updated status
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}
