'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils.js';
import { getStatusMeta } from '../functions/getStatusBadge.js';
import { toneClasses, type UIColor } from './theme.js';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:'border-transparent bg-primary/30 text-primary-text hover:bg-primary/50',
        secondary:'border-transparent bg-secondary/30 text-secondary-text hover:bg-secondary/50',
        tertiary:'border-transparent bg-tertiary/30 text-tertiary-text hover:bg-tertiary/50',
        destructive:'border-transparent bg-destructive/30 text-destructive hover:bg-destructive/50',
        success:'border-transparent bg-success/10 text-success hover:bg-success/15',
        warning:'border-transparent bg-warning/10 text-warning hover:bg-warning/15',
        info:'border-transparent bg-info/10 text-info hover:bg-info/15',
        outline: 'text-foreground',
        gradient:'border-transparent bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/80 hover:to-secondary/80',
        muted:'border-transparent bg-muted/50 text-muted-foreground hover:bg-muted/70',
        neutral:'border-transparent bg-neutral/10 text-neutral',
        purple:'border-transparent bg-violet/10 text-violet',
        cyan:'border-transparent bg-cyan/10 text-cyan',

        // Variantes de status
        scheduled: 'border-transparent bg-info/10 text-info hover:bg-info/15',
        completed: 'border-transparent bg-success/10 text-success hover:bg-success/15',
        cancelled: 'border-transparent bg-destructive/10 text-destructive hover:bg-destructive/15',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
        xs: 'px-1 py-0.5 text-[0.625rem]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const indicatorColors: Record<string, string> = {
  success: 'bg-success', destructive: 'bg-destructive', warning: 'bg-warning',
  scheduled: 'bg-info', info: 'bg-info', default: 'bg-muted-foreground',
  secondary: 'bg-secondary', tertiary: 'bg-tertiary',
};

/** Rótulo ou indicador de status; `color` aplica um tone suave ao badge. */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLElement>,
  VariantProps<typeof badgeVariants> {
  /** Cor do badge; quando informada, prevalece sobre a cor de `variant` e `status`. */
  color?: UIColor;
  /** Ícone à esquerda do texto */
  leftIcon?: React.ReactNode;
  /** Ícone à direita do texto */
  rightIcon?: React.ReactNode;
  /** Se true, torna o badge clicável */
  clickable?: boolean;
  /** Função chamada quando o badge é clicado */
  onBadgeClick?: (e: React.MouseEvent<HTMLElement>) => void;
  /** Se true, adiciona um ponto indicador */
  dot?: boolean;
  /** Usa bordas totalmente arredondadas. */
  pill?: boolean;
  /** Anima a entrada e o hover do badge. */
  animated?: boolean;
  /** Anima o ponto indicador. */
  pulse?: boolean;
  /** Código de status resolvido por `getStatusMeta`. */
  status?: string | null;
  /** Mostra o badge completo ou apenas o indicador. */
  display?: 'badge' | 'indicator';
  /** Oculta o texto visível, preservando o rótulo acessível no indicador. */
  showLabel?: boolean;
}

