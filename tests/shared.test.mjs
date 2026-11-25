import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { createAxiosClient, createFetchClient, HttpError, resolveHttpError } from '../dist/functions/http.js';
import { useApiTable, normalizePagination } from '../dist/hooks/useApiTable.js';
import { useSearch } from '../dist/hooks/useSearch.js';
import { useViewModal, ViewModalUtils } from '../dist/hooks/useViewModal.js';
import { Input, validateImageFile } from '../dist/components/input.js';
import { Stepper } from '../dist/components/stepper.js';
import { Timeline } from '../dist/components/timeline.js';
import { RatingBar } from '../dist/components/rating-bar.js';
import { ViewModal } from '../dist/components/view-modal.js';
import { ToastProvider } from '../dist/providers/ToastProvider.js';
import { Button } from '../dist/components/button.js';
import { toneClasses } from '../dist/components/theme.js';
import { uiGradients } from '../dist/components/gradient.js';
import { openDownloadUrl } from '../dist/functions/openDownloadUrl.js';
import { getFieldError } from '../dist/functions/getFieldError.js';
import { handleInputChange } from '../dist/functions/handleInputChange.js';
import { removeMaskFromFields } from '../dist/functions/removeMask.js';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://example.test' });
for (const key of ['window', 'document', 'HTMLElement', 'HTMLInputElement', 'FileReader', 'File', 'Event', 'MouseEvent']) {
  globalThis[key] = key === 'window' ? dom.window : dom.window[key];
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.self = dom.window;
dom.window.HTMLElement.prototype.scrollTo = function () {};
async function mount(render) {
  const container = document.createElement('div'); document.body.append(container);
  const root = createRoot(container);
  await act(async () => root.render(render()));
  return { container, render: async () => { await act(async () => root.render(render())); },
    dispose: async () => { await act(async () => root.unmount()); container.remove(); } };
}
async function tick(ms = 20) { await act(async () => { await new Promise(resolve => setTimeout(resolve, ms)); }); }
test('stepper exposes progress, requests navigation and blocks disabled steps', async () => {
  const changes = [];
  let currentStep = 1;
  let disabled = false;
  const steps = [{ title: 'Dados' }, { title: 'Endereço' }, { title: 'Confirmar', disabled: true }];
  const ui = await mount(() => React.createElement(Stepper, { steps, currentStep, disabled, onStepChange: index => changes.push(index) }));
  try {
    assert.match(ui.container.querySelector('[aria-current="step"]').textContent, /Endereço/);
    assert.match(ui.container.querySelector('li').textContent, /Concluída/);
    const buttons = ui.container.querySelectorAll('button');
    await act(async () => buttons[0].click());
    assert.deepEqual(changes, [0]);
    assert.match(ui.container.querySelector('[aria-current="step"]').textContent, /Endereço/, 'controlled until parent updates');
    await act(async () => buttons[2].click());
    assert.deepEqual(changes, [0]);
    disabled = true;
    await ui.render();
    assert.ok([...ui.container.querySelectorAll('button')].every(button => button.disabled));
    currentStep = steps.length;
    await ui.render();
    assert.equal(ui.container.querySelector('[aria-current]'), null);
    assert.ok([...ui.container.querySelectorAll('li')].every(item => item.textContent.includes('Concluída')));
  } finally { await ui.dispose(); }
});

test('stepper supports a static vertical list and empty steps', async () => {
  let steps = [{ title: 'Primeiro' }];
  const ui = await mount(() => React.createElement(Stepper, { steps, orientation: 'vertical', currentStep: -1 }));
  try {
    assert.equal(ui.container.querySelector('button'), null);
    assert.ok(ui.container.querySelector('ol').classList.contains('flex-col'));
    assert.equal(ui.container.querySelectorAll('[aria-current="step"]').length, 1);
    steps = [];
    await ui.render();
    assert.equal(ui.container.querySelectorAll('li').length, 0);
  } finally { await ui.dispose(); }
});

test('timeline exposes chronological events and the current event', async () => {
  const items = [
    { title: 'Criado', date: '09:00' },
    { title: 'Processando', status: 'current', color: 'success' },
    { title: 'Concluido', status: 'pending' },
  ];
  const ui = await mount(() => React.createElement(Timeline, { items, 'aria-label': 'Historico do pedido' }));
  try {
    const list = ui.container.querySelector('ol');
    assert.equal(list.getAttribute('aria-label'), 'Historico do pedido');
    assert.equal(list.querySelectorAll('li').length, 3);
    assert.match(list.querySelector('[aria-current="step"]').textContent, /Processando/);
    assert.ok(list.querySelector('[data-status="pending"] span').className.includes('bg-muted'));
  } finally { await ui.dispose(); }
});

test('rating bar supports uncontrolled, controlled and keyboard selection', async () => {
  const changes = [];
  let value;
  const ui = await mount(() => React.createElement(RatingBar, {
    value, defaultValue: 2, allowClear: true, showValue: true, label: 'Nota', onValueChange: next => changes.push(next),
  }));
  try {
    let radios = ui.container.querySelectorAll('[role="radio"]');
    assert.equal(radios.length, 5);
    assert.equal(radios[1].getAttribute('aria-checked'), 'true');
    await act(async () => radios[3].click());
    assert.equal(ui.container.querySelector('output').textContent, '4/5');
    radios = ui.container.querySelectorAll('[role="radio"]');
    await act(async () => radios[3].click());
    assert.equal(ui.container.querySelector('output').textContent, '0/5');
    value = 3;
    await ui.render();
    const selected = ui.container.querySelector('[aria-checked="true"]');
    await act(async () => selected.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })));
    assert.deepEqual(changes, [4, 0, 4]);
    assert.equal(ui.container.querySelector('output').textContent, '3/5', 'controlled until parent updates');
  } finally { await ui.dispose(); }
});

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

