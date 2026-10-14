'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface CepData {
  cep: string; logradouro: string; complemento: string; bairro: string; localidade: string; uf: string; erro?: boolean;
}

export function useCep(fetcher: typeof fetch = fetch) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sequence = useRef(0);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; sequence.current += 1; };
  }, []);
  const fetchAddress = useCallback(async (cep: string, signal?: AbortSignal): Promise<CepData | null> => {
    const id = ++sequence.current;
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) { setLoading(false); setError('CEP deve conter 8 dígitos'); return null; }
    setLoading(true);
    setError(null);
    try {
      const response = await fetcher(`https://viacep.com.br/ws/${clean}/json/`, { signal });
      if (!response.ok) throw new Error('Erro ao buscar CEP');
      const result = await response.json() as CepData;
      if (result.erro) { if (mounted.current && id === sequence.current) setError('CEP não encontrado'); return null; }
      return result;
    } catch (reason) {
      if (mounted.current && id === sequence.current && !(reason instanceof Error && reason.name === 'AbortError')) setError('Erro ao buscar CEP. Tente novamente.');
      return null;
    } finally { if (mounted.current && id === sequence.current) setLoading(false); }
  }, [fetcher]);
  return { loading, error, fetchAddress };
}
