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
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { status?: number; data?: unknown } }).response;
    if (response?.status) return resolveHttpError(new HttpError(response.status, response.data), fallback);
  }
  if (error instanceof HttpError) {
    const body = error.data;
    if (body && typeof body === 'object') {
      const record = body as Record<string, unknown>;
      if (typeof record.message === 'string' && record.message.trim()) return record.message;
      if (typeof record.error === 'string' && record.error.trim()) return record.error;
      if (record.errors && typeof record.errors === 'object') {
        const first = Object.values(record.errors)[0];
        if (Array.isArray(first) && typeof first[0] === 'string') return first[0];
      }
    }
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
        headers: options.headers, withCredentials: options.credentials === 'include' ? true : undefined,
      });
      return response.data;
    },
  };
}
