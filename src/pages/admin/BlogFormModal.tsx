import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import api from '../../services/api';
import { getApiErrorMessage } from '../../utils/apiError';
import type { Blog, BlogStatus } from '../../types/cms';
import Notice from '../../components/admin/Notice';
import { FormField } from '../../components/admin/FormField';
import { fieldClass, primaryButtonClass, secondaryButtonClass } from '../../components/admin/formStyles';
import MediaPicker from '../../components/admin/MediaPicker';

interface BlogFormModalProps {
  blog: Blog | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}

interface FormState {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  author: string;
  status: BlogStatus;
  featured: boolean;
  scheduledFor: string;
  seoTitle: string;
  seoDescription: string;
  coverImage: string;
}

function toFormState(blog: Blog | null): FormState {
  return {
    title: blog?.title ?? '',
    slug: blog?.slug ?? '',
    excerpt: blog?.excerpt ?? '',
    content: blog?.content ?? '',
    category: blog?.category ?? '',
    tags: (blog?.tags ?? []).join(', '),
    author: blog?.author ?? '',
    status: blog?.status ?? 'draft',
    featured: blog?.featured ?? false,
    scheduledFor: blog?.scheduledFor ? blog.scheduledFor.slice(0, 16) : '',
    seoTitle: blog?.seoTitle ?? '',
    seoDescription: blog?.seoDescription ?? '',
    coverImage: blog?.coverImage ?? '',
  };
}

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function validateForm(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.title.trim()) errors.title = 'Title is required.';
  else if (form.title.length > 300) errors.title = 'Title must be 300 characters or fewer.';
  if (form.slug.trim() && !/^[a-z0-9-]+$/.test(form.slug.trim())) {
    errors.slug = 'Slug may contain only lowercase letters, numbers, and hyphens.';
  }
  if (!form.excerpt.trim()) errors.excerpt = 'Excerpt is required.';
  else if (form.excerpt.length > 600) errors.excerpt = 'Excerpt must be 600 characters or fewer.';
  if (!form.content.trim()) errors.content = 'Content is required.';
  if (form.status === 'scheduled' && !form.scheduledFor)
    errors.scheduledFor = 'Pick a date and time for a scheduled post.';
  if (form.seoTitle.length > 70) errors.seoTitle = 'SEO title must be 70 characters or fewer.';
  if (form.seoDescription.length > 160)
    errors.seoDescription = 'SEO description must be 160 characters or fewer.';
  return errors;
}

