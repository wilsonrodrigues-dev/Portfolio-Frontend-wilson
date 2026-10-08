import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { CheckCircle2, Loader2, Mail, MapPin, Phone, Send } from 'lucide-react';
import api from '../../services/api';
import { getApiErrorMessage } from '../../utils/apiError';
import type { About } from '../../types/cms';
import SectionHeader from './SectionHeader';

interface ContactSectionProps {
  about: About | null;
}

interface FormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMPTY: FormValues = { name: '', email: '', subject: '', message: '' };
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const inputClass = (hasError: boolean) =>
  [
    'w-full bg-glass-bg border rounded-md px-4 py-2.5 text-text-primary',
    'placeholder:text-text-muted focus:outline-none focus:border-accent-primary',
    'transition-colors disabled:opacity-50',
    hasError ? 'border-red-400/60' : 'border-border-color',
  ].join(' ');

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.name.trim()) errors.name = 'Please enter your name.';
  if (!values.email.trim()) errors.email = 'Please enter your email address.';
  else if (!EMAIL_REGEX.test(values.email.trim()))
    errors.email = 'Please enter a valid email address.';
  if (!values.subject.trim()) errors.subject = 'Please enter a subject.';
  if (!values.message.trim()) errors.message = 'Please enter your message.';
  return errors;
}

function contactErrorMessage(err: unknown): string {
  const status = (err as { response?: { status?: number } })?.response?.status;
  if (!status) {
    return 'Unable to send your message. Please check your internet connection and try again.';
  }
  if (status === 429) {
    return getApiErrorMessage(err, 'Too many message submissions. Please try again later.');
  }
  if (status >= 400 && status < 500) {
    return getApiErrorMessage(err, 'Please check your form and try again.');
  }
  return 'Something went wrong while sending your message. Please try again later.';
}

export default function ContactSection({ about }: ContactSectionProps) {
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const inFlight = useRef(false);

  const update = (key: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inFlight.current) return;

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    inFlight.current = true;
    setSubmitting(true);
    setFormError(null);

    api
      .post('/contact', {
        name: values.name.trim(),
        email: values.email.trim(),
        subject: values.subject.trim(),
        message: values.message.trim(),
      })
      .then((res) => {
        setSuccess(
          res.data?.message || "Your message has been sent! I'll get back to you soon."
        );
        setValues(EMPTY);
        setErrors({});
      })
      .catch((err: unknown) => {
        setFormError(contactErrorMessage(err));
      })
      .finally(() => {
        inFlight.current = false;
        setSubmitting(false);
      });
  };

  const resetForAnother = () => {
    setSuccess(null);
    setFormError(null);
    setValues(EMPTY);
    setErrors({});
  };

  const field = (
    key: keyof FormValues,
    label: string,
    type: string,
    maxLength: number,
    autoComplete: string
  ) => (
    <div>
      <label htmlFor={`contact-${key}`} className="block text-sm font-medium mb-1.5">
        {label}
      </label>
      <input
        id={`contact-${key}`}
        name={key}
        type={type}
        autoComplete={autoComplete}
        maxLength={maxLength}
        value={values[key]}
        onChange={(e) => update(key, e.target.value)}
        disabled={submitting}
        aria-invalid={!!errors[key]}
        aria-describedby={errors[key] ? `contact-${key}-error` : undefined}
        className={inputClass(!!errors[key])}
      />
      {errors[key] && (
        <p id={`contact-${key}-error`} role="alert" className="mt-1.5 text-xs text-red-400">
          {errors[key]}
        </p>
      )}
    </div>
  );

  return (
    <section id="contact" className="max-w-7xl mx-auto px-6 py-20 md:py-30 scroll-mt-24">
      <SectionHeader eyebrow="Contact" title="Get In Touch" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        <div className="space-y-6">
          <p className="text-text-secondary leading-relaxed max-w-md">
            Have a project in mind or just want to say hello? Fill in the form and I&apos;ll get
            back to you as soon as I can.
          </p>

          <div className="space-y-3 text-sm">
            {about?.email && (
              <a
                href={`mailto:${about.email}`}
                className="flex items-center gap-3 text-text-secondary hover:text-text-primary transition-colors"
              >
                <span className="w-9 h-9 rounded-full bg-glass-bg border border-border-color flex items-center justify-center text-accent-primary shrink-0">
                  <Mail size={15} />
                </span>
                {about.email}
              </a>
            )}
            {about?.location && (
              <div className="flex items-center gap-3 text-text-secondary">
                <span className="w-9 h-9 rounded-full bg-glass-bg border border-border-color flex items-center justify-center text-accent-primary shrink-0">
                  <MapPin size={15} />
                </span>
                {about.location}
              </div>
            )}
            {about?.phone && (
              <div className="flex items-center gap-3 text-text-secondary">
                <span className="w-9 h-9 rounded-full bg-glass-bg border border-border-color flex items-center justify-center text-accent-primary shrink-0">
                  <Phone size={15} />
                </span>
                {about.phone}
              </div>
            )}
          </div>

          <div className="glass-panel rounded-xl border border-border-color p-5">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-secondary mb-2">
              Response Time
            </p>
            <p className="text-sm text-text-muted">
              I usually reply within 24–48 hours on business days.
            </p>
          </div>
        </div>

        <div className="glass-panel rounded-xl border border-border-color p-6 md:p-8">
          {success ? (
            <div className="flex flex-col items-center gap-4 text-center py-6" role="status">
              <span className="w-14 h-14 rounded-full bg-green-400/10 border border-green-400/30 flex items-center justify-center text-green-400">
                <CheckCircle2 size={28} />
              </span>
              <p className="text-text-secondary leading-relaxed">{success}</p>
              <button
                type="button"
                onClick={resetForAnother}
                className="px-6 py-3 rounded-full bg-text-primary text-bg-color text-sm font-bold hover:bg-gray-200 transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {formError && (
                <div
                  role="alert"
                  className="rounded-md border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300"
                >
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {field('name', 'Name', 'text', 100, 'name')}
                {field('email', 'Email', 'email', 254, 'email')}
              </div>

              {field('subject', 'Subject', 'text', 300, 'off')}

              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium mb-1.5">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={6}
                  maxLength={5000}
                  value={values.message}
                  onChange={(e) => update('message', e.target.value)}
                  disabled={submitting}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? 'contact-message-error' : undefined}
                  className={`${inputClass(!!errors.message)} resize-y`}
                />
                {errors.message && (
                  <p
                    id="contact-message-error"
                    role="alert"
                    className="mt-1.5 text-xs text-red-400"
                  >
                    {errors.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-text-primary text-bg-color font-bold text-sm hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
