'use client';

import React from 'react';
import { CheckCircleIcon, InfoIcon, WarningCircleIcon, XCircleIcon, XIcon } from '@phosphor-icons/react/dist/ssr';
import { cn } from '../utils.js';




export interface ToastProps { id: string; variant?: 'success' | 'error' | 'warning' | 'info' | 'default'; title?: string; description?: string; duration?: number; action?: React.ReactNode; onClose?: () => void; isVisible?: boolean; }

const Toast = React.forwardRef<HTMLDivElement, ToastProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ 
    id, 
    variant = 'default', 
    title, 
    description, 
    duration,
    action, 
    onClose, 
    isVisible = true,
    className,
    ...domProps 
  }, ref) => {
    const {
      onPointerDown: onPointerDownProp,
      onPointerMove: onPointerMoveProp,
      onPointerUp: onPointerUpProp,
      onPointerCancel: onPointerCancelProp,
      style: domStyle,
      ...restDomProps
    } = domProps;

    const toastElementRef = React.useRef<HTMLDivElement | null>(null);
    const pointerStartRef = React.useRef({ x: 0, y: 0 });
    const gestureLockRef = React.useRef<'horizontal' | 'vertical' | null>(null);

    const [dragOffsetX, setDragOffsetX] = React.useState(0);
    const [isDragging, setIsDragging] = React.useState(false);
    const [isSwipeClosing, setIsSwipeClosing] = React.useState(false);

    const setRefs = React.useCallback((node: HTMLDivElement | null) => {
      toastElementRef.current = node;

      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }, [ref]);

    const resetSwipeState = React.useCallback(() => {
      setIsDragging(false);
      setDragOffsetX(0);
      gestureLockRef.current = null;
    }, []);

    const dismissBySwipe = React.useCallback((direction: number) => {
      const width = toastElementRef.current?.offsetWidth ?? 320;

      setIsSwipeClosing(true);
      setIsDragging(false);
      setDragOffsetX(direction * (width + 48));

      window.setTimeout(() => {
        onClose?.();
      }, 120);
    }, [onClose]);

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      onPointerDownProp?.(event);

      if (!isVisible || isSwipeClosing) {
        return;
      }

      if (event.pointerType === 'mouse' && event.button !== 0) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target?.closest('button, a, input, textarea, select, label, [role="button"], [data-no-toast-swipe="true"]')) {
        return;
      }

      pointerStartRef.current = { x: event.clientX, y: event.clientY };
      gestureLockRef.current = null;
      setIsDragging(true);
      setIsSwipeClosing(false);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      onPointerMoveProp?.(event);

      if (!isDragging) {
        return;
      }

      const deltaX = event.clientX - pointerStartRef.current.x;
      const deltaY = event.clientY - pointerStartRef.current.y;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (gestureLockRef.current === null && (absX > 6 || absY > 6)) {
        gestureLockRef.current = absX > absY ? 'horizontal' : 'vertical';
      }

      if (gestureLockRef.current === 'vertical') {
        resetSwipeState();
        return;
      }

      setDragOffsetX(deltaX);
    };

    const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
      onPointerUpProp?.(event);

      if (!isDragging) {
        gestureLockRef.current = null;
        return;
      }

      const width = toastElementRef.current?.offsetWidth ?? 320;
      const closeThreshold = Math.min(140, Math.max(72, width * 0.28));

      if (Math.abs(dragOffsetX) >= closeThreshold) {
        dismissBySwipe(dragOffsetX >= 0 ? 1 : -1);
        return;
      }

      resetSwipeState();
    };

    const handlePointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
      onPointerCancelProp?.(event);
      resetSwipeState();
    };

    const toastStyle: React.CSSProperties = {
      ...(domStyle ?? {}),
      touchAction: 'pan-y',
    };

    if (isDragging || isSwipeClosing || dragOffsetX !== 0) {
      toastStyle.transform = `translateX(${dragOffsetX}px)`;
      toastStyle.opacity = Math.max(0.35, 1 - Math.min(Math.abs(dragOffsetX) / 220, 0.65));
    }

    const variants = {
      default: {
        container: 'bg-background border-border text-foreground',
        icon: null,
      },
      success: {
        container: 'bg-success/10 border-success/25 text-success',
        icon: <CheckCircleIcon size={20} weight="fill" aria-hidden="true" />,
      },
      error: {
        container: 'bg-destructive/10 border-destructive/25 text-destructive',
        icon: <XCircleIcon size={20} weight="fill" aria-hidden="true" />,
      },
      warning: {
        container: 'bg-warning/10 border-warning/25 text-warning',
        icon: <WarningCircleIcon size={20} weight="fill" aria-hidden="true" />,
      },
      info: {
        container: 'bg-info/10 border-info/25 text-info',
        icon: <InfoIcon size={20} weight="fill" aria-hidden="true" />,
      },
    };

    const currentVariant = variants[variant];

    return (
      <div
        ref={setRefs}
        className={cn(
          // Base styles
          'group relative flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm font-medium mb-1',
          // Animation styles
          'transition-all ease-in-out transform will-change-transform',
          isDragging ? 'duration-0 cursor-grabbing select-none' : 'duration-300 cursor-grab',
          // Entry animation
          isVisible 
            ? 'translate-x-0 opacity-100 scale-100' 
            : 'translate-x-full opacity-0 scale-95',
          // Hover effects
          !isDragging && 'hover:shadow-xl hover:scale-[1.02]',
          // Variant styles
          currentVariant.container,
          className
        )}
        role="alert"
        aria-live="polite"
        style={toastStyle}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerCancel}
        {...restDomProps}
      >
        {/* Icon */}
        {currentVariant.icon && (
          <div className="flex-shrink-0 mt-0.5">
            {currentVariant.icon}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 space-y-1">
          {title && (
            <h4 className="text-sm font-medium leading-none">
              {title}
            </h4>
          )}
          {description && (
            <p className="text-sm opacity-90 leading-relaxed">
              {description}
            </p>
          )}
          {action && (
            <div className="mt-2">
              {action}
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          onPointerDown={(event) => event.stopPropagation()}
          onClick={onClose}
          className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/5"
          aria-label="Fechar notificação"
        >
          <XIcon size={16} aria-hidden="true" />
        </button>
      </div>
    );
  }
);

Toast.displayName = 'Toast';

export { Toast };