function Badge({
  className,
  variant,
  color,
  size,
  children,
  leftIcon,
  rightIcon,
  clickable = false,
  onBadgeClick,
  dot = false,
  pill = false,
  animated = true,
  pulse = false,
  status,
  display = 'badge',
  showLabel = true,
  ...props
}: BadgeProps) {
  const meta = status === undefined ? null : getStatusMeta(status);
  const resolvedVariant = meta?.variant ?? variant;
  const content = children ?? (showLabel ? meta?.label : undefined);
  if (display === 'indicator') {
    return <span className={cn('inline-flex items-center gap-2 text-xs text-muted-foreground', className)} {...props}>
      <span className="relative flex size-2.5" aria-hidden="true">
        {pulse && <span className={cn('absolute inline-flex size-full animate-ping rounded-full opacity-40', color ? toneClasses[color].fill : indicatorColors[resolvedVariant ?? 'default'])} />}
        <span className={cn('relative inline-flex size-2.5 rounded-full', color ? toneClasses[color].fill : indicatorColors[resolvedVariant ?? 'default'])} />
      </span>
      {content && <span>{content}</span>}
      {!content && <span className="sr-only">{meta?.label ?? 'Status'}</span>}
    </span>;
  }
  const Component = clickable ? 'button' : 'div';

  const badge = (
    <Component
      className={cn(
        badgeVariants({ variant: color ? 'outline' : resolvedVariant, size }),
        color && toneClasses[color].soft,
        color && toneClasses[color].outline,
        clickable && 'cursor-pointer hover:scale-105 active:scale-95',
        pill && 'rounded-full',
        className
      )}
      onClick={clickable ? onBadgeClick : undefined}
      {...props}
    >
      {/* Dot indicator */}
      {dot && (
        <span className="relative mr-1.5 flex h-2 w-2">
        {pulse && <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-40" />}
        <span
          className={cn(
            'relative inline-flex h-2 w-2 rounded-full',
            color && toneClasses[color].fill,
            !color && resolvedVariant === 'success' && 'bg-success',
            !color && resolvedVariant === 'warning' && 'bg-warning',
            !color && resolvedVariant === 'destructive' && 'bg-destructive',
            !color && resolvedVariant === 'info' && 'bg-info',
            !color && resolvedVariant === 'default' && 'bg-primary-text',
            !color && resolvedVariant === 'secondary' && 'bg-secondary-text',
            !color && resolvedVariant === 'outline' && 'bg-foreground',
            !color && resolvedVariant === 'tertiary' && 'bg-tertiary-text',
            !color && resolvedVariant === 'gradient' && 'bg-white'
          )}
        />
        </span>
      )}

      {/* Left icon */}
      {leftIcon && (
        <span className="mr-1 flex-shrink-0">
          {leftIcon}
        </span>
      )}

      {/* Content */}
      <span className="truncate">{content}</span>

      {/* Right icon */}
      {rightIcon && (
        <span className="ml-1 flex-shrink-0">
          {rightIcon}
        </span>
      )}
    </Component>
  );

  return animated ? <motion.span className="inline-flex" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} whileHover={clickable ? { y: -1 } : undefined}>{badge}</motion.span> : badge;
}

// Componentes auxiliares para casos comuns
function StatusBadge({
  status,
  className,
  ...props
}: {
  status: 'active' | 'inactive' | 'pending' | 'verified' | 'blocked';
} & Omit<BadgeProps, 'children' | 'variant'>) {
  const statusConfig = {
    active: { variant: 'success' as const, label: 'Ativo' },
    inactive: { variant: 'secondary' as const, label: 'Inativo' },
    pending: { variant: 'warning' as const, label: 'Pendente' },
    verified: { variant: 'success' as const, label: 'Verificado' },
    blocked: { variant: 'destructive' as const, label: 'Bloqueado' },
  };

  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      dot
      className={className}
      {...props}
    >
      {config.label}
    </Badge>
  );
}

function RoleBadge({
  role,
  className,
  ...props
}: {
  role: string;
} & Omit<BadgeProps, 'children'>) {
  const getRoleVariant = (role: string) => {
    const lowerRole = role.toLowerCase();
    if (lowerRole.includes('admin') || lowerRole.includes('super')) {
      return 'destructive' as const;
    }
    if (lowerRole.includes('manager') || lowerRole.includes('gerente')) {
      return 'warning' as const;
    }
    if (lowerRole.includes('user') || lowerRole.includes('cliente')) {
      return 'info' as const;
    }
    return 'secondary' as const;
  };

  return (
    <Badge
      variant={getRoleVariant(role)}
      className={className}
      {...props}
    >
      {role}
    </Badge>
  );
}

function CountBadge({
  count,
  maxCount = 99,
  showZero = false,
  className,
  ...props
}: {
  count: number;
  maxCount?: number;
  showZero?: boolean;
} & Omit<BadgeProps, 'children'>) {
  if (count === 0 && !showZero) {
    return null;
  }

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <Badge
      variant="destructive"
      size="sm"
      className={cn('min-w-[1.25rem] justify-center', className)}
      {...props}
    >
      {displayCount}
    </Badge>
  );
}

export { Badge, StatusBadge, RoleBadge, CountBadge, badgeVariants };



