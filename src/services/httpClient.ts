import { API_BASE_URL, API_TIMEOUT_MS } from '../config/api';

export type ApiErrorBody = {
  message?: string;
  error?: string;
  [key: string]: unknown;
};

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody | string | null;

  constructor(message: string, status: number, body: ApiErrorBody | string | null = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

type UnauthorizedListener = () => void;

const unauthorizedListeners = new Set<UnauthorizedListener>();

export function subscribeUnauthorized(listener: UnauthorizedListener) {
  unauthorizedListeners.add(listener);
  return () => {
    unauthorizedListeners.delete(listener);
  };
}

function emitUnauthorized() {
  unauthorizedListeners.forEach((listener) => listener());
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  suppressUnauthorizedEvent?: boolean;
  timeoutMs?: number;
};

function buildUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

async function parseBody(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';

  if (response.status === 204) {
    return null;
  }

  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text.length > 0 ? text : null;
}

function normalizeErrorMessage(status: number, body: ApiErrorBody | string | null) {
  if (typeof body === 'string' && body.trim()) {
    return body;
  }

  if (body && typeof body === 'object') {
    const message = body.message ?? body.error;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  if (status === 401) {
    return 'Unauthorized';
  }

  return `Request failed with status ${status}`;
}

export function isUnauthorizedError(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? API_TIMEOUT_MS);
  const headers = new Headers(options.headers);
  const body = options.body;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  if (!isFormData && body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  try {
    const response = await fetch(buildUrl(path), {
      ...options,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
      credentials: 'include',
      headers,
      signal: controller.signal,
    });
    const responseBody = await parseBody(response);

    if (!response.ok) {
      if (response.status === 401 && !options.suppressUnauthorizedEvent) {
        emitUnauthorized();
      }

      throw new ApiError(normalizeErrorMessage(response.status, responseBody), response.status, responseBody);
    }

    return responseBody as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timed out', 0);
    }

    throw new ApiError(error instanceof Error ? error.message : 'Network request failed', 0);
  } finally {
    clearTimeout(timeout);
  }
}

export const httpClient = {
  delete: <T>(path: string, options?: RequestOptions) => apiRequest<T>(path, { ...options, method: 'DELETE' }),
  get: <T>(path: string, options?: RequestOptions) => apiRequest<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, body, method: 'POST' }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, body, method: 'PUT' }),
};
