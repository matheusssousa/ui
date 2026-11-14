'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';

import { cn } from '../utils.js';
import { toneClasses, type UIColor } from './theme.js';
import { getGradientStyle, type UIGradientValue } from './gradient.js';
const initials = (value: string, limit = 2) => value.trim().split(/\s+/).slice(0, limit).map(part => part[0]?.toLocaleUpperCase('pt-BR')).join('');

const avatarVariants = cva('relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full font-semibold ring-offset-background', {
  variants: {
    variant: {
      default: 'bg-muted text-foreground', primary: 'bg-primary text-primary-foreground', secondary: 'bg-secondary text-secondary-foreground',
      gradient: 'bg-gradient-to-br from-primary to-secondary text-white', tertiary: 'bg-tertiary text-tertiary-foreground',
      outline: 'border border-border bg-background text-foreground', success: 'bg-success/15 text-success',
    },
    size: { xs: 'size-5 text-[9px]', sm: 'size-8 text-xs', md: 'size-10 text-sm', lg: 'size-12 text-base', xl: 'size-16 text-lg' },
  },
  defaultVariants: { variant: 'default', size: 'sm' },
});

/** Avatar com imagem ou iniciais; `color` define a cor do fallback. */
export interface AvatarProps extends Omit<HTMLMotionProps<'span'>, 'children'>, VariantProps<typeof avatarVariants> {
  /** Nome usado nas iniciais e como texto alternativo padrão. */
  name?: string | null;
  /** URL da imagem; quando ausente, mostra `fallback` ou iniciais. */
  src?: string | null;
  /** Texto alternativo da imagem. */
  alt?: string;
  /** Conteúdo exibido quando não há imagem. */
  fallback?: React.ReactNode;
  /** Cor do fallback; sobrepõe as variantes de cor, exceto `outline` e `gradient`. */
  color?: UIColor;
  /** Indicador de presença no canto do avatar. */
  status?: 'online' | 'offline' | 'busy' | 'away';
  /** Anima o avatar ao passar o mouse ou pressionar. */
  interactive?: boolean;
  /** Preset compartilhado usado por `variant="gradient"`. */
  gradient?: UIGradientValue;
}

const statusClasses = { online: 'bg-success', offline: 'bg-muted-foreground', busy: 'bg-destructive', away: 'bg-warning' };

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(function Avatar({ className, variant, size, name, src, alt, fallback, color, status, interactive = false, gradient, style, ...props }, ref) {
  const reducedMotion = useReducedMotion();
  const [failedSrc, setFailedSrc] = React.useState<string | null>(null);
  const resolvedName = name ?? 'Usuário';
  return (
    <motion.span ref={ref} whileHover={interactive && !reducedMotion ? { scale: 1.06 } : undefined} whileTap={interactive && !reducedMotion ? { scale: 0.96 } : undefined} className={cn(avatarVariants({ variant, size }), color && variant !== 'outline' && variant !== 'gradient' && (variant === 'success' ? toneClasses[color].soft : toneClasses[color].solid), interactive && 'cursor-pointer', className)} style={variant === 'gradient' && gradient ? { ...getGradientStyle(gradient), ...style } : style} {...props}>
      {src && src !== failedSrc ? <img src={src} alt={alt ?? resolvedName} onError={() => setFailedSrc(src)} className="size-full object-cover" /> : <span role="img" aria-label={alt ?? resolvedName}>{fallback ?? (initials(resolvedName, 2) || 'U')}</span>}
      {status && <span className={cn('absolute bottom-0 right-0 size-[28%] rounded-full border-2 border-background', statusClasses[status])} aria-label={status} />}
    </motion.span>
  );
});

Avatar.displayName = 'Avatar';
export { Avatar, avatarVariants };

/** Composição de Avatar com sobreposição e legenda opcional. */
export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  avatars: AvatarProps[];
  max?: number;
  size?: AvatarProps['size'];
  overlap?: 'sm' | 'md' | 'lg';
  label?: React.ReactNode;
  description?: React.ReactNode;
  accessory?: React.ReactNode;
}
export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroup({ avatars, max = 4, size = 'md', overlap = 'md', label, description, accessory, className, ...props }, ref) {
  const limit = Number.isFinite(max) ? Math.max(1, Math.floor(max)) : 4;
  const hidden = Math.max(0, avatars.length - limit);
  return <div ref={ref} className={cn('flex min-w-0 flex-col items-center gap-2', className)} {...props}>
    <div className="ui-avatar-group flex max-w-full flex-wrap items-center" data-overlap={overlap}>
      {avatars.slice(0, limit).map((avatar, index) => <Avatar key={index} size={size} {...avatar} className={cn('ring-2 ring-background', avatar.className)} />)}
      {hidden > 0 && <Avatar size={size} name={`${hidden} pessoas adicionais`} fallback={`+${hidden}`} className="ring-2 ring-background" />}
    </div>
    {label && <div className="flex max-w-full items-center gap-2 text-sm font-medium"><span className="min-w-0 break-words">{label}</span>{accessory}</div>}
    {description && <div className="text-xs text-muted-foreground">{description}</div>}
  </div>;
});




