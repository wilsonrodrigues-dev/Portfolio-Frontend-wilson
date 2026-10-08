import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { User } from 'lucide-react';
import api from '../../services/api';
import { getApiErrorMessage } from '../../utils/apiError';
import type { About } from '../../types/cms';
import { useAuth } from '../../context/AuthContext';
import { LoadingState, ErrorState } from '../../components/admin/AdminStates';
import Notice from '../../components/admin/Notice';
import type { NoticeState } from '../../components/admin/Notice';
import { FormField } from '../../components/admin/FormField';
import { fieldClass, primaryButtonClass, secondaryButtonClass } from '../../components/admin/formStyles';
import MediaPicker from '../../components/admin/MediaPicker';
import { resolveMediaUrl } from '../../utils/media';

interface AboutFormState {
  name: string;
  headline: string;
  subheadline: string;
  bio: string;
  longBio: string;
  location: string;
  email: string;
  phone: string;
  githubUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  resumeUrl: string;
  avatar: string;
  availableForWork: boolean;
  availabilityNote: string;
  yearsOfExperience: string;
  seoTitle: string;
  seoDescription: string;
}

function toFormState(about: About | null): AboutFormState {
  return {
    name: about?.name ?? '',
    headline: about?.headline ?? '',
    subheadline: about?.subheadline ?? '',
    bio: about?.bio ?? '',
    longBio: about?.longBio ?? '',
    location: about?.location ?? '',
    email: about?.email ?? '',
    phone: about?.phone ?? '',
    githubUrl: about?.githubUrl ?? '',
    linkedinUrl: about?.linkedinUrl ?? '',
    twitterUrl: about?.twitterUrl ?? '',
    resumeUrl: about?.resumeUrl ?? '',
    avatar: about?.avatar ?? '',
    availableForWork: about?.availableForWork ?? false,
    availabilityNote: about?.availabilityNote ?? '',
    yearsOfExperience: about?.yearsOfExperience != null ? String(about.yearsOfExperience) : '',
    seoTitle: about?.seoTitle ?? '',
    seoDescription: about?.seoDescription ?? '',
  };
}

