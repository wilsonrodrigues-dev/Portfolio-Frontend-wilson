export function fieldClass(hasError = false): string {
  return [
    'w-full bg-bg-color border rounded-md px-4 py-2.5 text-text-primary placeholder:text-text-muted',
    'focus:outline-none focus:border-accent-primary transition-colors disabled:opacity-50',
    hasError ? 'border-red-400/60' : 'border-border-color',
  ].join(' ');
}

export function primaryButtonClass(): string {
  return 'px-5 py-2.5 rounded-md bg-text-primary hover:bg-text-secondary transition-colors text-sm font-medium text-bg-color disabled:opacity-50';
}

export function secondaryButtonClass(): string {
  return 'px-5 py-2.5 rounded-md bg-glass-bg hover:bg-border-color transition-colors text-sm font-medium text-text-secondary hover:text-text-primary disabled:opacity-50';
}
