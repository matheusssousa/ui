import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { createAxiosClient, createFetchClient, HttpError, resolveHttpError } from '../dist/functions/http.js';
import { useApiTable, normalizePagination } from '../dist/hooks/useApiTable.js';
import { useSearch } from '../dist/hooks/useSearch.js';
import { useViewModal, ViewModalUtils } from '../dist/hooks/useViewModal.js';
import { ImageInput, validateImageFile } from '../dist/components/image-input.js';
import { SwitchField } from '../dist/components/switch-field.js';
import { ViewModal } from '../dist/components/view-modal.js';
import { ToastProvider } from '../dist/providers/ToastProvider.js';
import { Button } from '../dist/components/button.js';
import { openDownloadUrl } from '../dist/functions/openDownloadUrl.js';
import { getFieldError } from '../dist/functions/getFieldError.js';
import { handleInputChange } from '../dist/functions/handleInputChange.js';
import { removeMaskFromFields } from '../dist/functions/removeMask.js';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://example.test' });
for (const key of ['window', 'document', 'HTMLElement', 'HTMLInputElement', 'FileReader', 'File', 'Event', 'MouseEvent']) {
  globalThis[key] = key === 'window' ? dom.window : dom.window[key];
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
dom.window.HTMLElement.prototype.scrollTo = function () {};
async function mount(render) {
  const container = document.createElement('div'); document.body.append(container);
  const root = createRoot(container);
  await act(async () => root.render(render()));
  return { container, render: async () => { await act(async () => root.render(render())); },
    dispose: async () => { await act(async () => root.unmount()); container.remove(); } };
}
async function tick(ms = 20) { await act(async () => { await new Promise(resolve => setTimeout(resolve, ms)); }); }
const page = (data = [{ id: 1 }]) => ({ data, current_page: 1, last_page: 2, total: 2, per_page: 1, from: 1, to: 1 });

test('button ripple stays outside layout without theme CSS and is removed after animation', async () => {
  const previousAnimate = dom.window.HTMLElement.prototype.animate;
  let animation;
  let clicks = 0;
  dom.window.HTMLElement.prototype.animate = function () { return animation = {}; };
  const ui = await mount(() => React.createElement(ToastProvider, null,
    React.createElement(Button, { motionScale: false, onClick: () => clicks++ }, 'Entrar')));
  try {
    const button = ui.container.querySelector('button');
    for (let index = 0; index < 2; index++) {
      await act(async () => button.click());
      const ripple = button.querySelector('.ripple');
      assert.equal(dom.window.getComputedStyle(ripple).position, 'absolute');
      assert.equal(ripple.style.pointerEvents, 'none');
      assert.equal(ripple.getAttribute('aria-hidden'), 'true');
      assert.equal(button.querySelectorAll('.ripple').length, 1);
      assert.equal(button.textContent, 'Entrar');
    }
    animation.onfinish();
    assert.equal(button.querySelector('.ripple'), null);
    assert.equal(clicks, 2);
    dom.window.HTMLElement.prototype.animate = undefined;
    await act(async () => button.click());
    assert.equal(button.querySelector('.ripple'), null);
  } finally {
    dom.window.HTMLElement.prototype.animate = previousAnimate;
    await ui.dispose();
  }
});

for (const transport of ['fetch', 'axios']) test(`table works with ${transport}, filters, sorting and pagination`, async () => {
  const requests = [];
  const client = transport === 'fetch'
    ? createFetchClient({ fetcher: async (url, options) => { requests.push({ url, ...options }); return Response.json(page()); } })
    : createAxiosClient({ request: async config => { requests.push(config); return { data: page() }; } });
  let table;
  function Fixture() { table = useApiTable({ client, endpoint: '/items', debounceMs: 0 }); return null; }
  const ui = await mount(() => React.createElement(Fixture));
  try {
    await tick();
    assert.deepEqual(table.data, [{ id: 1 }]);
    assert.equal(table.pagination.hasNextPage, true);
    await act(async () => { table.setPage(2); }); await tick();
    assert.equal(table.state.page, 2);
    await act(async () => { table.setFilters({ active: false, roles: ['admin', 'staff'] }); table.setSort('name'); }); await tick();
    assert.equal(table.state.page, 1);
    assert.equal(table.state.sort_direction, 'asc');
    const latest = requests.at(-1);
    assert.ok(latest.signal instanceof AbortSignal);
    if (transport === 'fetch') {
      const query = new URL(latest.url, 'https://example.test').searchParams;
      assert.equal(query.get('active'), 'false');
      assert.deepEqual(query.getAll('roles[]'), ['admin', 'staff']);
    } else assert.deepEqual(latest.params['roles[]'], ['admin', 'staff']);
  } finally { await ui.dispose(); }
});

test('table ignores stale responses, cancels requests and can recover from errors', async () => {
  const pending = [];
  const client = { request: (_method, _url, _data, options) => new Promise((resolve, reject) => pending.push({ resolve, reject, options })) };
  let table;
  function Fixture() { table = useApiTable({ client, endpoint: '/items', debounceMs: 0 }); return null; }
  const ui = await mount(() => React.createElement(Fixture));
  try {
    await tick();
    await act(async () => table.setSearch('new')); await tick();
    assert.equal(pending[0].options.signal.aborted, true);
    await act(async () => pending[1].resolve(page([{ id: 2 }])));
    await act(async () => pending[0].resolve(page([{ id: 1 }])));
    assert.deepEqual(table.data, [{ id: 2 }]);
    await act(async () => table.refetchData()); await tick();
    await act(async () => pending[2].reject(new Error('offline')));
    assert.equal(table.error.message, 'offline');
    assert.equal(table.isFetching, false);
    await act(async () => table.refetchData()); await tick();
    await act(async () => pending[3].resolve(page([{ id: 3 }])));
    assert.equal(table.error, null);
    assert.deepEqual(table.data, [{ id: 3 }]);
    await act(async () => table.refetchData()); await tick();
  } finally { await ui.dispose(); }
  assert.equal(pending.at(-1).options.signal.aborted, true);
});

test('search can switch from local to remote without changing hook order and debounces', async () => {
  let options = { debounceMs: 15 };
  let search;
  const calls = [];
  const client = { request: async (_m, _u, _d, opts) => { calls.push(opts.params); return { items: [{ id: 4 }] }; } };
  function Fixture() { search = useSearch(options); return null; }
  const ui = await mount(() => React.createElement(Fixture));
  try {
    assert.equal(search.isFetching, false);
    options = { ...options, client, endpoint: '/custom',
      buildParams: state => ({ q: state.search }),
      mapResponse: response => ({ data: response.items, pagination: normalizePagination(page()).pagination }) };
    await ui.render();
    await act(async () => { search.setSearch('a'); search.setSearch('ab'); search.setSearch('abc'); });
    await tick(40);
    assert.deepEqual(calls, [{ q: 'abc' }]);
    assert.deepEqual(search.data, [{ id: 4 }]);
    options = { ...options, enabled: false }; await ui.render();
    assert.equal(search.isFetching, false);
  } finally { await ui.dispose(); }
});

test('switch field associates label and serializes controlled and uncontrolled values', async () => {
  const ui = await mount(() => React.createElement('form', null, React.createElement(SwitchField, { name: 'active', label: 'Ativo', defaultChecked: true })));
  try {
    const button = ui.container.querySelector('[role=switch]');
    assert.equal(ui.container.querySelector('label').htmlFor, button.id);
    assert.equal(ui.container.querySelector('input').value, '1');
    await act(async () => button.click());
    assert.equal(ui.container.querySelector('input').value, '0');
  } finally { await ui.dispose(); }
});

test('image input validates, previews, removes and blocks selection while loading', async () => {
  assert.equal(validateImageFile({ name: 'photo.JPG', type: 'image/jpeg', size: 100 }, '.jpg', 1), null);
  assert.ok(validateImageFile({ name: 'a.png', type: 'image/png', size: 2e6 }, 'image/*', 1));
  assert.ok(validateImageFile({ name: 'a.txt', type: 'text/plain', size: 1 }, 'image/*', 1));
  const changes = [];
  let loading = false;
  const ui = await mount(() => React.createElement(ImageInput, { label: 'Foto', isLoading: loading, onChange: (...args) => changes.push(args) }));
  try {
    const input = ui.container.querySelector('input');
    Object.defineProperty(input, 'files', { configurable: true, value: [new File(['image'], 'a.png', { type: 'image/png' })] });
    await act(async () => input.dispatchEvent(new Event('change', { bubbles: true }))); await tick();
    assert.match(ui.container.querySelector('img').src, /^data:image\/png/);
    await act(async () => ui.container.querySelector('button').click());
    assert.deepEqual(changes.at(-1), [null, null]);
    assert.equal(ui.container.querySelector('img'), null);
    loading = true; await ui.render();
    assert.equal(input.disabled, true);
  } finally { await ui.dispose(); }
});

test('modal helpers preserve falsy values and reject unknown configurations', async () => {
  let modal;
  const config = ViewModalUtils.simple([{ key: 'count', label: 'Quantidade' }]);
  function Fixture() { modal = useViewModal({ detail: config }); return null; }
  const ui = await mount(() => React.createElement(Fixture));
  try {
    await act(async () => modal.open({ count: 0 }));
    assert.equal(modal.isOpen, true);
    assert.equal(modal.data.count, 0);
    assert.equal(modal.createConfig('detail').sections.length, 1);
    assert.throws(() => modal.createConfig('missing'));
    await act(async () => modal.close()); assert.equal(modal.isOpen, false);
  } finally { await ui.dispose(); }
});

test('view modal renders values, checks permissions and reports action failures', async () => {
  let attempts = 0;
  const config = { title: 'Details', sections: [
    { fields: [{ key: 'count', label: 'Count' }, { key: 'enabled', label: 'Enabled' }] },
    { title: 'Private', permission: 'admin', fields: [{ key: 'secret', label: 'Secret' }] },
  ], actions: [{ id: 'fail', label: 'Run action', onClick: async () => { attempts++; throw new Error('Action failed'); } }] };
  const ui = await mount(() => React.createElement(ToastProvider, null, React.createElement(ViewModal, {
    isOpen: true, onClose: () => {}, data: { count: 0, enabled: false, secret: 'hidden' }, config,
  })));
  try {
    assert.match(ui.container.textContent, /Count0/);
    assert.match(ui.container.textContent, /Enabledfalse/);
    assert.doesNotMatch(ui.container.textContent, /Private|hidden/);
    const button = [...ui.container.querySelectorAll('button')].find(b => b.textContent === 'Run action');
    await act(async () => button.click());
    assert.equal(attempts, 1);
    assert.equal(ui.container.querySelector('[role=alert]').textContent, 'Action failed');
  } finally { await ui.dispose(); }
});

test('view modal cancels stale remote reads on endpoint changes and close', async () => {
  const pending = [];
  const client = { request: (_m, url, _d, options) => new Promise(resolve => pending.push({ resolve, url, options })) };
  let endpoint = '/items/1'; let isOpen = true;
  const config = { sections: [{ fields: [{ key: 'name', label: 'Name' }] }] };
  const ui = await mount(() => React.createElement(ToastProvider, null, React.createElement(ViewModal, {
    isOpen, onClose: () => {}, client, endpoint, config,
  })));
  try {
    endpoint = '/items/2'; await ui.render();
    assert.equal(pending[0].options.signal.aborted, true);
    await act(async () => pending[1].resolve({ name: 'Current' }));
    await act(async () => pending[0].resolve({ name: 'Stale' }));
    assert.match(ui.container.textContent, /Current/); assert.doesNotMatch(ui.container.textContent, /Stale/);
    endpoint = '/items/3'; await ui.render();
    isOpen = false; await ui.render();
    assert.equal(pending[2].options.signal.aborted, true);
  } finally { await ui.dispose(); }
});

test('downloads reject unsafe protocols and remove their temporary anchor', () => {
  assert.throws(() => openDownloadUrl('javascript:alert(1)'));
  let href;
  const original = dom.window.HTMLAnchorElement.prototype.click;
  dom.window.HTMLAnchorElement.prototype.click = function () { href = this.href; };
  try { openDownloadUrl('/export.csv'); } finally { dom.window.HTMLAnchorElement.prototype.click = original; }
  assert.equal(href, 'https://example.test/export.csv');
  assert.equal(document.querySelector('a'), null);
});

test('form helpers preserve other fields and report the first nonempty error', () => {
  let state = { phone: '', count: 0 }; const cleared = [];
  handleInputChange('phone', '123', { phone: ['Required'] }, field => cleared.push(field), update => { state = update(state); });
  assert.deepEqual(state, { phone: '123', count: 0 }); assert.deepEqual(cleared, ['phone']);
  assert.equal(getFieldError('phone', { phone: ['', 'Invalid'] }), 'Invalid');
  const input = { phone: '(11) 98765-4321', count: 0 };
  assert.equal(removeMaskFromFields(input, ['phone']).phone, '11987654321');
  assert.equal(input.phone, '(11) 98765-4321');
});

test('HTTP errors and request headers work for both transports', async () => {
  for (const status of [401, 403, 404, 422, 429, 503]) {
    assert.equal(resolveHttpError(new HttpError(status, {})), resolveHttpError({ response: { status, data: {} } }));
  }
  assert.equal(resolveHttpError(new HttpError(422, { errors: { first: [], next: ['', 'Invalid'] } })), 'Invalid');
  let config;
  const client = createAxiosClient({ request: async value => { config = value; return { data: null }; } });
  await client.request('PATCH', '/items/1', { active: true }, { headers: new Headers({ 'X-Test': 'ok' }), credentials: 'omit' });
  assert.equal(config.method, 'PATCH'); assert.equal(config.headers['x-test'], 'ok'); assert.equal(config.withCredentials, false);
});
