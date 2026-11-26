import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils.js';
import { toneClasses, type UIColor } from './theme.js';

export const listItemVariants = cva(
  'flex min-w-0 items-center border border-transparent text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-card',
        outlined: 'border-border bg-card',
        soft: 'bg-muted/50',
        ghost: 'bg-transparent',
      },
      size: {
        sm: 'gap-2 rounded-lg px-2.5 py-2',
        md: 'gap-3 rounded-xl px-3 py-2.5',
        lg: 'gap-3.5 rounded-xl px-4 py-3.5',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  },
);

const iconSizes = {
  sm: 'size-8 rounded-md text-sm',
  md: 'size-10 rounded-lg text-base',
  lg: 'size-12 rounded-xl text-lg',
} as const;

/** Item de lista com ícone, título, descrição, badge e ação opcionais. */
export interface ListItemProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof listItemVariants> {
  /** Ícone exibido no início do item. */
  icon?: React.ReactNode;
  /** Título principal do item. */
  title?: React.ReactNode;
  /** Texto auxiliar abaixo do título. */
  description?: React.ReactNode;
  /** Badge exibido ao lado do título. */
  badge?: React.ReactNode;
  /** Ação exibida no final do item. */
  action?: React.ReactNode;
  /** Tone aplicado ao contêiner do ícone; padrão `default`. */
  color?: UIColor;
  /** Classes personalizadas para as partes internas do item. */
  slotClassNames?: Partial<Record<'icon' | 'content' | 'title' | 'description' | 'badge' | 'action', string>>;
}

const ListItem = React.forwardRef<HTMLDivElement, ListItemProps>(function ListItem(
  { icon, title, description, badge, action, color = 'default', variant, size = 'md', className, slotClassNames, ...props },
  ref,
) {
  return (
    <div ref={ref} className={cn(listItemVariants({ variant, size }), className)} {...props}>
      {icon && (
        <span
          className={cn('grid shrink-0 place-items-center', toneClasses[color].soft, iconSizes[size ?? 'md'], slotClassNames?.icon)}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}

      {(title || description || badge) && (
        <div className={cn('min-w-0 flex-1', slotClassNames?.content)}>
          {(title || badge) && (
            <div className="flex min-w-0 items-center gap-2">
              {title && (
                <div className={cn('min-w-0 truncate text-sm font-semibold leading-tight', toneClasses[color].text, slotClassNames?.title)}>
                  {title}
                </div>
              )}
              {badge && <div className={cn('shrink-0', slotClassNames?.badge)}>{badge}</div>}
            </div>
          )}
          {description && <div className={cn('mt-1 text-xs leading-snug text-muted-foreground', slotClassNames?.description)}>{description}</div>}
        </div>
      )}

      {action && <div className={cn('ml-auto shrink-0', slotClassNames?.action)}>{action}</div>}
    </div>
  );
});

ListItem.displayName = 'ListItem';

export { ListItem };
