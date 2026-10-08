import type { ReactNode } from 'react';
import { Loader2, Inbox, TriangleAlert } from 'lucide-react';

interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = 'Loading...' }: LoadingStateProps) {
  return (
    <div
      role="status"
      className="glass-panel p-12 flex flex-col items-center justify-center gap-3 text-center"
    >
      <Loader2 size={22} className="animate-spin text-accent-primary" />
      <p className="text-sm text-text-muted">{label}</p>
    </div>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 px-6 text-center">
      <div className="w-12 h-12 rounded-full bg-glass-bg border border-border-color flex items-center justify-center text-text-muted">
        {icon ?? <Inbox size={20} />}
      </div>
      <h3 className="font-display font-semibold text-text-primary">{title}</h3>
      <p className="text-sm text-text-muted max-w-sm">{description}</p>
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Something went wrong.', onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="glass-panel p-10 flex flex-col items-center gap-3 text-center"
    >
      <TriangleAlert size={22} className="text-red-400" />
      <p className="text-sm text-text-secondary">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 px-4 py-2 rounded-md bg-glass-bg hover:bg-border-color transition-colors text-sm font-medium text-text-secondary hover:text-text-primary"
        >
          Try again
        </button>
      )}
    </div>
  );
}
