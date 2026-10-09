'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Toast, type ToastProps } from '../components/toast.js';
import { createPortal } from 'react-dom';

type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'default';

export interface ToastContextType { addToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => string; removeToast: (id: string) => void; success: (title: string, description?: string, options?: Partial<ToastProps>) => string; error: (title: string, description?: string, options?: Partial<ToastProps>) => string; warning: (title: string, description?: string, options?: Partial<ToastProps>) => string; info: (title: string, description?: string, options?: Partial<ToastProps>) => string; }

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastWithState extends ToastProps {
  isVisible: boolean;
  timeoutId?: ReturnType<typeof setTimeout>;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastWithState[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const toastCache = useRef<Set<string>>(new Set());

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => {
      const toast = prev.find(t => t.id === id);
      if (toast?.timeoutId) {
        clearTimeout(toast.timeoutId);
      }
      
      return prev.map(toast => 
        toast.id === id 
          ? { ...toast, isVisible: false }
          : toast
      );
    });

    // Remove completely after animation
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
      toastCache.current.delete(id);
    }, 300);
  }, []);

  const addToast = useCallback((toastData: Omit<ToastProps, 'id' | 'onClose'>) => {
    // Criar um hash único baseado no conteúdo do toast para evitar duplicatas
    const contentHash = `${toastData.variant}-${toastData.title}-${toastData.description}`;
    
    // Verificar se já existe um toast similar nos últimos 3000ms (3 segundos)
    if (toastCache.current.has(contentHash)) {
      return contentHash; // Retorna o hash existente sem criar novo toast
    }

    const id = Math.random().toString(36).substr(2, 9);
    const duration = toastData.duration || 5000;

    // Adicionar ao cache por um tempo mais longo
    toastCache.current.add(contentHash);
    setTimeout(() => {
      toastCache.current.delete(contentHash);
    }, 3000); // Aumentei para 3 segundos

    const toast: ToastWithState = {
      ...toastData,
      id,
      isVisible: false,
      onClose: () => removeToast(id),
    };

    setToasts(prev => [...prev, toast]);

    // Show toast after a brief delay for smooth animation
    setTimeout(() => {
      setToasts(prev => 
        prev.map(t => t.id === id ? { ...t, isVisible: true } : t)
      );
    }, 50);

    // Auto-remove after duration
    if (duration > 0) {
      const timeoutId = setTimeout(() => {
        removeToast(id);
      }, duration);

      setToasts(prev => 
        prev.map(t => t.id === id ? { ...t, timeoutId } : t)
      );
    }

    return id;
  }, [removeToast]);

  const createToastMethod = useCallback(
    (variant: ToastVariant) => 
    (title: string, description?: string, options?: Partial<ToastProps>) => {
      return addToast({
        variant,
        title,
        description,
        ...options,
      });
    },
    [addToast]
  );

  const success = createToastMethod('success');
  const error = createToastMethod('error');
  const warning = createToastMethod('warning');
  const info = createToastMethod('info');

  const value: ToastContextType = {
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {isMounted && createPortal(
        <div className="fixed z-[100] flex flex-col gap-2 pointer-events-none">
          {/* Mobile: top center */}
          <div className="md:hidden fixed top-4 left-4 right-4 flex flex-col gap-2 pointer-events-auto">
            {toasts.map((toast) => {
              const { timeoutId, ...toastProps } = toast;
              return <Toast key={toast.id} {...toastProps} />;
            })}
          </div>
          
          {/* Desktop: top right */}
          <div className="hidden md:block fixed top-4 right-4 w-96 flex-col gap-2 pointer-events-auto">
            {toasts.map((toast) => {
              const { timeoutId, ...toastProps } = toast;
              return <Toast key={toast.id} {...toastProps} />;
            })}
          </div>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToastContext(): ToastContextType {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}

