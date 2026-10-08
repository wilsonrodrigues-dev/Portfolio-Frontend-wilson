import { useEffect, useState } from 'react';
import { FolderKanban, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import { getApiErrorMessage } from '../../utils/apiError';
import type { PaginatedMeta, Project } from '../../types/cms';
import { LoadingState, EmptyState, ErrorState } from '../../components/admin/AdminStates';
import Notice from '../../components/admin/Notice';
import type { NoticeState } from '../../components/admin/Notice';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import ProjectFormModal from './ProjectFormModal';
import { primaryButtonClass, secondaryButtonClass } from '../../components/admin/formStyles';
import { resolveMediaUrl } from '../../utils/media';

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [formModal, setFormModal] = useState<{ project: Project | null } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await api.get('/projects', { params: { page, limit: 20 } });
        if (res.data.success) {
          setProjects(res.data.data ?? []);
          setMeta(res.data.meta ?? null);
          setError(null);
        } else {
          setError(res.data.message || 'Unable to load projects.');
        }
      } catch (err) {
        setError(getApiErrorMessage(err, 'Unable to load projects.'));
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [page, reloadKey]);

  function refresh(showLoader: boolean) {
    if (showLoader) {
      setLoading(true);
      setError(null);
    }
    setReloadKey((key) => key + 1);
  }

  function goToPage(nextPage: number) {
    setLoading(true);
    setError(null);
    setPage(nextPage);
  }

  function handleRetry() {
    refresh(true);
  }

  function handleSaved(message: string) {
    setFormModal(null);
    setNotice({ type: 'success', message });
    if (page !== 1) {
      setLoading(true);
      setError(null);
      setPage(1);
    } else {
      refresh(false);
    }
  }

  function handleEditSaved(message: string) {
    setFormModal(null);
    setNotice({ type: 'success', message });
    refresh(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/projects/${deleteTarget._id}`);
      setNotice({
        type: 'success',
        message: res.data.message || 'Project deleted.',
      });
      setDeleteTarget(null);
      if (projects.length === 1 && page > 1) {
        setLoading(true);
        setPage(page - 1);
      } else {
        refresh(false);
      }
    } catch (err) {
      setNotice({
        type: 'error',
        message: getApiErrorMessage(err, 'Could not delete the project.'),
      });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold mb-2">All Projects</h2>
          <p className="text-text-muted">Manage portfolio projects and their publishing status.</p>
        </div>
        <button
          type="button"
          onClick={() => setFormModal({ project: null })}
          className={`${primaryButtonClass()} flex items-center gap-2`}
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      {notice && <Notice {...notice} onClose={() => setNotice(null)} />}

      {loading ? (
        <LoadingState label="Loading projects..." />
      ) : error ? (
        <ErrorState message={error} onRetry={handleRetry} />
      ) : projects.length === 0 ? (
        <div className="glass-panel">
          <EmptyState
            icon={<FolderKanban size={20} />}
            title="No projects yet"
            description="Projects you add will appear in this table."
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="glass-panel overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-color text-left text-text-muted">
                  <th className="px-6 py-4 font-medium">Title</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Updated</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr
                    key={project._id}
                    className="border-b border-border-color last:border-b-0 hover:bg-glass-bg transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-7 rounded bg-bg-color border border-border-color overflow-hidden shrink-0">
                          {resolveMediaUrl(project.coverImage) && (
                            <img
                              src={resolveMediaUrl(project.coverImage)}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-text-primary truncate">{project.title}</p>
                          <p className="text-xs text-text-muted truncate">{project.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{project.category}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          project.published
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-yellow-500/10 text-yellow-400'
                        }`}
                      >
                        {project.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-muted">{formatDate(project.updatedAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setFormModal({ project })}
                          aria-label={`Edit ${project.title}`}
                          className="p-2 rounded-md bg-glass-bg hover:bg-border-color transition-colors text-text-secondary hover:text-text-primary"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(project)}
                          aria-label={`Delete ${project.title}`}
                          className="p-2 rounded-md bg-glass-bg hover:bg-red-500/20 transition-colors text-text-secondary hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.pages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <span className="text-text-muted">
                Page {meta.page} of {meta.pages} &middot; {meta.total} total
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(Math.max(1, page - 1))}
                  disabled={page <= 1 || loading}
                  className={`${secondaryButtonClass()} flex items-center gap-1 disabled:opacity-40`}
                >
                  <ChevronLeft size={14} />
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= meta.pages || loading}
                  className={`${secondaryButtonClass()} flex items-center gap-1 disabled:opacity-40`}
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {formModal && (
        <ProjectFormModal
          project={formModal.project}
          onClose={() => setFormModal(null)}
          onSaved={formModal.project ? handleEditSaved : handleSaved}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete project?"
          message={`"${deleteTarget.title}" will be permanently removed. This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
