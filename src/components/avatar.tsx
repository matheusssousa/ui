'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, type HTMLMotionProps } from 'framer-motion';

import { cn } from '../utils.js';
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

export interface AvatarProps extends Omit<HTMLMotionProps<'span'>, 'children'>, VariantProps<typeof avatarVariants> {
  name?: string | null;
  src?: string | null;
  alt?: string;
  fallback?: React.ReactNode;
  status?: 'online' | 'offline' | 'busy' | 'away';
  interactive?: boolean;
}

const statusClasses = { online: 'bg-success', offline: 'bg-muted-foreground', busy: 'bg-destructive', away: 'bg-warning' };

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(function Avatar({ className, variant, size, name, src, alt, fallback, status, interactive = false, ...props }, ref) {

  const resolvedName = name ?? 'Usuário';
  return (
    <motion.span ref={ref} whileHover={interactive ? { scale: 1.06 } : undefined} whileTap={interactive ? { scale: 0.96 } : undefined} className={cn(avatarVariants({ variant, size }), interactive && 'cursor-pointer', className)} {...props}>
      {src ? <img src={src} alt={alt ?? resolvedName} className="size-full object-cover" /> : fallback ?? initials(resolvedName, 2) ?? 'U'}
      {status && <span className={cn('absolute bottom-0 right-0 size-[28%] rounded-full border-2 border-background', statusClasses[status])} aria-label={status} />}
    </motion.span>
  );
});

Avatar.displayName = 'Avatar';
export { Avatar, avatarVariants };




