import { Link } from 'react-router-dom';
import { FolderKanban, ExternalLink, Code2 } from 'lucide-react';
import type { Project, Resource } from '../../types/cms';
import { LoadingState, EmptyState, ErrorState } from '../admin/AdminStates';
import { resolveMediaUrl } from '../../utils/media';
import { safeHref } from '../../utils/url';
import SectionHeader from './SectionHeader';

interface ProjectsSectionProps {
  state: Resource<Project[]>;
  onRetry: () => void;
}

export default function ProjectsSection({ state, onRetry }: ProjectsSectionProps) {
  return (
    <section id="projects" className="max-w-7xl mx-auto px-6 py-20 md:py-30 scroll-mt-24">
      <SectionHeader eyebrow="Portfolio" title="Featured Projects" />

      {state.status === 'loading' && <LoadingState label="Loading projects..." />}
      {state.status === 'error' && <ErrorState message={state.message} onRetry={onRetry} />}
      {state.status === 'ready' && state.data.length === 0 && (
        <EmptyState
          icon={<FolderKanban size={20} />}
          title="No projects yet"
          description="Published projects will appear here once they are added in the CMS."
        />
      )}
      {state.status === 'ready' && state.data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {state.data.map((project) => {
            const cover = resolveMediaUrl(project.coverImage);
            const liveUrl = safeHref(project.liveUrl);
            const githubUrl = safeHref(project.githubUrl);
            const hasExternalLinks = Boolean(liveUrl || githubUrl);
            return (
              <article
                key={project._id}
                className="glass-panel rounded-xl overflow-hidden border border-border-color flex flex-col group"
              >
                <Link
                  to={`/projects/${project.slug}`}
                  className="flex flex-col flex-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-primary rounded-t-xl"
                >
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-accent-primary/20 to-accent-secondary/10">
                    {cover ? (
                      <img
                        src={cover}
                        alt={project.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted">
                        <FolderKanban size={32} />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-bg-color/80 border border-border-color text-[11px] font-medium text-accent-secondary uppercase tracking-wider">
                      {project.category}
                    </span>
                    {project.featured && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-accent-primary/90 text-[11px] font-semibold text-bg-color uppercase tracking-wider">
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1 gap-3">
                    <h3 className="font-display text-lg font-semibold text-text-primary">
                      {project.title}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed flex-1">
                      {project.shortDescription}
                    </p>

                    {project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {project.technologies.slice(0, 6).map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 rounded-md bg-glass-bg border border-border-color text-xs font-mono text-text-muted"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>

                {hasExternalLinks && (
                  <div className="flex items-center gap-4 px-5 py-3 border-t border-border-color">
                    {liveUrl && (
                      <a
                        href={liveUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent-primary transition-colors"
                      >
                        <ExternalLink size={14} />
                        Live Demo
                      </a>
                    )}
                    {githubUrl && (
                      <a
                        href={githubUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent-primary transition-colors"
                      >
                        <Code2 size={14} />
                        Source
                      </a>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
