import { API_BASE } from '../services/api';

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Only JPEG, PNG, WebP, GIF, or SVG images are allowed.';
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return 'Image must be 5 MB or smaller.';
  }
  return null;
}

function apiOrigin(): string {
  try {
    return new URL(API_BASE, window.location.origin).origin;
  } catch {
    return '';
  }
}

export function resolveMediaUrl(value?: string | null): string | undefined {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  const origin = apiOrigin();
  if (!origin) return value;
  return `${origin}${value.startsWith('/') ? value : `/${value}`}`;
}
