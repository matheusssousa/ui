import * as React from 'react';
import { cn } from '../utils.js';

/** Rótulo, ajuda e erro para um controle de formulário filho. */
export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Rótulo acima do controle. */
  label?: React.ReactNode;
  /** ID do controle associado ao rótulo. */
  htmlFor?: string;
  /** Texto de ajuda quando não há erro. */
  description?: React.ReactNode;
  /** Mensagem de erro com `role="alert"`. */
  error?: React.ReactNode;
  /** Marca o campo como obrigatório. */
  required?: boolean;
  /** Texto para campos não obrigatórios. */
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



