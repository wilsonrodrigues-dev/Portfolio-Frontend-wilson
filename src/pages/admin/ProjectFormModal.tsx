import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import api from '../../services/api';
import { getApiErrorMessage } from '../../utils/apiError';
import type { Project } from '../../types/cms';
import Notice from '../../components/admin/Notice';
import { FormField } from '../../components/admin/FormField';
import { fieldClass, primaryButtonClass, secondaryButtonClass } from '../../components/admin/formStyles';
import MediaPicker from '../../components/admin/MediaPicker';
import { resolveMediaUrl } from '../../utils/media';

interface ProjectFormModalProps {
  project: Project | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}

interface FormState {
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  description: string;
  technologies: string;
  liveUrl: string;
  githubUrl: string;
  order: string;
  published: boolean;
  featured: boolean;
  problem: string;
  solution: string;
  features: string;
  architecture: string;
  outcome: string;
  coverImage: string;
  gallery: string[];
}

function toFormState(project: Project | null): FormState {
  return {
    title: project?.title ?? '',
    slug: project?.slug ?? '',
    category: project?.category ?? '',
    shortDescription: project?.shortDescription ?? '',
    description: project?.description ?? '',
    technologies: (project?.technologies ?? []).join(', '),
    liveUrl: project?.liveUrl ?? '',
    githubUrl: project?.githubUrl ?? '',
    order: String(project?.order ?? 0),
    published: project?.published ?? false,
    featured: project?.featured ?? false,
    problem: project?.problem ?? '',
    solution: project?.solution ?? '',
    features: (project?.features ?? []).join('\n'),
    architecture: project?.architecture ?? '',
    outcome: project?.outcome ?? '',
    coverImage: project?.coverImage ?? '',
    gallery: project?.gallery ?? [],
  };
}

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitLines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function validateForm(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.title.trim()) errors.title = 'Title is required.';
  else if (form.title.length > 200) errors.title = 'Title must be 200 characters or fewer.';
  if (form.slug.trim() && !/^[a-z0-9-]+$/.test(form.slug.trim())) {
    errors.slug = 'Slug may contain only lowercase letters, numbers, and hyphens.';
  }
  if (!form.category.trim()) errors.category = 'Category is required.';
  if (!form.shortDescription.trim()) errors.shortDescription = 'Short description is required.';
  else if (form.shortDescription.length > 500)
    errors.shortDescription = 'Short description must be 500 characters or fewer.';
  if (!form.description.trim()) errors.description = 'Description is required.';
  if (form.liveUrl.trim() && !/^https?:\/\/\S+$/.test(form.liveUrl.trim()))
    errors.liveUrl = 'Enter a URL starting with http:// or https://.';
  if (form.githubUrl.trim() && !/^https?:\/\/\S+$/.test(form.githubUrl.trim()))
    errors.githubUrl = 'Enter a URL starting with http:// or https://.';
  if (form.order.trim()) {
    const order = Number(form.order);
    if (!Number.isInteger(order)) errors.order = 'Order must be a whole number.';
  }
  return errors;
}