export default function BlogFormModal({ blog, onClose, onSaved }: BlogFormModalProps) {
  const isEdit = blog !== null;
  const [form, setForm] = useState<FormState>(() => toFormState(null));
  const [detailLoading, setDetailLoading] = useState(isEdit);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!blog) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(`/blogs/${blog._id}`);
        if (cancelled) return;
        if (res.data.success) {
          setForm(toFormState(res.data.data));
        } else {
          setDetailError(res.data.message || 'Could not load the post.');
        }
      } catch (err) {
        if (!cancelled) setDetailError(getApiErrorMessage(err, 'Could not load the post.'));
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [blog]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !submitting) onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, submitting]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validateForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        tags: splitList(form.tags),
        status: form.status,
        featured: form.featured,
        seoTitle: form.seoTitle.trim(),
        seoDescription: form.seoDescription.trim(),
        coverImage: form.coverImage.trim(),
      };
      const slug = form.slug.trim();
      if (slug) payload.slug = slug;
      const category = form.category.trim();
      if (category) payload.category = category;
      const author = form.author.trim();
      if (author) payload.author = author;
      if (form.status === 'scheduled' && form.scheduledFor) payload.scheduledFor = form.scheduledFor;

      const res = isEdit
        ? await api.put(`/blogs/${blog._id}`, payload)
        : await api.post('/blogs', payload);
      if (res.data.success) {
        onSaved(res.data.message || (isEdit ? 'Post updated.' : 'Post created.'));
      } else {
        setSubmitError(res.data.message || 'Could not save the post.');
      }
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Could not save the post.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="blog-form-title"
        className="glass-panel w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 sm:p-8"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 id="blog-form-title" className="font-display text-xl font-semibold">
              {isEdit ? 'Edit Post' : 'New Post'}
            </h2>
            <p className="text-sm text-text-muted mt-1">
              {isEdit ? 'Update the post details below.' : 'Write a new blog post.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="text-text-muted hover:text-text-primary transition-colors leading-none text-xl disabled:opacity-50"
          >
            &times;
          </button>
        </div>

        {detailLoading && (
          <div role="status" className="py-16 text-center text-sm text-text-muted animate-pulse">
            Loading post...
          </div>
        )}

        {detailError && (
          <div className="mb-6">
            <Notice type="error" message={detailError} onClose={() => setDetailError(null)} />
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={onClose} className={secondaryButtonClass()}>
                Close
              </button>
            </div>
          </div>
        )}

        {!detailLoading && !detailError && (
          <>
            {submitError && (
              <div className="mb-6">
                <Notice type="error" message={submitError} onClose={() => setSubmitError(null)} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <FormField label="Title" htmlFor="blog-title" required error={errors.title}>
                <input
                  id="blog-title"
                  type="text"
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  maxLength={300}
                  aria-invalid={!!errors.title}
                  className={fieldClass(!!errors.title)}
                  placeholder="Post title"
                  autoFocus
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField
                  label="Slug"
                  htmlFor="blog-slug"
                  hint="Leave blank to generate from title."
                  error={errors.slug}
                >
                  <input
                    id="blog-slug"
                    type="text"
                    value={form.slug}
                    onChange={(e) => update('slug', e.target.value)}
                    aria-invalid={!!errors.slug}
                    className={fieldClass(!!errors.slug)}
                    placeholder="my-post"
                  />
                </FormField>
                <FormField label="Category" htmlFor="blog-category" hint="Defaults to General.">
                  <input
                    id="blog-category"
                    type="text"
                    value={form.category}
                    onChange={(e) => update('category', e.target.value)}
                    className={fieldClass()}
                    placeholder="General"
                  />
                </FormField>
              </div>

              <FormField
                label="Excerpt"
                htmlFor="blog-excerpt"
                required
                hint={`${form.excerpt.length}/600 characters`}
                error={errors.excerpt}
              >
                <textarea
                  id="blog-excerpt"
                  value={form.excerpt}
                  onChange={(e) => update('excerpt', e.target.value)}
                  maxLength={600}
                  rows={3}
                  aria-invalid={!!errors.excerpt}
                  className={`${fieldClass(!!errors.excerpt)} resize-y`}
                  placeholder="Short summary shown in post lists"
                />
              </FormField>

              <FormField label="Content" htmlFor="blog-content" required error={errors.content}>
                <textarea
                  id="blog-content"
                  value={form.content}
                  onChange={(e) => update('content', e.target.value)}
                  rows={10}
                  aria-invalid={!!errors.content}
                  className={`${fieldClass(!!errors.content)} resize-y font-mono text-sm`}
                  placeholder="Write the post content..."
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField label="Tags" htmlFor="blog-tags" hint="Comma-separated">
                  <input
                    id="blog-tags"
                    type="text"
                    value={form.tags}
                    onChange={(e) => update('tags', e.target.value)}
                    className={fieldClass()}
                    placeholder="react, cms"
                  />
                </FormField>
                <FormField label="Author" htmlFor="blog-author" hint="Defaults to the site owner.">
                  <input
                    id="blog-author"
                    type="text"
                    value={form.author}
                    onChange={(e) => update('author', e.target.value)}
                    className={fieldClass()}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
                <FormField label="Status" htmlFor="blog-status">
                  <select
                    id="blog-status"
                    value={form.status}
                    onChange={(e) => update('status', e.target.value as BlogStatus)}
                    className={fieldClass()}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </FormField>
                <label className="flex items-center gap-2 pt-7 text-sm text-text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => update('featured', e.target.checked)}
                    className="w-4 h-4 accent-accent-primary"
                  />
                  Featured
                </label>
              </div>

              {form.status === 'scheduled' && (
                <FormField
                  label="Scheduled for"
                  htmlFor="blog-scheduled-for"
                  required
                  error={errors.scheduledFor}
                >
                  <input
                    id="blog-scheduled-for"
                    type="datetime-local"
                    value={form.scheduledFor}
                    onChange={(e) => update('scheduledFor', e.target.value)}
                    aria-invalid={!!errors.scheduledFor}
                    style={{ colorScheme: 'dark' }}
                    className={fieldClass(!!errors.scheduledFor)}
                  />
                </FormField>
              )}

              <fieldset className="border-t border-border-color pt-5 space-y-5">
                <legend className="sr-only">SEO</legend>
                <p className="text-sm font-medium text-text-secondary">SEO (optional)</p>
                <FormField label="SEO title" htmlFor="blog-seo-title" error={errors.seoTitle}>
                  <input
                    id="blog-seo-title"
                    type="text"
                    value={form.seoTitle}
                    onChange={(e) => update('seoTitle', e.target.value)}
                    maxLength={70}
                    aria-invalid={!!errors.seoTitle}
                    className={fieldClass(!!errors.seoTitle)}
                  />
                </FormField>
                <FormField
                  label="SEO description"
                  htmlFor="blog-seo-description"
                  error={errors.seoDescription}
                >
                  <textarea
                    id="blog-seo-description"
                    value={form.seoDescription}
                    onChange={(e) => update('seoDescription', e.target.value)}
                    maxLength={160}
                    rows={2}
                    aria-invalid={!!errors.seoDescription}
                    className={`${fieldClass(!!errors.seoDescription)} resize-y`}
                  />
                </FormField>
              </fieldset>

              <div className="border-t border-border-color pt-5">
                <p className="text-sm font-medium text-text-secondary mb-2">Cover image</p>
                <MediaPicker
                  value={form.coverImage}
                  onChange={(url) => update('coverImage', url)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border-color">
                <button type="button" onClick={onClose} disabled={submitting} className={secondaryButtonClass()}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className={primaryButtonClass()}>
                  {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Post'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
