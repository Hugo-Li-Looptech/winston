/**
 * Course Type Mapper
 *
 * Transforms API course data to local Course type format.
 * This bridges the gap between backend types and frontend UI types.
 */

import type { Course as LocalCourse, ProgressStep } from '@/types/course';
import type { Course as ApiCourse } from '@/hooks/api/useCourses';

/**
 * Map API course status to local status
 */
function mapStatus(apiStatus: ApiCourse['status']): LocalCourse['status'] {
  switch (apiStatus) {
    case 'published':
      return 'published';
    case 'draft':
    case 'archived':
      return 'pending';
    case 'processing':
    case 'ready':
      return 'in_progress';
    default:
      return 'pending';
  }
}

/**
 * Map API course to local progress step
 */
function mapProgress(apiCourse: ApiCourse): ProgressStep {
  switch (apiCourse.status) {
    case 'published':
      return '100%';
    case 'ready':
      return 'awaiting_preview';
    case 'processing':
      return 'wizard_complete';
    case 'draft':
      if (apiCourse.slideCount > 0) {
        return 'slides_uploaded';
      }
      return '0%';
    default:
      return '0%';
  }
}

/**
 * Format date from ISO string to display format
 */
function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Transform API course to local course format
 */
export function apiCourseToLocal(apiCourse: ApiCourse): LocalCourse {
  return {
    id: apiCourse.id,
    title: apiCourse.title,
    date: formatDate(apiCourse.updatedAt || apiCourse.createdAt),
    status: mapStatus(apiCourse.status),
    progress: mapProgress(apiCourse),
  };
}

/**
 * Transform array of API courses to local format
 */
export function apiCoursesToLocal(apiCourses: ApiCourse[]): LocalCourse[] {
  return apiCourses.map(apiCourseToLocal);
}

/**
 * Transform local course update to API format
 */
export function localToApiCourseUpdate(localCourse: Partial<LocalCourse>): {
  title?: string;
  status?: ApiCourse['status'];
} {
  const apiUpdate: { title?: string; status?: ApiCourse['status'] } = {};

  if (localCourse.title) {
    apiUpdate.title = localCourse.title;
  }

  if (localCourse.status) {
    switch (localCourse.status) {
      case 'published':
        apiUpdate.status = 'published';
        break;
      case 'pending':
        apiUpdate.status = 'draft';
        break;
      case 'in_progress':
        apiUpdate.status = 'processing';
        break;
    }
  }

  return apiUpdate;
}
