import { createFetchClient, type FetchClientOptions, type HttpRequestOptions } from './http.js';

/** Call from Server Components, Server Actions or Route Handlers. */
export function createServerFetch(config: FetchClientOptions = {}) {
  const client = createFetchClient(config);
  return <T>(url: string, options: HttpRequestOptions & { method?: string; body?: unknown } = {}) => {
    const { method = 'GET', body, ...requestOptions } = options;
    return client.request<T>(method, url, body, requestOptions);
  };
}
