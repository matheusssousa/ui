'use client';

import { useActionState, useCallback, useEffect, useRef, useState } from 'react';
import type { ApiNotifier } from './useApi.js';

export interface ActionResponse<T> {
  success?: boolean; data?: T; error?: string; errors?: Record<string, string[]>; message?: string;
  showSuccessToast?: boolean; showErrorToast?: boolean;
}
export interface UseActionOptions<T> {
  notifier?: ApiNotifier;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (data: T | undefined) => void;
  onError?: (message: string) => void;
}

export function useAction<T>(action: (previous: ActionResponse<T> | undefined, formData: FormData) => Promise<ActionResponse<T>>, options: UseActionOptions<T> = {}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [errors, setErrors] = useState(state?.errors);
  const processed = useRef<ActionResponse<T> | undefined>(undefined);
  const latest = useRef(options);
  latest.current = options;
  useEffect(() => setErrors(state?.errors), [state?.errors]);
  useEffect(() => {
    if (!state || state === processed.current) return;
    processed.current = state;
    const current = latest.current;
    if (state.success) {
      if (state.showSuccessToast !== false) current.notifier?.success('Sucesso', current.successMessage ?? state.message ?? 'Operação realizada com sucesso!');
      current.onSuccess?.(state.data);
    } else if (state.success === false) {
      const message = state.error ?? current.errorMessage ?? 'Erro ao processar a solicitação.';
      if (state.showErrorToast !== false) current.notifier?.error('Erro', message);
      current.onError?.(message);
    }
  }, [state]);
  const clearFieldError = useCallback((field: string) => setErrors(previous => {
    if (!previous?.[field]) return previous;
    const next = { ...previous }; delete next[field]; return next;
  }), []);
  return { state, formAction, pending, isSuccess: state?.success === true, isError: state?.success === false,
    data: state?.data, error: state?.error, errors, clearFieldError };
}
