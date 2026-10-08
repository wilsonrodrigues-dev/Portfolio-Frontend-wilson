import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Code2, ExternalLink, FolderKanban, Inbox } from 'lucide-react';
import api from '../../services/api';
import { getApiErrorMessage } from '../../utils/apiError';
import { resolveMediaUrl } from '../../utils/media';
import { safeHref } from '../../utils/url';
import { useDocumentTitle, DEFAULT_TITLE } from '../../utils/useDocumentTitle';
import type { ApiResponse, DetailResource, Project } from '../../types/cms';
import { LoadingState, ErrorState } from '../../components/admin/AdminStates';

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function proseParagraphs(text: string) {
  return text
    .split('\n\n')
    .filter((para) => para.trim())
    .map((para) => (
      <p key={para.slice(0, 40)} className="text-text-secondary leading-relaxed">
        {para}
      </p>
    ));
}

function DetailBlock({ title, body }: { title: string; body?: string }) {
  if (!body?.trim()) return null;
  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-text-primary mb-3">{title}</h2>
      <div className="space-y-3">{proseParagraphs(body)}</div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<DetailResource<Project>>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    api
      .get<ApiResponse<Project>>(`/projects/public/${slug}`)
      .then((res) => {
        if (cancelled) return;
        if (res.data.success && res.data.data) {
          setState({ status: 'ready', data: res.data.data, slug });
        } else {
          setState({
            status: 'notfound',
            message: res.data.message || 'Project not found.',
            slug,
          });
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404) {
          setState({
            status: 'notfound',
            message: getApiErrorMessage(err, 'Project not found.'),
            slug,
          });
        } else {
          setState({ status: 'error', message: getApiErrorMessage(err), slug });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slug, reloadKey]);

  const handleRetry = () => {
    setState({ status: 'loading' });
    setReloadKey((key) => key + 1);
  };

  const goBack = () => {
    // React Router tracks SPA entries as { idx } in history.state; idx 0/null
    // means the page was entered directly (or from another origin), so go home.
    const idx = (window.history.state as { idx?: number } | null)?.idx;
    if (idx && idx > 0) navigate(-1);
    else navigate('/');
  };

  // A slug change re-runs the effect; show loading until the new data settles.
  const view: DetailResource<Project> =
    state.status === 'loading' || state.slug === slug ? state : { status: 'loading' };

  useDocumentTitle(
    view.status === 'ready'
      ? `${view.data.title} — Wilson Rodrigues`
      : view.status === 'notfound'
        ? 'Project Not Found — Wilson Rodrigues'
        : DEFAULT_TITLE
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
      <button
        type="button"
        onClick={goBack}
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-8"
      >
        <ArrowLeft size={16} />
        Go back
      </button>

      {view.status === 'loading' && <LoadingState label="Loading project..." />}

      {view.status === 'notfound' && (
        <div role="alert" className="glass-panel p-12 flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-glass-bg border border-border-color flex items-center justify-center text-text-muted">
            <FolderKanban size={20} />
          </div>
          <h1 className="font-display text-2xl font-bold text-text-primary">Project not found</h1>
          <p className="text-sm text-text-muted max-w-sm">{view.message}</p>
          <div className="flex gap-4 mt-2">
            <button
              type="button"
              onClick={goBack}
              className="px-5 py-2.5 rounded-full bg-text-primary text-bg-color text-sm font-bold hover:bg-gray-200 transition-colors"
            >
              Go back
            </button>
            <Link
              to="/"
              className="px-5 py-2.5 rounded-full glass-panel border border-white/20 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Home
            </Link>
          </div>
        </div>
      )}

      {view.status === 'error' && (
        <div className="space-y-6">
          <ErrorState message={view.message} onRetry={handleRetry} />
          <div className="text-center">
            <Link
              to="/"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Back to home
            </Link>
          </div>
        </div>
      )}

      {view.status === 'ready' && <ProjectContent project={view.data} />}
    </div>
  );
}

function ProjectContent({ project }: { project: Project }) {
  const cover = resolveMediaUrl(project.coverImage);
  const gallery = project.gallery
    .map((item) => resolveMediaUrl(item))
    .filter((item): item is string => !!item);
  const liveUrl = safeHref(project.liveUrl);
  const githubUrl = safeHref(project.githubUrl);

  return (
    <article>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="px-3 py-1 rounded-full bg-glass-bg border border-border-color text-[11px] font-medium text-accent-secondary uppercase tracking-widest">
          {project.category}
        </span>
        {project.featured && (
          <span className="px-3 py-1 rounded-full bg-accent-primary/90 text-[11px] font-semibold text-bg-color uppercase tracking-widest">
            Featured
          </span>
        )}
      </div>

      <h1 className="font-display text-3xl md:text-5xl font-bold text-text-primary leading-tight">
        {project.title}
      </h1>
      <p className="mt-4 text-lg text-text-secondary leading-relaxed">{project.shortDescription}</p>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        {liveUrl && (
          <a
            href={liveUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-text-primary text-bg-color text-sm font-bold hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.15)]"
          >
            <ExternalLink size={15} />
            Live Demo
          </a>
        )}
        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-panel border border-white/20 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            <Code2 size={15} />
            Source Code
          </a>
        )}
        <span className="text-xs text-text-muted">Updated {formatDate(project.updatedAt)}</span>
      </div>

      {cover && (
        <div className="mt-8 rounded-xl overflow-hidden border border-border-color glass-panel">
          <img src={cover} alt={project.title} className="w-full h-auto max-h-[480px] object-cover" />
        </div>
      )}

      <div className="mt-8">
        <DetailBlock title="Overview" body={project.description} />
      </div>

      <div className="mt-8 space-y-8">
        <DetailBlock title="Problem" body={project.problem} />
        <DetailBlock title="Solution" body={project.solution} />
        <DetailBlock title="Architecture" body={project.architecture} />
        <DetailBlock title="Outcome" body={project.outcome} />
      </div>

      {project.features.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-xl font-semibold text-text-primary mb-3">Features</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {project.features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 text-sm text-text-secondary glass-panel rounded-lg px-4 py-3"
              >
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-accent-primary shrink-0"></span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {project.technologies.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-xl font-semibold text-text-primary mb-3">Tech Stack</h2>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1.5 rounded-md bg-glass-bg border border-border-color text-sm font-mono text-text-muted"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {gallery.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-xl font-semibold text-text-primary mb-3">Gallery</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gallery.map((src, index) => (
              <div
                key={`${src}-${index}`}
                className="rounded-lg overflow-hidden border border-border-color glass-panel"
              >
                <img
                  src={src}
                  alt={`${project.title} screenshot ${index + 1}`}
                  loading="lazy"
                  className="w-full h-48 object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {!cover && gallery.length === 0 && !project.description && (
        <div className="mt-10">
          <div className="flex items-center gap-3 text-text-muted text-sm">
            <Inbox size={16} />
            No additional media or details have been published for this project yet.
          </div>
        </div>
      )}
    </article>
  );
}
