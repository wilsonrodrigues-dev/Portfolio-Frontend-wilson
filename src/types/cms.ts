export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface Project {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  featured: boolean;
  coverImage?: string;
  gallery: string[];
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  problem?: string;
  solution?: string;
  features: string[];
  architecture?: string;
  outcome?: string;
  order: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BlogStatus = 'draft' | 'published' | 'scheduled';

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  coverImage?: string;
  tags: string[];
  category: string;
  author: string;
  featured: boolean;
  status: BlogStatus;
  publishedAt?: string;
  scheduledFor?: string;
  seoTitle?: string;
  seoDescription?: string;
  readingTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface MediaItem {
  _id: string;
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  url: string;
  path: string;
  altText?: string;
  caption?: string;
  createdAt: string;
}

export interface Skill {
  _id: string;
  name: string;
  category: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  icon?: string;
  order: number;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
}

export type Resource<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: T };

export type DetailResource<T> =
  | { status: 'loading' }
  | { status: 'notfound'; message: string; slug: string }
  | { status: 'error'; message: string; slug: string }
  | { status: 'ready'; data: T; slug: string };

export interface About {
  _id?: string;
  name: string;
  headline: string;
  subheadline?: string;
  bio: string;
  longBio?: string;
  location?: string;
  email?: string;
  phone?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  resumeUrl?: string;
  avatar?: string;
  availableForWork: boolean;
  availabilityNote?: string;
  yearsOfExperience?: number;
  seoTitle?: string;
  seoDescription?: string;
}