test('active button styling respects variants and colors', async () => {
  const cases = [
    [{ variant: 'filled', color: 'secondary' }, ['brightness-90', 'ring-secondary']],
    [{ variant: 'soft', color: 'success' }, ['bg-success/20', 'ring-success']],
    [{ variant: 'outline', color: 'danger' }, ['bg-destructive/15', 'ring-destructive']],
    [{ variant: 'ghost', color: 'tertiary' }, ['bg-tertiary/15', 'ring-tertiary']],
    [{ variant: 'icon', color: 'secondary' }, ['bg-secondary/15', 'ring-secondary']],
    [{ gradient: 'primary-secondary', color: 'primary' }, ['saturate-125', 'ring-primary']],
  ];

  for (const [props, expectedClasses] of cases) {
    const ui = await mount(() => React.createElement(ToastProvider, null,
      React.createElement(Button, { ...props, active: true, motionScale: false }, 'Ação')));
    try {
      const classes = ui.container.querySelector('button').classList;
      for (const expectedClass of expectedClasses) assert.ok(classes.contains(expectedClass), `${props.variant}/${props.color}: ${expectedClass}`);
    } finally { await ui.dispose(); }
  }
});

test('every visual button variant supports every semantic color', async () => {
  const colors = ['default', 'primary', 'secondary', 'tertiary', 'success', 'warning', 'danger', 'info', 'neutral', 'background', 'foreground'];
  const variants = {
    filled: ['solid'],
    outline: ['outline'],
    text: ['text'],
    ghost: ['text'],
    soft: ['soft'],
    icon: ['text', 'outline'],
    iconSoft: ['soft'],
    fastAction: ['solid'],
  };
  const cases = Object.entries(variants).flatMap(([variant, toneKeys]) =>
    colors.map(color => ({ variant, color, toneKeys, key: `${variant}-${color}` })));
  const ui = await mount(() => React.createElement(ToastProvider, null,
    React.createElement('div', null, cases.map(item => React.createElement(Button, {
      key: item.key, 'data-button-case': item.key, variant: item.variant, color: item.color, motionScale: false,
    }, item.key)))));

  try {
    for (const item of cases) {
      const classes = ui.container.querySelector(`[data-button-case="${item.key}"]`).classList;
      const tone = toneClasses[item.color === 'default' ? 'primary' : item.color];
      for (const toneKey of item.toneKeys) {
        for (const expectedClass of tone[toneKey].split(' ')) {
          assert.ok(classes.contains(expectedClass), `${item.key}: ${expectedClass}`);
        }
      }
    }
  } finally { await ui.dispose(); }
});

test('button falls back to primary when runtime color is invalid', async () => {
  const ui = await mount(() => React.createElement(ToastProvider, null,
    React.createElement(Button, { color: 'purple', active: true, motionScale: false }, 'Legado')));
  try {
    const classes = ui.container.querySelector('button').classList;
    assert.ok(classes.contains('bg-primary'));
    assert.ok(classes.contains('ring-primary'));
  } finally { await ui.dispose(); }
});

