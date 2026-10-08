export interface NoticeState {
  type: 'success' | 'error';
  message: string;
}

interface NoticeProps extends NoticeState {
  onClose: () => void;
}

export default function Notice({ type, message, onClose }: NoticeProps) {
  const isError = type === 'error';
  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`flex items-start justify-between gap-4 p-3 rounded-md border text-sm ${
        isError
          ? 'bg-red-500/10 border-red-500/20 text-red-400'
          : 'bg-green-500/10 border-green-500/20 text-green-400'
      }`}
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="shrink-0 leading-none hover:opacity-70 transition-opacity"
      >
        &times;
      </button>
    </div>
  );
}
