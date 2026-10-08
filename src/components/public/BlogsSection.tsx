import { Link } from 'react-router-dom';
import { FileText, Clock } from 'lucide-react';
import type { Blog, Resource } from '../../types/cms';
import { LoadingState, EmptyState, ErrorState } from '../admin/AdminStates';
import { resolveMediaUrl } from '../../utils/media';
import SectionHeader from './SectionHeader';

interface BlogsSectionProps {
  state: Resource<Blog[]>;
  onRetry: () => void;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function BlogsSection({ state, onRetry }: BlogsSectionProps) {
  return (
    <section id="blogs" className="max-w-7xl mx-auto px-6 py-20 md:py-30 scroll-mt-24">
      <SectionHeader eyebrow="Writing" title="Latest Articles" />

      {state.status === 'loading' && <LoadingState label="Loading articles..." />}
      {state.status === 'error' && <ErrorState message={state.message} onRetry={onRetry} />}
      {state.status === 'ready' && state.data.length === 0 && (
        <EmptyState
          icon={<FileText size={20} />}
          title="No articles yet"
          description="Published blog posts will appear here once they are released in the CMS."
        />
      )}
      {state.status === 'ready' && state.data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {state.data.map((post) => {
            const cover = resolveMediaUrl(post.coverImage);
            const date = post.publishedAt ?? post.createdAt;
            return (
              <article
                key={post._id}
                className="glass-panel rounded-xl overflow-hidden border border-border-color flex flex-col group"
              >
                <Link
                  to={`/blogs/${post.slug}`}
                  className="flex flex-col flex-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-primary rounded-xl"
                >
                  <div className="relative h-44 overflow-hidden bg-gradient-to-br from-accent-secondary/15 to-accent-primary/10">
                    {cover ? (
                      <img
                        src={cover}
                        alt={post.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted">
                        <FileText size={30} />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-bg-color/80 border border-border-color text-[11px] font-medium text-accent-secondary uppercase tracking-wider">
                      {post.category}
                    </span>
                  </div>

                  <div className="p-5 flex flex-col flex-1 gap-3">
                    <div className="flex items-center gap-4 text-xs text-text-muted">
                      <span>{formatDate(date)}</span>
                      {post.readingTime > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} />
                          {post.readingTime} min read
                        </span>
                      )}
                    </div>

                    <h3 className="font-display text-lg font-semibold text-text-primary leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed flex-1">
                      {post.excerpt}
                    </p>

                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md bg-glass-bg border border-border-color text-xs text-text-muted"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
