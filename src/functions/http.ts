export interface HttpRequestOptions {
  params?: Record<string, unknown>;
  signal?: AbortSignal;
  headers?: HeadersInit;
  credentials?: RequestCredentials;
  cache?: RequestCache;
  next?: { revalidate?: number | false; tags?: string[] };
}

export interface HttpClient {
  request<T>(method: string, url: string, data?: unknown, options?: HttpRequestOptions): Promise<T>;
}

export class HttpError extends Error {
  constructor(public readonly status: number, public readonly data: unknown, message?: string) {
    super(message ?? `HTTP ${status}`);
    this.name = 'HttpError';
  }
}

export function resolveHttpError(error: unknown, fallback = 'Não foi possível concluir a solicitação.'): string {
  const record = error && typeof error === 'object' ? error as Record<string, unknown> : {};
  const response = record.response && typeof record.response === 'object'
    ? record.response as { status?: number; data?: unknown } : undefined;
  const status = error instanceof HttpError ? error.status : response?.status;
  const data = error instanceof HttpError ? error.data : response?.data;
  if (data && typeof data === 'object') {
    const body = data as Record<string, unknown>;
    for (const key of ['message', 'error']) {
      if (typeof body[key] === 'string' && body[key].trim()) return body[key].trim();
    }
    if (body.errors && typeof body.errors === 'object') {
      for (const value of Object.values(body.errors)) {
        const message = (Array.isArray(value) ? value : [value]).find(v => typeof v === 'string' && v.trim());
        if (typeof message === 'string') return message.trim();
      }
    }
  }
  const messages: Record<number, string> = {
    401: 'Sua sessão expirou. Faça login novamente para continuar.',
    403: 'Você não tem permissão para executar esta ação.',
    404: 'Não encontramos o recurso solicitado.',
    422: 'Revise os dados informados e tente novamente.',
    429: 'Muitas tentativas em pouco tempo. Aguarde alguns instantes e tente novamente.',
  };
  if (status && messages[status]) return messages[status];
  if (status && status >= 500) return 'Estamos com instabilidade no momento. Tente novamente em instantes.';
  if (record.code === 'ECONNABORTED' || record.code === 'ETIMEDOUT') return 'A solicitação demorou demais. Tente novamente.';
  if (record.code === 'ERR_NETWORK' || (typeof record.message === 'string' && /failed to fetch|network error|fetch failed/i.test(record.message))) {
    return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
  }
  return error instanceof Error && error.message ? error.message : fallback;
}

export function appendParams(url: string, params?: Record<string, unknown>): string {
  if (!params) return url;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue;
    for (const item of Array.isArray(value) ? value : [value]) query.append(key, String(item));
  }
  const suffix = query.toString();
  return suffix ? `${url}${url.includes('?') ? '&' : '?'}${suffix}` : url;
}

export interface FetchClientOptions {
  baseUrl?: string;
  fetcher?: typeof fetch;
  credentials?: RequestCredentials;
  headers?: HeadersInit | (() => HeadersInit | Promise<HeadersInit>);
  /** Return true after refreshing credentials to retry the request once. */
  onUnauthorized?: () => boolean | void | Promise<boolean | void>;
}

export function createFetchClient(config: FetchClientOptions = {}): HttpClient {
  const fetcher = config.fetcher ?? fetch;
  return {
    async request<T>(method: string, url: string, data?: unknown, options: HttpRequestOptions = {}): Promise<T> {
      const base = config.baseUrl?.replace(/\/$/, '') ?? '';
      const path = url.startsWith('http://') || url.startsWith('https://') ? url : `${base}${url.startsWith('/') || !base ? '' : '/'}${url}`;
      const upperMethod = method.toUpperCase();
      let body: BodyInit | undefined;
      if (data !== undefined && upperMethod !== 'GET' && upperMethod !== 'HEAD') {
        if (data instanceof FormData || data instanceof URLSearchParams || typeof data === 'string' || data instanceof Blob) body = data;
        else body = JSON.stringify(data);
      }
      const send = async (retried: boolean): Promise<T> => {
        const headers = new Headers(typeof config.headers === 'function' ? await config.headers() : config.headers);
        new Headers(options.headers).forEach((value, key) => headers.set(key, value));
        if (!headers.has('Accept')) headers.set('Accept', 'application/json');
        if (body && typeof data === 'object' && !(data instanceof FormData) && !(data instanceof URLSearchParams) && !(data instanceof Blob) && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
        const response = await fetcher(appendParams(path, options.params), {
          method: upperMethod, body, headers, signal: options.signal,
          credentials: options.credentials ?? config.credentials,
          cache: options.cache,
          next: options.next,
        } as RequestInit);
        if (response.status === 401 && !retried && await config.onUnauthorized?.() === true) return send(true);
        const contentType = response.headers.get('content-type') ?? '';
        const payload = response.status === 204 || response.status === 205 ? null :
          contentType.includes('json') ? await response.json() : await response.text();
        if (!response.ok) throw new HttpError(response.status, payload);
        return payload as T;
      };
      return send(false);
    },
  };
}

/** Accepts an existing Axios instance; its interceptors keep ownership of auth and refresh. */
export interface AxiosLike {
  request<T = unknown>(config: any): Promise<{ data: T }>;
}

export function createAxiosClient(instance: AxiosLike): HttpClient {
  return {
    async request<T>(method: string, url: string, data?: unknown, options: HttpRequestOptions = {}): Promise<T> {
      const response = await instance.request<T>({
        method, url, data, params: options.params, signal: options.signal,
        headers: options.headers === undefined ? undefined : Object.fromEntries(new Headers(options.headers).entries()),
        withCredentials: options.credentials === undefined ? undefined : options.credentials === 'include',
      });
      return response.data;
    },
  };
}