export default function ProjectFormModal({ project, onClose, onSaved }: ProjectFormModalProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(project));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEdit = project !== null;

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
        category: form.category.trim(),
        shortDescription: form.shortDescription.trim(),
        description: form.description.trim(),
        technologies: splitList(form.technologies),
        features: splitLines(form.features),
        liveUrl: form.liveUrl.trim(),
        githubUrl: form.githubUrl.trim(),
        order: form.order.trim() ? Number(form.order) : 0,
        published: form.published,
        featured: form.featured,
        problem: form.problem.trim(),
        solution: form.solution.trim(),
        architecture: form.architecture.trim(),
        outcome: form.outcome.trim(),
        coverImage: form.coverImage.trim(),
        gallery: form.gallery,
      };
      const slug = form.slug.trim();
      if (slug) payload.slug = slug;

      const res = isEdit
        ? await api.put(`/projects/${project._id}`, payload)
        : await api.post('/projects', payload);
      if (res.data.success) {
        onSaved(res.data.message || (isEdit ? 'Project updated.' : 'Project created.'));
      } else {
        setSubmitError(res.data.message || 'Could not save the project.');
      }
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Could not save the project.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-form-title"
        className="glass-panel w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 sm:p-8"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 id="project-form-title" className="font-display text-xl font-semibold">
              {isEdit ? 'Edit Project' : 'New Project'}
            </h2>
            <p className="text-sm text-text-muted mt-1">
              {isEdit ? 'Update the project details below.' : 'Add a new project to the portfolio.'}
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

        {submitError && (
          <div className="mb-6">
            <Notice type="error" message={submitError} onClose={() => setSubmitError(null)} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <FormField label="Title" htmlFor="project-title" required error={errors.title}>
            <input
              id="project-title"
              type="text"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              maxLength={200}
              aria-invalid={!!errors.title}
              className={fieldClass(!!errors.title)}
              placeholder="Project title"
              autoFocus
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField
              label="Slug"
              htmlFor="project-slug"
              hint="Leave blank to generate from title."
              error={errors.slug}
            >
              <input
                id="project-slug"
                type="text"
                value={form.slug}
                onChange={(e) => update('slug', e.target.value)}
                aria-invalid={!!errors.slug}
                className={fieldClass(!!errors.slug)}
                placeholder="my-project"
              />
            </FormField>
            <FormField label="Category" htmlFor="project-category" required error={errors.category}>
              <input
                id="project-category"
                type="text"
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                aria-invalid={!!errors.category}
                className={fieldClass(!!errors.category)}
                placeholder="Web App"
              />
            </FormField>
          </div>

          <FormField
            label="Short description"
            htmlFor="project-short-description"
            required
            hint={`${form.shortDescription.length}/500 characters`}
            error={errors.shortDescription}
          >
            <textarea
              id="project-short-description"
              value={form.shortDescription}
              onChange={(e) => update('shortDescription', e.target.value)}
              maxLength={500}
              rows={3}
              aria-invalid={!!errors.shortDescription}
              className={`${fieldClass(!!errors.shortDescription)} resize-y`}
              placeholder="One-line summary shown in project cards"
            />
          </FormField>

          <FormField label="Description" htmlFor="project-description" required error={errors.description}>
            <textarea
              id="project-description"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              rows={6}
              aria-invalid={!!errors.description}
              className={`${fieldClass(!!errors.description)} resize-y`}
              placeholder="Full project description"
            />
          </FormField>

          <FormField
            label="Technologies"
            htmlFor="project-technologies"
            hint="Comma-separated, e.g. React, Node.js, MongoDB"
          >
            <input
              id="project-technologies"
              type="text"
              value={form.technologies}
              onChange={(e) => update('technologies', e.target.value)}
              className={fieldClass()}
              placeholder="React, TypeScript, Node.js"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Live URL" htmlFor="project-live-url" error={errors.liveUrl}>
              <input
                id="project-live-url"
                type="url"
                value={form.liveUrl}
                onChange={(e) => update('liveUrl', e.target.value)}
                aria-invalid={!!errors.liveUrl}
                className={fieldClass(!!errors.liveUrl)}
                placeholder="https://example.com"
              />
            </FormField>
            <FormField label="GitHub URL" htmlFor="project-github-url" error={errors.githubUrl}>
              <input
                id="project-github-url"
                type="url"
                value={form.githubUrl}
                onChange={(e) => update('githubUrl', e.target.value)}
                aria-invalid={!!errors.githubUrl}
                className={fieldClass(!!errors.githubUrl)}
                placeholder="https://github.com/..."
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-start">
            <FormField label="Sort order" htmlFor="project-order" error={errors.order}>
              <input
                id="project-order"
                type="number"
                step={1}
                value={form.order}
                onChange={(e) => update('order', e.target.value)}
                aria-invalid={!!errors.order}
                className={fieldClass(!!errors.order)}
              />
            </FormField>
            <label className="flex items-center gap-2 pt-7 text-sm text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => update('published', e.target.checked)}
                className="w-4 h-4 accent-accent-primary"
              />
              Published
            </label>
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

          <fieldset className="border-t border-border-color pt-5 space-y-5">
            <legend className="sr-only">Case study details</legend>
            <p className="text-sm font-medium text-text-secondary">Case study details (optional)</p>
            <FormField label="Problem" htmlFor="project-problem">
              <textarea
                id="project-problem"
                value={form.problem}
                onChange={(e) => update('problem', e.target.value)}
                rows={3}
                className={`${fieldClass()} resize-y`}
              />
            </FormField>
            <FormField label="Solution" htmlFor="project-solution">
              <textarea
                id="project-solution"
                value={form.solution}
                onChange={(e) => update('solution', e.target.value)}
                rows={3}
                className={`${fieldClass()} resize-y`}
              />
            </FormField>
            <FormField label="Features" htmlFor="project-features" hint="One feature per line">
              <textarea
                id="project-features"
                value={form.features}
                onChange={(e) => update('features', e.target.value)}
                rows={4}
                className={`${fieldClass()} resize-y`}
                placeholder={'User authentication\nReal-time dashboard'}
              />
            </FormField>
            <FormField label="Architecture" htmlFor="project-architecture">
              <textarea
                id="project-architecture"
                value={form.architecture}
                onChange={(e) => update('architecture', e.target.value)}
                rows={3}
                className={`${fieldClass()} resize-y`}
              />
            </FormField>
            <FormField label="Outcome" htmlFor="project-outcome">
              <textarea
                id="project-outcome"
                value={form.outcome}
                onChange={(e) => update('outcome', e.target.value)}
                rows={3}
                className={`${fieldClass()} resize-y`}
              />
            </FormField>
          </fieldset>

          <div className="border-t border-border-color pt-5 space-y-5">
            <p className="text-sm font-medium text-text-secondary">Images</p>
            <div>
              <p className="text-xs text-text-muted mb-2">Cover image</p>
              <MediaPicker
                value={form.coverImage}
                onChange={(url) => update('coverImage', url)}
              />
            </div>
            <div>
              <p className="text-xs text-text-muted mb-2">Gallery images</p>
              {form.gallery.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-3">
                  {form.gallery.map((url, index) => {
                    const src = resolveMediaUrl(url);
                    if (!src) return null;
                    return (
                      <div key={`${url}-${index}`} className="relative">
                        <img
                          src={src}
                          alt={`Gallery image ${index + 1}`}
                          className="w-24 h-16 rounded border border-border-color object-cover bg-bg-color"
                        />
                        <button
                          type="button"
                          aria-label={`Remove gallery image ${index + 1}`}
                          onClick={() =>
                            update(
                              'gallery',
                              form.gallery.filter((_, i) => i !== index)
                            )
                          }
                          disabled={submitting}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-bg-color border border-border-color text-text-muted hover:text-red-400 hover:border-red-400/60 transition-colors flex items-center justify-center"
                        >
                          &times;
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              <MediaPicker
                onChange={(url) => update('gallery', [...form.gallery, url])}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-color">
            <button type="button" onClick={onClose} disabled={submitting} className={secondaryButtonClass()}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className={primaryButtonClass()}>
              {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
