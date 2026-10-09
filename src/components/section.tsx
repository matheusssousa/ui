import * as React from 'react';
import { cn } from '../utils.js';

export interface SectionProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  bordered?: boolean;
}

export function Section({ title, description, icon, action, bordered = false, className, children, ...props }: SectionProps) {
  return (
    <section className={cn('space-y-4', bordered && 'rounded-xl border border-border bg-card p-4 sm:p-5', className)} {...props}>
      {(title || description || action) && (
        <header className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-2.5">
            {icon && <span className="mt-0.5 text-primary">{icon}</span>}
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