test('button accepts every shared gradient preset without a gradient variant', async () => {
  const ui = await mount(() => React.createElement(ToastProvider, null,
    React.createElement('div', null, uiGradients.map(gradient => React.createElement(Button, {
      key: gradient, gradient, motionScale: false, 'data-gradient': gradient,
    }, gradient)))));
  try {
    for (const gradient of uiGradients) {
      const button = ui.container.querySelector(`[data-gradient="${gradient}"]`);
      assert.match(button.style.backgroundImage, /gradient/);
      assert.ok(button.classList.contains('text-white'));
    }
  } finally { await ui.dispose(); }
});

test('button gradients preserve each visual variant', async () => {
  const variants = ['filled', 'outline', 'text', 'ghost', 'soft', 'icon', 'iconSoft', 'fastAction'];
  const ui = await mount(() => React.createElement(ToastProvider, null,
    React.createElement('div', null, variants.map(variant => React.createElement(Button, {
      key: variant, variant, gradient: 'retro', motionScale: false, 'data-gradient-variant': variant,
    }, variant)))));
  try {
    const control = variant => ui.container.querySelector(`[data-gradient-variant="${variant}"]`);
    assert.match(control('filled').style.backgroundImage, /gradient/);
    assert.ok(control('filled').classList.contains('text-white'));
    assert.equal(control('outline').style.backgroundClip, 'padding-box, border-box');
    assert.match(control('outline').querySelector('.ui-button-gradient-text').style.backgroundImage, /gradient/);
    for (const variant of ['text', 'ghost']) {
      assert.equal(control(variant).style.backgroundImage, '');
      assert.match(control(variant).querySelector('.ui-button-gradient-text').style.backgroundImage, /gradient/);
    }
    for (const variant of ['soft', 'iconSoft']) assert.match(control(variant).style.backgroundImage, /color-mix/);
    assert.equal(control('icon').style.backgroundClip, 'padding-box, border-box');
    assert.match(control('fastAction').style.backgroundImage, /gradient/);
  } finally { await ui.dispose(); }
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

test('icon-only buttons and links keep a square size and no label spacing', async () => {
  for (const asLink of [false, true]) {
    const ui = await mount(() => React.createElement(ToastProvider, null,
      React.createElement(Button, {
        asLink, href: asLink ? '/back' : undefined, variant: 'soft', color: 'tertiary',
        size: 'icon', fullWidth: false, 'aria-label': 'Voltar',
        leftIcon: React.createElement('svg', { 'aria-hidden': true }),
      })));
    try {
      const control = ui.container.querySelector(asLink ? 'a' : 'button');
      assert.equal(control.getAttribute('aria-label'), 'Voltar');
      assert.ok(control.classList.contains('w-10'));
      assert.ok(control.classList.contains('h-10'));
      assert.ok(!control.classList.contains('w-auto'));
      assert.equal(control.children.length, 1, 'no empty text container');
      assert.ok(!control.firstElementChild.classList.contains('mr-2'));
      assert.ok(control.querySelector('svg'));
    } finally { await ui.dispose(); }
  }
});

test('image input validates, previews, removes and blocks selection while loading', async () => {
  assert.equal(validateImageFile({ name: 'photo.JPG', type: 'image/jpeg', size: 100 }, '.jpg', 1), null);
  assert.ok(validateImageFile({ name: 'a.png', type: 'image/png', size: 2e6 }, 'image/*', 1));
  assert.ok(validateImageFile({ name: 'a.txt', type: 'text/plain', size: 1 }, 'image/*', 1));
  const changes = [];
  let loading = false;
  const ui = await mount(() => React.createElement(Input, { type: 'image', label: 'Foto', isLoading: loading, onChange: (...args) => changes.push(args) }));
  try {
    const input = ui.container.querySelector('input');
    assert.ok(input.classList.contains('sr-only'));
    const picker = [...ui.container.querySelectorAll('label')].find(label => label.textContent.includes('Selecionar imagem'));
    assert.equal(picker.htmlFor, input.id);
    Object.defineProperty(input, 'files', { configurable: true, value: [new File(['image'], 'a.png', { type: 'image/png' })] });
    await act(async () => input.dispatchEvent(new Event('change', { bubbles: true }))); await tick();
    assert.match(ui.container.querySelector('img').src, /^data:image\/png/);
    assert.match(ui.container.textContent, /Trocar imagem/);
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
