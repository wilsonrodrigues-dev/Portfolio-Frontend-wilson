import { Mail, MapPin, Phone, Download, ArrowUpRight, User } from 'lucide-react';
import type { About, Resource } from '../../types/cms';
import { LoadingState, EmptyState, ErrorState } from '../admin/AdminStates';
import { resolveMediaUrl } from '../../utils/media';
import { safeHref } from '../../utils/url';
import SectionHeader from './SectionHeader';

interface AboutSectionProps {
  state: Resource<About | null>;
  onRetry: () => void;
}

function socialLink(label: string, url: string) {
  const href = safeHref(url);
  if (!href) return null;
  return (
    <a
      key={label}
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors"
    >
      {label}
      <ArrowUpRight size={14} />
    </a>
  );
}

export default function AboutSection({ state, onRetry }: AboutSectionProps) {
  const about = state.status === 'ready' ? state.data : null;
  const resumeHref = safeHref(
    about ? resolveMediaUrl(about.resumeUrl) ?? about.resumeUrl : undefined
  );

  return (
    <section id="about" className="max-w-7xl mx-auto px-6 py-20 md:py-30 scroll-mt-24">
      <SectionHeader eyebrow="About" title="Who I Am" />

      {state.status === 'loading' && <LoadingState label="Loading about..." />}
      {state.status === 'error' && <ErrorState message={state.message} onRetry={onRetry} />}
      {state.status === 'ready' && !state.data && (
        <EmptyState
          icon={<User size={20} />}
          title="About not configured yet"
          description="The profile section has not been set up in the CMS yet."
        />
      )}
      {state.status === 'ready' && state.data && (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10 items-start">
          <div className="relative w-full max-w-[320px] mx-auto lg:mx-0 aspect-[3/4] rounded-2xl overflow-hidden border border-border-color glass-panel">
            <img
              src={resolveMediaUrl(state.data.avatar) ?? '/images/portrait.png'}
              alt={state.data.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6">
            <div>
              <p className="font-display text-2xl font-bold text-text-primary">{state.data.name}</p>
              <p className="text-accent-secondary font-medium">{state.data.headline}</p>
              {state.data.subheadline && (
                <p className="text-text-secondary mt-2">{state.data.subheadline}</p>
              )}
            </div>

            <p className="text-text-muted leading-relaxed">{state.data.bio}</p>

            {state.data.longBio &&
              state.data.longBio.split('\n\n').map((para) => (
                <p key={para.slice(0, 40)} className="text-text-secondary leading-relaxed">
                  {para}
                </p>
              ))}

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-secondary">
              {state.data.location && (
                <span className="inline-flex items-center gap-2">
                  <MapPin size={15} className="text-accent-primary" />
                  {state.data.location}
                </span>
              )}
              {state.data.email && (
                <a
                  href={`mailto:${state.data.email}`}
                  className="inline-flex items-center gap-2 hover:text-text-primary transition-colors"
                >
                  <Mail size={15} className="text-accent-primary" />
                  {state.data.email}
                </a>
              )}
              {state.data.phone && (
                <span className="inline-flex items-center gap-2">
                  <Phone size={15} className="text-accent-primary" />
                  {state.data.phone}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-5 pt-2 border-t border-border-color">
              {state.data.githubUrl && socialLink('GitHub', state.data.githubUrl)}
              {state.data.linkedinUrl && socialLink('LinkedIn', state.data.linkedinUrl)}
              {state.data.twitterUrl && socialLink('Twitter', state.data.twitterUrl)}
              {resumeHref && (
                <a
                  href={resumeHref}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md bg-glass-bg border border-border-color hover:border-accent-primary/50 transition-colors text-text-secondary hover:text-text-primary"
                >
                  <Download size={14} />
                  Resume
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