function validateForm(form: AboutFormState): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.name.trim()) errors.name = 'Name is required.';
  if (!form.headline.trim()) errors.headline = 'Headline is required.';
  if (!form.bio.trim()) errors.bio = 'Bio is required.';
  if (form.yearsOfExperience.trim()) {
    const years = Number(form.yearsOfExperience);
    if (!Number.isInteger(years) || years < 0)
      errors.yearsOfExperience = 'Years of experience must be a whole number of 0 or more.';
  }
  return errors;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [about, setAbout] = useState<About | null>(null);
  const [form, setForm] = useState<AboutFormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const loadAbout = async () => {
      try {
        const res = await api.get('/about');
        if (res.data.success) {
          const data = (res.data.data ?? null) as About | null;
          setAbout(data);
          setForm(toFormState(data));
          setError(null);
        } else {
          setError(res.data.message || 'Unable to load about content.');
        }
      } catch (err) {
        setError(getApiErrorMessage(err, 'Unable to load about content.'));
      } finally {
        setLoading(false);
      }
    };

    loadAbout();
  }, [reloadKey]);

  function handleRetry() {
    setLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  }

  function update<K extends keyof AboutFormState>(key: K, value: AboutFormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function handleReset() {
    if (!about) return;
    setForm(toFormState(about));
    setErrors({});
    setSaveError(null);
    setNotice(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    const validationErrors = validateForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSaving(true);
    setSaveError(null);
    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        headline: form.headline.trim(),
        bio: form.bio.trim(),
        subheadline: form.subheadline.trim(),
        longBio: form.longBio.trim(),
        location: form.location.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        githubUrl: form.githubUrl.trim(),
        linkedinUrl: form.linkedinUrl.trim(),
        twitterUrl: form.twitterUrl.trim(),
        resumeUrl: form.resumeUrl.trim(),
        avatar: form.avatar.trim(),
        availableForWork: form.availableForWork,
        availabilityNote: form.availabilityNote.trim(),
        seoTitle: form.seoTitle.trim(),
        seoDescription: form.seoDescription.trim(),
      };
      if (form.yearsOfExperience.trim()) {
        payload.yearsOfExperience = Number(form.yearsOfExperience);
      }

      const res = await api.put('/about', payload);
      if (res.data.success) {
        const saved = res.data.data as About;
        setAbout(saved);
        setForm(toFormState(saved));
        setErrors({});
        setNotice({ type: 'success', message: res.data.message || 'About updated successfully.' });
      } else {
        setSaveError(res.data.message || 'Could not save the about content.');
      }
    } catch (err) {
      setSaveError(getApiErrorMessage(err, 'Could not save the about content.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-semibold mb-2">Your Profile</h2>
        <p className="text-text-muted">Signed-in account details and public portfolio about content.</p>
      </div>

      {notice && <Notice {...notice} onClose={() => setNotice(null)} />}

      <section className="glass-panel p-6">
        <h3 className="font-semibold mb-1 border-b border-border-color pb-4">Account</h3>
        <p className="text-xs text-text-muted mt-3 mb-4">
          The admin account used to sign in. Separate from the portfolio about content below.
        </p>
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <dt className="text-xs text-text-muted mb-1">Name</dt>
            <dd className="text-sm font-medium text-text-primary">{user?.name || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-text-muted mb-1">Email</dt>
            <dd className="text-sm font-medium text-text-primary">{user?.email || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-text-muted mb-1">Role</dt>
            <dd className="text-sm font-medium text-text-primary capitalize">{user?.role || '—'}</dd>
          </div>
        </dl>
      </section>

      {loading ? (
        <LoadingState label="Loading about content..." />
      ) : error ? (
        <ErrorState message={error} onRetry={handleRetry} />
      ) : (
        form && (
          <section className="glass-panel p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border-color pb-4 mb-5">
              <div>
                <h3 className="font-semibold">About</h3>
                <p className="text-xs text-text-muted mt-1">
                  Public portfolio content{about?._id ? '' : ' — nothing saved yet, your first save creates it'}.
                </p>
              </div>
              <div className="flex items-center gap-4">
                {(() => {
                  const avatarSrc = resolveMediaUrl(form.avatar);
                  return avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover border border-border-color bg-bg-color"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-glass-bg border border-border-color flex items-center justify-center text-text-muted">
                      <User size={20} />
                    </div>
                  );
                })()}
                <div className="text-right">
                  <p className="text-xs text-text-muted">Avatar</p>
                  <p className="text-xs text-text-muted max-w-[16rem] truncate">
                    {form.avatar || 'Not set'}
                  </p>
                </div>
              </div>
            </div>

            {saveError && (
              <div className="mb-5">
                <Notice type="error" message={saveError} onClose={() => setSaveError(null)} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <p className="text-sm font-medium text-text-secondary mb-2">Avatar</p>
                <MediaPicker value={form.avatar} onChange={(url) => update('avatar', url)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField label="Name" htmlFor="about-name" required error={errors.name}>
                  <input
                    id="about-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    aria-invalid={!!errors.name}
                    className={fieldClass(!!errors.name)}
                  />
                </FormField>
                <FormField label="Headline" htmlFor="about-headline" required error={errors.headline}>
                  <input
                    id="about-headline"
                    type="text"
                    value={form.headline}
                    onChange={(e) => update('headline', e.target.value)}
                    aria-invalid={!!errors.headline}
                    className={fieldClass(!!errors.headline)}
                  />
                </FormField>
              </div>

              <FormField label="Subheadline" htmlFor="about-subheadline">
                <input
                  id="about-subheadline"
                  type="text"
                  value={form.subheadline}
                  onChange={(e) => update('subheadline', e.target.value)}
                  className={fieldClass()}
                />
              </FormField>

              <FormField label="Bio" htmlFor="about-bio" required error={errors.bio}>
                <textarea
                  id="about-bio"
                  value={form.bio}
                  onChange={(e) => update('bio', e.target.value)}
                  rows={4}
                  aria-invalid={!!errors.bio}
                  className={`${fieldClass(!!errors.bio)} resize-y`}
                />
              </FormField>

              <FormField label="Long bio" htmlFor="about-long-bio" hint="Shown on the about section.">
                <textarea
                  id="about-long-bio"
                  value={form.longBio}
                  onChange={(e) => update('longBio', e.target.value)}
                  rows={6}
                  className={`${fieldClass()} resize-y`}
                />
              </FormField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField label="Location" htmlFor="about-location">
                  <input
                    id="about-location"
                    type="text"
                    value={form.location}
                    onChange={(e) => update('location', e.target.value)}
                    className={fieldClass()}
                  />
                </FormField>
                <FormField label="Email" htmlFor="about-email">
                  <input
                    id="about-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    className={fieldClass()}
                  />
                </FormField>
                <FormField label="Phone" htmlFor="about-phone">
                  <input
                    id="about-phone"
                    type="text"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    className={fieldClass()}
                  />
                </FormField>
                <FormField
                  label="Years of experience"
                  htmlFor="about-years"
                  error={errors.yearsOfExperience}
                >
                  <input
                    id="about-years"
                    type="number"
                    min={0}
                    step={1}
                    value={form.yearsOfExperience}
                    onChange={(e) => update('yearsOfExperience', e.target.value)}
                    aria-invalid={!!errors.yearsOfExperience}
                    className={fieldClass(!!errors.yearsOfExperience)}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField label="GitHub URL" htmlFor="about-github">
                  <input
                    id="about-github"
                    type="url"
                    value={form.githubUrl}
                    onChange={(e) => update('githubUrl', e.target.value)}
                    className={fieldClass()}
                  />
                </FormField>
                <FormField label="LinkedIn URL" htmlFor="about-linkedin">
                  <input
                    id="about-linkedin"
                    type="url"
                    value={form.linkedinUrl}
                    onChange={(e) => update('linkedinUrl', e.target.value)}
                    className={fieldClass()}
                  />
                </FormField>
                <FormField label="Twitter URL" htmlFor="about-twitter">
                  <input
                    id="about-twitter"
                    type="url"
                    value={form.twitterUrl}
                    onChange={(e) => update('twitterUrl', e.target.value)}
                    className={fieldClass()}
                  />
                </FormField>
                <FormField label="Resume URL" htmlFor="about-resume">
                  <input
                    id="about-resume"
                    type="text"
                    value={form.resumeUrl}
                    onChange={(e) => update('resumeUrl', e.target.value)}
                    className={fieldClass()}
                  />
                </FormField>
              </div>

              <div className="flex flex-wrap items-end gap-6 pt-1">
                <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.availableForWork}
                    onChange={(e) => update('availableForWork', e.target.checked)}
                    className="w-4 h-4 accent-accent-primary"
                  />
                  Available for work
                </label>
                <div className="flex-1 min-w-56">
                  <FormField label="Availability note" htmlFor="about-availability-note">
                    <input
                      id="about-availability-note"
                      type="text"
                      value={form.availabilityNote}
                      onChange={(e) => update('availabilityNote', e.target.value)}
                      className={fieldClass()}
                      placeholder="Open to freelance projects"
                    />
                  </FormField>
                </div>
              </div>

              <fieldset className="border-t border-border-color pt-5 space-y-5">
                <legend className="sr-only">SEO</legend>
                <p className="text-sm font-medium text-text-secondary">SEO (optional)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField label="SEO title" htmlFor="about-seo-title">
                    <input
                      id="about-seo-title"
                      type="text"
                      value={form.seoTitle}
                      onChange={(e) => update('seoTitle', e.target.value)}
                      className={fieldClass()}
                    />
                  </FormField>
                  <FormField label="SEO description" htmlFor="about-seo-description">
                    <textarea
                      id="about-seo-description"
                      value={form.seoDescription}
                      onChange={(e) => update('seoDescription', e.target.value)}
                      rows={2}
                      className={`${fieldClass()} resize-y`}
                    />
                  </FormField>
                </div>
              </fieldset>

              <div className="flex justify-end gap-3 pt-4 border-t border-border-color">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={saving}
                  className={secondaryButtonClass()}
                >
                  Reset
                </button>
                <button type="submit" disabled={saving} className={primaryButtonClass()}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </section>
        )
      )}
    </div>
  );
}
