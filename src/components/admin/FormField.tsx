import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, htmlFor, required, hint, error, children }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-text-secondary mb-1">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-1 text-xs text-red-400">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1 text-xs text-text-muted">{hint}</p>
      )}
    </div>
  );
}
