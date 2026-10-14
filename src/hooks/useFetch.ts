'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { resolveHttpError } from '../functions/http.js';

export interface UseFetchOptions<T> {
  immediate?: boolean;
  initialData?: T | null;
  onSuccess?: (data: T) => void;
  onError?: (message: string) => void;
}

export function useFetch<T, Args extends unknown[] = []>(fetchFn: (...args: Args) => Promise<T | null>, options: UseFetchOptions<T> = {}) {
  const { immediate = false, initialData = null } = options;
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);
  const sequence = useRef(0);
  const latest = useRef({ fetchFn, onSuccess: options.onSuccess, onError: options.onError });
  latest.current = { fetchFn, onSuccess: options.onSuccess, onError: options.onError };

  const execute = useCallback(async (...args: Args): Promise<T | null> => {
    const id = ++sequence.current;
    setLoading(true);
    setError(null);
    try {
      const result = await latest.current.fetchFn(...args);
      if (mounted.current && id === sequence.current) {
        setData(result);
        if (result !== null) latest.current.onSuccess?.(result);
      }
      return result;
    } catch (reason) {
      if (mounted.current && id === sequence.current) {
        const message = resolveHttpError(reason, 'Erro ao buscar os dados.');
        setError(message);
        latest.current.onError?.(message);
      }
      return null;
    } finally {
      if (mounted.current && id === sequence.current) setLoading(false);
    }
  }, []);
  const reset = useCallback(() => {
    sequence.current += 1;
    setData(initialData);
    setLoading(false);
    setError(null);
  }, [initialData]);
  useEffect(() => {
    mounted.current = true;
    if (immediate) void execute(...([] as unknown as Args));
    return () => { mounted.current = false; sequence.current += 1; };
  }, [immediate, execute]);
  return { data, loading, error, execute, reset, setData };
}
