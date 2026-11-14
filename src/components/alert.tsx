'use client';

import * as React from 'react';
import { CheckCircleIcon, InfoIcon, WarningCircleIcon, XCircleIcon, XIcon } from '@phosphor-icons/react/dist/ssr';
import { cn } from '../utils.js';
import { MotionBox, type MotionBoxProps, type MotionPreset } from './motion.js';
import { toneClasses, type UIColor } from './theme.js';

const defaultIcons: Partial<Record<UIColor, React.ReactNode>> = {
  success: <CheckCircleIcon weight="fill" />,
  warning: <WarningCircleIcon weight="fill" />,
  danger: <XCircleIcon weight="fill" />,
  info: <InfoIcon weight="fill" />,
};

/** Aviso com tone semântico, ícone, ação e animação opcionais. */
export interface AlertProps extends Omit<MotionBoxProps, 'title' | 'color' | 'children' | 'preset'> {
  /** Título do aviso. */
  title?: React.ReactNode;
  /** Descrição abaixo do título. */
  description?: React.ReactNode;
  /** Tone do fundo suave, borda e texto; padrão `info`. */
  color?: UIColor;
  /** Ícone personalizado; `false` o oculta. */
  icon?: React.ReactNode | false;
  /** Ação exibida ao lado do conteúdo. */
  action?: React.ReactNode;
  /** Exibe o botão de fechar e recebe seu clique. */
  onDismiss?: () => void;
  /** Preset de animação de entrada. */
  motionPreset?: MotionPreset;
  /** Conteúdo adicional do aviso. */
  children?: React.ReactNode;
  variant?: 'soft' | 'outlined' | 'glow';
  contentLayout?: 'stacked' | 'inline';
  iconClassName?: string;
}

export function Alert({ title, description, color = 'info', icon, action, onDismiss, motionPreset = 'fade-down', className, children, variant = 'soft', contentLayout = 'stacked', iconClassName, ...props }: AlertProps) {
  const renderedIcon = icon === false ? null : icon ?? defaultIcons[color] ?? <InfoIcon weight="fill" />;
  return (
    <MotionBox
      role={color === 'danger' ? 'alert' : 'status'}
      preset={motionPreset}
      className={cn('flex min-w-0 items-start gap-3 rounded-xl border p-4', contentLayout === 'inline' ? 'flex-row flex-wrap' : 'flex-col', variant === 'soft' && toneClasses[color].soft, variant === 'outlined' && 'bg-transparent', toneClasses[color].outline, variant === 'glow' && 'ui-surface-glow text-foreground', className)}
      {...props}
    >
      {renderedIcon && <span className={cn('mt-0.5 flex shrink-0 items-center justify-center text-lg', variant === 'glow' ? 'size-9 rounded-xl bg-primary/15 text-primary-text' : 'size-5', iconClassName)}>{renderedIcon}</span>}
      <div className="min-w-0 flex-1">
        {title && <p className="text-sm font-semibold">{title}</p>}
        {description && <div className="mt-0.5 text-xs leading-relaxed opacity-85">{description}</div>}
        {children}
      </div>
      {action}
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Fechar aviso" className="grid size-11 shrink-0 place-items-center rounded-md opacity-70 transition hover:bg-black/5 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-ring dark:hover:bg-white/10">
          <XIcon size={15} />
        </button>
      )}
    </MotionBox>
  );
}


