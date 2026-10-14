'use client';

import { useCallback, useRef, useState } from 'react';
import { resolveHttpError, type HttpClient, type HttpRequestOptions } from '../functions/http.js';

export interface ApiNotifier { success: (title: string, message: string) => void; error: (title: string, message: string) => void }
export interface UseApiOptions extends HttpRequestOptions {
  successMessage?: string;
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useApi(client: HttpClient, notifier?: ApiNotifier) {
  const [isLoading, setIsLoading] = useState(false);
  const pending = useRef(0);

  const request = useCallback(async <T,>(method: string, url: string, data?: unknown, options: UseApiOptions = {}): Promise<T | null> => {
    const { successMessage = 'Operação realizada com sucesso!', errorMessage = 'Erro ao processar solicitação',
      showSuccessToast = method !== 'GET', showErrorToast = true, ...requestOptions } = options;
    pending.current += 1;
    setIsLoading(true);
    try {
      const result = await client.request<T>(method, url, data, requestOptions);
      if (showSuccessToast) notifier?.success('Sucesso', successMessage);
      return result;
    } catch (err) {
      if (showErrorToast && !(err instanceof Error && err.name === 'AbortError')) {
        notifier?.error('Erro', resolveHttpError(err, errorMessage));
      }
      return null;
    } finally {
      pending.current -= 1;
      if (pending.current === 0) setIsLoading(false);
    }
  }, [client, notifier]);

  const get = useCallback(<T,>(url: string, params?: Record<string, unknown>, options?: UseApiOptions) =>
    request<T>('GET', url, undefined, { ...options, params }), [request]);
  const post = useCallback(<T,>(url: string, data?: unknown, options?: UseApiOptions) =>
    request<T>('POST', url, data, options), [request]);
  const put = useCallback(<T,>(url: string, data?: unknown, options?: UseApiOptions) =>
    request<T>('PUT', url, data, options), [request]);
  const del = useCallback(<T,>(url: string, data?: unknown, options?: UseApiOptions) =>
    request<T>('DELETE', url, data, options), [request]);
  const execute = useCallback(async <T,>(fn: () => Promise<T>, options: UseApiOptions = {}): Promise<T | null> => {
    const { successMessage = 'Operação realizada com sucesso!', errorMessage = 'Erro ao processar solicitação',
      showSuccessToast = true, showErrorToast = true } = options;
    pending.current += 1;
    setIsLoading(true);
    try {
      const result = await fn();
      if (showSuccessToast) notifier?.success('Sucesso', successMessage);
      return result;
    } catch (err) {
      if (showErrorToast && !(err instanceof Error && err.name === 'AbortError')) notifier?.error('Erro', resolveHttpError(err, errorMessage));
      return null;
    } finally {
      pending.current -= 1;
      if (pending.current === 0) setIsLoading(false);
    }
  }, [notifier]);
  return { request, get, post, put, delete: del, execute, isLoading };
}
