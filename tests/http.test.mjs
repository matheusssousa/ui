import test from 'node:test';
import assert from 'node:assert/strict';
import { createAxiosClient, createFetchClient, HttpError, resolveHttpError } from '../dist/functions/http.js';
import { createServerFetch } from '../dist/functions/serverFetch.js';

test('fetch adapter passes request options, serializes JSON, and reads JSON', async () => {
  let captured;
  const client = createFetchClient({
    baseUrl: 'https://example.test/api', credentials: 'include',
    headers: () => ({ Authorization: 'Bearer token' }),
    fetcher: async (url, options) => {
      captured = { url, options };
      return new Response(JSON.stringify({ id: 1 }), { headers: { 'Content-Type': 'application/json' } });
    },
  });
  assert.deepEqual(await client.request('POST', '/users', { name: 'Ana' }, { params: { page: 2 } }), { id: 1 });
  assert.equal(captured.url, 'https://example.test/api/users?page=2');
  assert.equal(captured.options.credentials, 'include');
  assert.equal(captured.options.headers.get('Authorization'), 'Bearer token');
  assert.equal(captured.options.headers.get('Content-Type'), 'application/json');
  assert.equal(captured.options.body, '{"name":"Ana"}');
});

test('fetch adapter handles HTTP errors, 204, and abort', async () => {
  let unauthorized = 0;
  const client = createFetchClient({
    onUnauthorized: () => { unauthorized++; },
    fetcher: async (_url, options) => {
      if (options.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      return new Response(JSON.stringify({ message: 'Sessão expirada' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    },
  });
  await assert.rejects(client.request('GET', '/users'), error => {
    assert.ok(error instanceof HttpError);
    assert.equal(error.status, 401);
    assert.equal(resolveHttpError(error), 'Sessão expirada');
    return true;
  });
  assert.equal(unauthorized, 1);
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(client.request('GET', '/users', undefined, { signal: controller.signal }), { name: 'AbortError' });
  assert.equal(await createFetchClient({ fetcher: async () => new Response(null, { status: 204 }) }).request('DELETE', '/users/1'), null);
});

test('fetch adapter retries once after credential refresh', async () => {
  let token = 'old';
  let calls = 0;
  const client = createFetchClient({
    headers: () => ({ Authorization: `Bearer ${token}` }),
    onUnauthorized: async () => { token = 'new'; return true; },
    fetcher: async (_url, options) => {
      calls++;
      return options.headers.get('Authorization') === 'Bearer new'
        ? new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } })
        : new Response(null, { status: 401 });
    },
  });
  assert.deepEqual(await client.request('GET', '/private'), { ok: true });
  assert.equal(calls, 2);
});

test('Axios adapter preserves existing instance behavior', async () => {
  let config;
  const client = createAxiosClient({ request: async request => { config = request; return { data: { ok: true } }; } });
  const signal = new AbortController().signal;
  assert.deepEqual(await client.request('GET', '/users', undefined, { params: { page: 3 }, signal }), { ok: true });
  assert.equal(config.url, '/users');
  assert.deepEqual(config.params, { page: 3 });
  assert.equal(config.signal, signal);
});

test('server fetch forwards Next cache options', async () => {
  let captured;
  const request = createServerFetch({ fetcher: async (_url, options) => {
    captured = options;
    return new Response('ok');
  } });
  assert.equal(await request('/data', { cache: 'force-cache', next: { revalidate: 60, tags: ['data'] } }), 'ok');
  assert.equal(captured.cache, 'force-cache');
  assert.deepEqual(captured.next, { revalidate: 60, tags: ['data'] });
});
