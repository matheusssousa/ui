import * as React from 'react';
import { cn } from '../utils.js';
import { toneClasses, type UIColor } from './theme.js';

/** Bloco de conteúdo com cabeçalho opcional e destaque por tone. */
export interface SectionProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** Título da seção. */
  title?: React.ReactNode;
  /** Texto auxiliar abaixo do título. */
  description?: React.ReactNode;
  /** Ícone exibido antes do título. */
  icon?: React.ReactNode;
  /** Ação alinhada à direita do cabeçalho. */
  action?: React.ReactNode;
  /** Adiciona borda, fundo de card e espaçamento interno. */
  bordered?: boolean;
  /** Tone do ícone; padrão `primary`. */
  color?: UIColor;
}

export function Section({ title, description, icon, action, bordered = false, color = 'primary', className, children, ...props }: SectionProps) {
  return (
    <section className={cn('space-y-4', bordered && 'rounded-xl border border-border bg-card p-4 sm:p-5', className)} {...props}>
      {(title || description || action) && (
        <header className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-2.5">
            {icon && <span className={cn('mt-0.5', toneClasses[color].text)}>{icon}</span>}
            <div>
              {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
              {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      {children}
    </section>
  );
}


