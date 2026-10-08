import type { AxiosError } from 'axios';

interface ApiErrorBody {
  message?: string;
  errors?: unknown[];
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  const err = error as AxiosError<ApiErrorBody>;
  const body = err?.response?.data;
  if (Array.isArray(body?.errors) && body.errors.length > 0) {
    return body.errors.map((e) => String(e)).join(' ');
  }
  if (body?.message) return body.message;
  if (err?.message === 'Network Error') return 'Cannot reach the server. Is the backend running?';
  return fallback;
}
