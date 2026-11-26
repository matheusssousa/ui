'use client';

import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { resolveHttpError } from '../functions/http.js';
import type { ApiNotifier } from './useApi.js';

export interface UseFetchPaginationOptions<T> {
  /** Página usada antes da primeira resposta; padrão `1`. */
  initialPage?: number;
  /** Extrai a página atual quando a resposta não segue o formato Laravel. */
  getCurrentPage?: (data: T) => number;
  /** Extrai o total de páginas quando a resposta não segue o formato Laravel. */
  getTotalPages?: (data: T) => number;
}

export interface UseFetchOptions<T> {
  immediate?: boolean;
  initialData?: T | null;
  notifier?: ApiNotifier;
  successMessage?: string;
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (message: string) => void;
  /** Habilita paginação. Nesse modo, `fetchFn` recebe a página como primeiro argumento. */
  pagination?: boolean | UseFetchPaginationOptions<T>;
}

export interface UseFetchPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled: boolean;
}

export interface UseFetchResult<T, Args extends unknown[]> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: Args) => Promise<T | null>;
  reset: () => void;
  setData: Dispatch<SetStateAction<T | null>>;
}

export interface UsePaginatedFetchResult<T, Args extends unknown[]> extends UseFetchResult<T, Args> {
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  paginationProps: UseFetchPaginationProps;
}

type PaginationShape = {
  current_page?: unknown;
  last_page?: unknown;
  meta?: { current_page?: unknown; last_page?: unknown };
  pagination?: { currentPage?: unknown; totalPages?: unknown };
};

function positiveInteger(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(1, Math.trunc(value)) : fallback;
}

function resolvePagination<T>(data: T, options: UseFetchPaginationOptions<T>, fallbackPage: number) {
  const response = data as PaginationShape;
  const currentPage = options.getCurrentPage?.(data)
    ?? response.current_page
    ?? response.meta?.current_page
    ?? response.pagination?.currentPage;
  const totalPages = options.getTotalPages?.(data)
    ?? response.last_page
    ?? response.meta?.last_page
    ?? response.pagination?.totalPages;

  return {
    currentPage: positiveInteger(currentPage, fallbackPage),
    totalPages: positiveInteger(totalPages, 1),
  };
}

export function useFetch<T, Args extends unknown[] = []>(
  fetchFn: (page: number, ...args: Args) => Promise<T | null>,
  options: UseFetchOptions<T> & { pagination: true | UseFetchPaginationOptions<T> },
): UsePaginatedFetchResult<T, Args>;
export function useFetch<T, Args extends unknown[] = []>(
  fetchFn: (...args: Args) => Promise<T | null>,
  options?: UseFetchOptions<T> & { pagination?: false | undefined },
): UseFetchResult<T, Args>;
export function useFetch<T, Args extends unknown[] = []>(
  fetchFn: ((page: number, ...args: Args) => Promise<T | null>) | ((...args: Args) => Promise<T | null>),
  options: UseFetchOptions<T> = {},
): UseFetchResult<T, Args> | UsePaginatedFetchResult<T, Args> {
  const { immediate = false, initialData = null } = options;
  const paginationEnabled = Boolean(options.pagination);
  const paginationOptions = typeof options.pagination === 'object' ? options.pagination : {};
  const initialPage = positiveInteger(paginationOptions.initialPage, 1);
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);
  const [page, setPageState] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const mounted = useRef(true);
  const sequence = useRef(0);
  const pageRef = useRef(initialPage);
  const totalPagesRef = useRef(1);
  const lastArgs = useRef<Args>([] as unknown as Args);
  const latest = useRef({ fetchFn, options, paginationOptions });
  latest.current = { fetchFn, options, paginationOptions };

  const request = useCallback(async (requestedPage: number, args: Args): Promise<T | null> => {
    const id = ++sequence.current;
    setLoading(true);
    setError(null);
    try {
      const current = latest.current;
      const result = current.options.pagination
        ? await (current.fetchFn as (page: number, ...args: Args) => Promise<T | null>)(requestedPage, ...args)
        : await (current.fetchFn as (...args: Args) => Promise<T | null>)(...args);
      if (mounted.current && id === sequence.current) {
        setData(result);
        if (result !== null) {
          if (current.options.pagination) {
            const pagination = resolvePagination(result, current.paginationOptions, requestedPage);
            pageRef.current = pagination.currentPage;
            totalPagesRef.current = pagination.totalPages;
            setPageState(pagination.currentPage);
            setTotalPages(pagination.totalPages);
          }
          if (current.options.showSuccessToast ?? Boolean(current.options.successMessage)) {
            current.options.notifier?.success('Sucesso', current.options.successMessage ?? 'Dados carregados com sucesso!');
          }
          current.options.onSuccess?.(result);
        }
      }
      return result;
    } catch (reason) {
      if (mounted.current && id === sequence.current) {
        const current = latest.current.options;
        const message = resolveHttpError(reason, current.errorMessage ?? 'Erro ao buscar os dados.');
        setError(message);
        if ((current.showErrorToast ?? true) && !(reason instanceof Error && reason.name === 'AbortError')) {
          current.notifier?.error('Erro', message);
        }
        current.onError?.(message);
      }
      return null;
    } finally {
      if (mounted.current && id === sequence.current) setLoading(false);
    }
  }, []);

  const execute = useCallback((...args: Args): Promise<T | null> => {
    lastArgs.current = args;
    return request(pageRef.current, args);
  }, [request]);

  const setPage = useCallback((nextPage: number) => {
    const normalizedPage = Math.min(positiveInteger(nextPage, pageRef.current), totalPagesRef.current);
    if (normalizedPage === pageRef.current) return;
    pageRef.current = normalizedPage;
    setPageState(normalizedPage);
    void request(normalizedPage, lastArgs.current);
  }, [request]);

  const reset = useCallback(() => {
    sequence.current += 1;
    pageRef.current = initialPage;
    totalPagesRef.current = 1;
    lastArgs.current = [] as unknown as Args;
    setData(initialData);
    setLoading(false);
    setError(null);
    setPageState(initialPage);
    setTotalPages(1);
  }, [initialData, initialPage]);

  useEffect(() => {
    mounted.current = true;
    if (immediate) void execute(...([] as unknown as Args));
    return () => { mounted.current = false; sequence.current += 1; };
  }, [immediate, execute]);

  const baseResult: UseFetchResult<T, Args> = { data, loading, error, execute, reset, setData };
  if (!paginationEnabled) return baseResult;

  return {
    ...baseResult,
    page,
    totalPages,
    setPage,
    paginationProps: { currentPage: page, totalPages, onPageChange: setPage, disabled: loading },
  };
}
