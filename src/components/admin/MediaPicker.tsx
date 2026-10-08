import { useRef, useState } from 'react';
import { ImagePlus, Images, X } from 'lucide-react';
import api from '../../services/api';
import { getApiErrorMessage } from '../../utils/apiError';
import { resolveMediaUrl, validateImageFile } from '../../utils/media';
import { secondaryButtonClass } from './formStyles';
import MediaLibraryDialog from './MediaLibraryDialog';

interface MediaPickerProps {
  value?: string;
  onChange: (url: string) => void;
}

export default function MediaPicker({ value, onChange }: MediaPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);

  async function handleFileSelected(file: File | undefined) {
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
      if (res.data.success && res.data.data?.url) {
        onChange(res.data.data.url);
      } else {
        setError(res.data.message || 'Upload failed.');
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Upload failed.'));
    } finally {
      setUploading(false);
      setProgress(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  const previewSrc = resolveMediaUrl(value);

  return (
    <div className="rounded-md border border-border-color bg-bg-color p-3 space-y-3">
      {previewSrc ? (
        <div className="flex items-center gap-3">
          <img
            src={previewSrc}
            alt=""
            className="w-24 h-16 rounded border border-border-color object-cover bg-bg-color shrink-0"
          />
          <span className="text-xs text-text-muted break-all">{value}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <ImagePlus size={16} />
          No image selected.
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          className="hidden"
          aria-label="Upload image file"
          onChange={(e) => handleFileSelected(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`${secondaryButtonClass()} flex items-center gap-1.5`}
        >
          <ImagePlus size={14} />
          {uploading ? 'Uploading...' : previewSrc ? 'Replace image' : 'Upload image'}
        </button>
        <button
          type="button"
          onClick={() => setLibraryOpen(true)}
          disabled={uploading}
          className={`${secondaryButtonClass()} flex items-center gap-1.5`}
        >
          <Images size={14} />
          Choose existing
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            disabled={uploading}
            className="flex items-center gap-1 px-3 py-2.5 rounded-md text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
          >
            <X size={14} />
            Remove
          </button>
        )}
      </div>

      {uploading && (
        <div role="status" className="space-y-1">
          <div className="h-1.5 rounded-full bg-border-color overflow-hidden">
            <div
              className="h-full bg-accent-primary transition-all"
              style={{ width: `${progress ?? 0}%` }}
            />
          </div>
          <p className="text-xs text-text-muted">Uploading... {progress ?? 0}%</p>
        </div>
      )}

      {error && (
        <p role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}

      {libraryOpen && (
        <MediaLibraryDialog
          onSelect={(url) => {
            onChange(url);
            setLibraryOpen(false);
          }}
          onClose={() => setLibraryOpen(false)}
        />
      )}
    </div>
  );
}
