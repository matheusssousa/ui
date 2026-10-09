import * as React from 'react';
import { cn } from '../utils.js';

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  htmlFor?: string;
  description?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  optionalLabel?: string;
}

export function FormField({ label, htmlFor, description, error, required, optionalLabel = 'Opcional', className, children, ...props }: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)} {...props}>
      {label && (
        <div className="flex items-center justify-between gap-2">
          <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
            {label}{required && <span className="ml-0.5 text-destructive" aria-hidden="true">*</span>}
          </label>
          {!required && optionalLabel && <span className="text-[11px] text-muted-foreground">{optionalLabel}</span>}
        </div>
      )}
      {children}
      {error ? <p role="alert" className="text-xs text-destructive">{error}</p> : description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
    </div>
  );
}



