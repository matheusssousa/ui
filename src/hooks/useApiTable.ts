'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { HttpClient, HttpRequestOptions } from '../functions/http.js';
import type { LaravelPaginatedResponse } from '../types/responses.js';
export type { LaravelPaginatedResponse } from '../types/responses.js';

export interface ApiTableState {
  page: number;
  per_page: number;
  search: string;
  sort_by: string;
  sort_direction: 'asc' | 'desc';
  filters: Record<string, unknown>;
}
export interface PaginationInfo {
  currentPage: number; totalPages: number; totalItems: number; itemsPerPage: number;
  from: number; to: number; hasNextPage: boolean; hasPreviousPage: boolean;
}
export interface PaginatedResult<T> { data: T[]; pagination: PaginationInfo }
export function normalizePagination<T>(response: LaravelPaginatedResponse<T>): PaginatedResult<T> {
  if (!response || !Array.isArray(response.data) || !Number.isFinite(response.current_page) ||
      !Number.isFinite(response.last_page) || !Number.isFinite(response.total) || !Number.isFinite(response.per_page)) {
    throw new Error('Resposta de paginação inválida. Forneça mapResponse para o formato da sua API.');
  }
  return { data: response.data, pagination: {
    currentPage: response.current_page, totalPages: response.last_page, totalItems: response.total,
    itemsPerPage: response.per_page, from: response.from ?? 0, to: response.to ?? 0,
    hasNextPage: response.current_page < response.last_page, hasPreviousPage: response.current_page > 1,
  } };
}
export function buildTableParams(state: ApiTableState): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(state.filters)) {
    if (value !== '' && value !== null && value !== undefined) params[Array.isArray(value) ? `${key}[]` : key] = value;
  }
  return { ...params, page: state.page, per_page: state.per_page,
    ...(state.search ? { search: state.search } : {}),
    ...(state.sort_by ? { sort_by: state.sort_by, sort_direction: state.sort_direction } : {}) };
}
export interface UseApiTableOptions<T, Response = LaravelPaginatedResponse<T>> {
  client?: HttpClient;
  endpoint?: string;
  enabled?: boolean;
  initialState?: Partial<ApiTableState>;
  debounceMs?: number;
  requestOptions?: Omit<HttpRequestOptions, 'params' | 'signal'>;
  mapResponse?: (response: Response) => PaginatedResult<T>;
  buildParams?: (state: ApiTableState) => Record<string, unknown>;
  onSuccess?: (response: Response) => void;
  onError?: (error: unknown) => void;
}

export function useApiTable<T, Response = LaravelPaginatedResponse<T>>(options: UseApiTableOptions<T, Response>) {
  const { client, endpoint, enabled = true, debounceMs = 300 } = options;
  const [state, setState] = useState<ApiTableState>(() => ({ page: 1, per_page: 15, search: '',
    sort_by: 'created_at', sort_direction: 'desc', filters: {}, ...options.initialState }));
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>(() => ({ currentPage: state.page,
    totalPages: 0, totalItems: 0, itemsPerPage: state.per_page, from: 0, to: 0,
    hasNextPage: false, hasPreviousPage: false }));
  const [isFetching, setIsFetching] = useState(Boolean(enabled && client && endpoint));
  const [error, setError] = useState<unknown>(null);
  const [revision, setRevision] = useState(0);
  const latest = useRef(options);
  latest.current = options;
  useEffect(() => {
    if (!enabled || !client || !endpoint) { setIsFetching(false); return; }
    const controller = new AbortController();
    setIsFetching(true);
    setError(null);
    const timer = setTimeout(async () => {
      let response: Response;
      try {
        response = await client.request<Response>('GET', endpoint, undefined, {
          ...latest.current.requestOptions, signal: controller.signal,
          params: (latest.current.buildParams ?? buildTableParams)(state),
        });
        if (controller.signal.aborted) return;
        const result = latest.current.mapResponse
          ? latest.current.mapResponse(response)
          : normalizePagination(response as LaravelPaginatedResponse<T>);
        setData(result.data);
        setPagination(result.pagination);
      } catch (reason) {
        if (!controller.signal.aborted) { setError(reason); latest.current.onError?.(reason); }
        return;
      } finally {
        if (!controller.signal.aborted) setIsFetching(false);
      }
      latest.current.onSuccess?.(response);
    }, Math.max(0, debounceMs));
    return () => { clearTimeout(timer); controller.abort(); };
  }, [client, endpoint, enabled, state, revision, debounceMs]);

  const setPage = useCallback((page: number) => setState(s => ({ ...s, page: Math.max(1, page) })), []);
  const setPerPage = useCallback((per_page: number) => setState(s => ({ ...s, per_page: Math.max(1, per_page), page: 1 })), []);
  const setSearch = useCallback((search: string) => setState(s => ({ ...s, search, page: 1 })), []);
  const setFilters = useCallback((filters: Record<string, unknown>) => setState(s => ({ ...s, filters, page: 1 })), []);
  const setSort = useCallback((sort_by: string, direction?: 'asc' | 'desc') => setState(s => ({ ...s, sort_by, page: 1,
    sort_direction: direction ?? (s.sort_by === sort_by && s.sort_direction === 'asc' ? 'desc' : 'asc') })), []);
  const clearFilters = useCallback(() => setState(s => ({ ...s, search: '', filters: {}, page: 1 })), []);
  const refetchData = useCallback(() => setRevision(v => v + 1), []);
  return { data, pagination, state, error, isFetching, isLoading: isFetching && data.length === 0,
    setPage, setPerPage, setSearch, setFilters, setSort, clearFilters, refetchData,
    sortState: { column: state.sort_by || null, direction: state.sort_direction } };
}
