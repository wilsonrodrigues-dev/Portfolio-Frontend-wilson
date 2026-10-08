import { useEffect, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import api from '../../services/api';
import { getApiErrorMessage } from '../../utils/apiError';
import type { MediaItem, PaginatedMeta } from '../../types/cms';
import { LoadingState, EmptyState, ErrorState } from './AdminStates';
import { resolveMediaUrl } from '../../utils/media';
import { secondaryButtonClass } from './formStyles';

interface MediaLibraryDialogProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export default function MediaLibraryDialog({ onSelect, onClose }: MediaLibraryDialogProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMedia = async () => {
      try {
        const res = await api.get('/media', { params: { page, limit: 24 } });
        if (res.data.success) {
          setItems(res.data.data ?? []);
          setMeta(res.data.meta ?? null);
          setError(null);
        } else {
          setError(res.data.message || 'Unable to load media.');
        }
      } catch (err) {
        setError(getApiErrorMessage(err, 'Unable to load media.'));
      } finally {
        setLoading(false);
      }
    };

    loadMedia();
  }, [page, reloadKey]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="media-library-title"
        className="glass-panel w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6"
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 id="media-library-title" className="font-display text-lg font-semibold">
              Media library
            </h3>
            <p className="text-sm text-text-muted mt-1">Select an image to use.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close media library"
            className="text-text-muted hover:text-text-primary transition-colors leading-none text-xl"
          >
            &times;
          </button>
        </div>

        {loading ? (
          <LoadingState label="Loading media..." />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => {
              setLoading(true);
              setError(null);
              setReloadKey((key) => key + 1);
            }}
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<ImagePlus size={20} />}
            title="No images yet"
            description="Images you upload from a form field will appear here."
          />
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {items.map((item) => {
                const src = resolveMediaUrl(item.url);
                if (!src) return null;
                return (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => onSelect(item.url)}
                    title={item.originalname}
                    className="group aspect-square rounded-md overflow-hidden border border-border-color bg-bg-color focus:outline-none focus:border-accent-primary transition-colors"
                  >
                    <img
                      src={src}
                      alt={item.altText || item.originalname}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                    />
                  </button>
                );
              })}
            </div>

            {meta && meta.pages > 1 && (
              <div className="flex items-center justify-between mt-5 text-sm">
                <span className="text-text-muted">
                  Page {meta.page} of {meta.pages} &middot; {meta.total} total
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page <= 1 || loading}
                    className={`${secondaryButtonClass()} disabled:opacity-40`}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= meta.pages || loading}
                    className={`${secondaryButtonClass()} disabled:opacity-40`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex justify-end gap-3 pt-5 mt-5 border-t border-border-color">
          <button type="button" onClick={onClose} className={secondaryButtonClass()}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
