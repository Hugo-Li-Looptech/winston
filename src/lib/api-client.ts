/**
 * Winston API Client
 *
 * Fetch-based API client for communicating with Winston backend.
 * Handles response unwrapping, error handling, and auth headers.
 */

const API_URL = import.meta.env.VITE_WINSTON_API_URL || 'http://localhost:3000';

interface ApiResponse<T> {
  data: T | null;
  success: boolean;
  error?: string;
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  // Build URL with query params
  let url = `${API_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  // Default headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  // Don't set Content-Type for FormData (let browser set boundary)
  if (fetchOptions.body instanceof FormData) {
    delete (headers as Record<string, string>)['Content-Type'];
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: 'include', // Include cookies for session auth
  });

  // Handle non-JSON responses
  const contentType = response.headers.get('Content-Type');
  if (!contentType?.includes('application/json')) {
    if (!response.ok) {
      throw new ApiError(
        `Request failed: ${response.statusText}`,
        response.status
      );
    }
    return {} as T;
  }

  const json: ApiResponse<T> = await response.json();

  if (!response.ok || !json.success) {
    throw new ApiError(
      json.error || `Request failed: ${response.statusText}`,
      response.status
    );
  }

  return json.data as T;
}

export const api = {
  get: <T>(endpoint: string, params?: Record<string, string>) =>
    request<T>(endpoint, { method: 'GET', params }),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),

  // Special method for file uploads
  upload: <T>(endpoint: string, formData: FormData) =>
    request<T>(endpoint, {
      method: 'POST',
      body: formData,
    }),
};

export { ApiError };
export default api;
