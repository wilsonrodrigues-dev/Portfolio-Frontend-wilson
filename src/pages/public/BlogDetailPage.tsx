import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Calendar, Clock, FileText, User } from 'lucide-react';
import api from '../../services/api';
import { getApiErrorMessage } from '../../utils/apiError';
import { resolveMediaUrl } from '../../utils/media';
import { useDocumentTitle, DEFAULT_TITLE } from '../../utils/useDocumentTitle';
import type { ApiResponse, Blog, DetailResource } from '../../types/cms';
import { LoadingState, ErrorState } from '../../components/admin/AdminStates';

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="text-text-primary font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

const BLOCK_START = /^(#{1,4}\s|\d+\.\s|[-*]\s)/;

function renderMarkdown(markdown: string): ReactNode[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  // Content headings are relative to the article title (page h1). Normalize so
  // the shallowest heading in the post renders as h2 — a post that starts at
  // "###" must not jump straight from h1 to h3.
  const rawLevels = [...markdown.matchAll(/^(#{1,6})\s/gm)].map((m) => m[1].length);
  const minLevel = rawLevels.length ? Math.min(...rawLevels) : 1;
  const headingTag = (level: number) => `h${Math.min(6, 2 + (level - minLevel))}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      const rendered = Math.min(6, 2 + (level - minLevel));
      const Tag = headingTag(level);
      blocks.push(
        <Tag
          key={`h${key++}`}
          className={`font-display font-semibold text-text-primary ${
            rendered <= 2 ? 'text-2xl mt-8 mb-3' : 'text-lg mt-6 mb-2'
          }`}
        >
          {renderInline(heading[2])}
        </Tag>
      );
      i += 1;
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''));
        i += 1;
      }
      blocks.push(
        <ol key={`ol${key++}`} className="list-decimal pl-5 space-y-2 text-text-secondary">
          {items.map((item, index) => (
            <li key={index} className="leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    if (/^[-*]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s/, ''));
        i += 1;
      }
      blocks.push(
        <ul key={`ul${key++}`} className="list-disc pl-5 space-y-2 text-text-secondary">
          {items.map((item, index) => (
            <li key={index} className="leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    const paragraph: string[] = [];
    while (i < lines.length && lines[i].trim() && !BLOCK_START.test(lines[i])) {
      paragraph.push(lines[i].trim());
      i += 1;
    }
    blocks.push(
      <p key={`p${key++}`} className="text-text-secondary leading-relaxed">
        {renderInline(paragraph.join(' '))}
      </p>
    );
  }

  return blocks;
}

export default function BlogDetailPage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<DetailResource<Blog>>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    api
      .get<ApiResponse<Blog>>(`/blogs/public/${slug}`)
      .then((res) => {
        if (cancelled) return;
        if (res.data.success && res.data.data) {
          setState({ status: 'ready', data: res.data.data, slug });
        } else {
          setState({
            status: 'notfound',
            message: res.data.message || 'Blog post not found.',
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
            message: getApiErrorMessage(err, 'Blog post not found.'),
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

  const view: DetailResource<Blog> =
    state.status === 'loading' || state.slug === slug ? state : { status: 'loading' };

  useDocumentTitle(
    view.status === 'ready'
      ? `${view.data.title} — Wilson Rodrigues`
      : view.status === 'notfound'
        ? 'Article Not Found — Wilson Rodrigues'
        : DEFAULT_TITLE
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <button
        type="button"
        onClick={goBack}
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-8"
      >
        <ArrowLeft size={16} />
        Go back
      </button>

      {view.status === 'loading' && <LoadingState label="Loading article..." />}

      {view.status === 'notfound' && (
        <div role="alert" className="glass-panel p-12 flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-glass-bg border border-border-color flex items-center justify-center text-text-muted">
            <FileText size={20} />
          </div>
          <h1 className="font-display text-2xl font-bold text-text-primary">Article not found</h1>
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

      {view.status === 'ready' && <BlogContent post={view.data} />}
    </div>
  );
}

function BlogContent({ post }: { post: Blog }) {
  const cover = resolveMediaUrl(post.coverImage);
  const date = post.publishedAt ?? post.createdAt;

  return (
    <article>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="px-3 py-1 rounded-full bg-glass-bg border border-border-color text-[11px] font-medium text-accent-secondary uppercase tracking-widest">
          {post.category}
        </span>
        {post.featured && (
          <span className="px-3 py-1 rounded-full bg-accent-primary/90 text-[11px] font-semibold text-bg-color uppercase tracking-widest">
            Featured
          </span>
        )}
      </div>

      <h1 className="font-display text-3xl md:text-4xl font-bold text-text-primary leading-tight">
        {post.title}
      </h1>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-text-muted">
        <span className="inline-flex items-center gap-2">
          <Calendar size={14} className="text-accent-primary" />
          {formatDate(date)}
        </span>
        <span className="inline-flex items-center gap-2">
          <User size={14} className="text-accent-primary" />
          {post.author}
        </span>
        {post.readingTime > 0 && (
          <span className="inline-flex items-center gap-2">
            <Clock size={14} className="text-accent-primary" />
            {post.readingTime} min read
          </span>
        )}
      </div>

      {cover && (
        <div className="mt-8 rounded-xl overflow-hidden border border-border-color glass-panel">
          <img src={cover} alt={post.title} className="w-full h-auto max-h-[420px] object-cover" />
        </div>
      )}

      <p className="mt-8 text-lg text-text-secondary leading-relaxed border-l-2 border-accent-primary/50 pl-4">
        {post.excerpt}
      </p>

      {post.content && (
        <div className="mt-8 space-y-4">{renderMarkdown(post.content)}</div>
      )}

      {post.tags.length > 0 && (
        <div className="mt-10 pt-6 border-t border-border-color flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-text-muted mr-1">
            <BookOpen size={13} />
            Tags
          </span>
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-md bg-glass-bg border border-border-color text-xs text-text-muted"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
