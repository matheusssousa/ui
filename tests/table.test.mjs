import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://example.test' });
for (const key of ['window', 'document', 'HTMLElement', 'HTMLInputElement', 'Event', 'MouseEvent', 'KeyboardEvent']) globalThis[key] = key === 'window' ? dom.window : dom.window[key];
globalThis.self = dom.window;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
dom.window.HTMLElement.prototype.scrollIntoView = function () {};
const { default: React, act } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToStaticMarkup } = await import('react-dom/server');
const { Table } = await import('../dist/components/table.js');
const { Select } = await import('../dist/components/select.js');
const { Input } = await import('../dist/components/input.js');
const h = React.createElement;
async function mount(props, Component = Table) {
  const container = document.createElement('div'); document.body.append(container);
  const outside = document.createElement('button'); document.body.append(outside);
  const root = createRoot(container);
  const render = async next => { props = { ...props, ...next }; await act(async () => root.render(h(Component, props))); };
  await render({});
  return { container, outside, render, dispose: async () => { await act(async () => root.unmount()); container.remove(); outside.remove(); } };
}
const focus = element => act(async () => element.focus());
async function change(input, value) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value').set.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
const click = element => act(async () => element.click());
const key = (element, value) => act(async () => element.dispatchEvent(new KeyboardEvent('keydown', { key: value, bubbles: true })));
const column = { key: 'name', label: 'Name', editor: { type: 'input' } };
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };

test('input autosave is change-only, keyed by id 0, locks one cell and confirms without parent refresh', async () => {
  const calls = [], request = deferred();
  const ui = await mount({ data: [{ id: 0, name: 'Before' }, { id: 1, name: 'Other' }], columns: [column], onCellSave: event => { calls.push(event); return request.promise; } });
  try {
    let [input, other] = ui.container.querySelectorAll('input');
    await focus(input); await focus(ui.outside); assert.equal(calls.length, 0);
    await focus(input); await change(input, 'After'); assert.equal(calls.length, 0);
    await focus(other); assert.equal(calls.length, 1);
    assert.equal(calls[0].rowKey, 0); assert.equal(calls[0].value, 'After'); assert.equal(calls[0].previousValue, 'Before');
    assert.equal(input.disabled, true); assert.equal(other.disabled, false);
    await act(async () => input.dispatchEvent(new dom.window.FocusEvent('focusout', { bubbles: true })));
    assert.equal(calls.length, 1);
    await act(async () => request.resolve());
    await ui.render({ data: [{ id: 1, name: 'Other' }, { id: 0, name: 'Before' }] });
    input = ui.container.querySelector('[aria-label="Name, linha 0"]'); assert.equal(input.value, 'After');
    await focus(input); await focus(ui.outside); assert.equal(calls.length, 1);
    await ui.render({ data: [{ id: 0, name: 'Server update' }] }); assert.equal(ui.container.querySelector('input').value, 'Server update');
  } finally { await ui.dispose(); }
});

test('validation, parsing, failed save and explicit retry preserve the draft', async () => {
  let calls = 0;
  const ui = await mount({ data: [{ id: 2, amount: 5 }], columns: [{ key: 'amount', label: 'Amount', editor: { type: 'input', inputType: 'number', parse: value => Number(value), validate: value => value < 0 ? 'Positive only' : undefined } }], onCellSave: async event => { calls++; assert.equal(event.value, 9); if (calls === 1) throw Error('Offline'); } });
  try {
    const input = ui.container.querySelector('input');
    await focus(input); await change(input, '05'); await focus(ui.outside); assert.equal(calls, 0);
    await focus(input); await change(input, '-1'); await focus(ui.outside); assert.equal(calls, 0); assert.match(ui.container.textContent, /Positive only/);
    await focus(input); await change(input, '9'); await focus(ui.outside); assert.equal(calls, 1); assert.equal(input.value, '9'); assert.match(ui.container.textContent, /Offline/);
    await ui.render({ data: [{ id: 2, amount: 7 }] }); assert.equal(input.value, '9');
    await click(ui.container.querySelector('button')); assert.equal(calls, 2); assert.equal(input.value, '9'); assert.doesNotMatch(ui.container.textContent, /Offline/);
  } finally { await ui.dispose(); }
});

test('select badges preserve typed values, internal search focus does not save, clear is controlled', async () => {
  const calls = [];
  const ui = await mount({ data: [{ id: 1, status: 0 }], columns: [{ key: 'status', label: 'Status', editor: { type: 'select', display: 'badge', searchable: true, clearable: true, options: [{ value: 0, label: 'Pending', color: 'warning' }, { value: 1, label: 'Done', color: 'success' }] } }], onCellSave: async event => { calls.push(event); } });
  try {
    const trigger = ui.container.querySelector('[role="combobox"]');
    assert.match(trigger.innerHTML, /bg-warning/); assert.equal(trigger.parentElement.hasAttribute('tabindex'), false);
    await focus(trigger); await click(trigger);
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 10)); });
    const search = ui.container.querySelector('input[placeholder="Buscar..."]');
    await focus(search); await change(search, 'Do'); assert.equal(calls.length, 0);
    const option = ui.container.querySelector('[role="option"]'); assert.match(option.innerHTML, /bg-success/);
    await click(option); assert.equal(calls.length, 0); assert.equal(document.activeElement, trigger); assert.match(trigger.textContent, /Done/);
    await focus(ui.outside); assert.equal(calls.length, 1); assert.equal(calls[0].value, 1);
    await focus(trigger); await click(trigger.querySelector('button')); assert.equal(calls.length, 1);
    await focus(ui.outside); assert.equal(calls.length, 2); assert.equal(calls[1].value, undefined); assert.doesNotMatch(trigger.textContent, /Done/);
  } finally { await ui.dispose(); }
});

test('keyboard selection, all-disabled options and Escape remain usable', async () => {
  const calls = [];
  const ui = await mount({ data: [{ id: 1, status: 'a' }], columns: [{ key: 'status', label: 'Status', editor: { type: 'select', options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }] } }], onCellSave: async event => { calls.push(event); } });
  try {
    const trigger = ui.container.querySelector('[role="combobox"]');
    await focus(trigger); await key(trigger, 'ArrowDown'); await key(trigger, 'ArrowDown'); await key(trigger, 'Enter');
    assert.match(trigger.textContent, /B/); assert.equal(calls.length, 0);
    await key(trigger, 'Tab'); await focus(ui.outside); assert.equal(calls.length, 1);
    await focus(trigger); await key(trigger, 'Enter'); await key(trigger, 'Escape'); assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  } finally { await ui.dispose(); }
  const disabled = await mount({ options: [{ value: 'a', label: 'A', disabled: true }] }, Select);
  try { const trigger = disabled.container.querySelector('[role="combobox"]'); await focus(trigger); await key(trigger, 'ArrowDown'); await key(trigger, 'ArrowDown'); } finally { await disabled.dispose(); }
});

test('per-row editor and readonly render, concurrent saves, unmount and prop updates', async () => {
  const requests = [deferred(), deferred()], calls = [];
  const ui = await mount({ data: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }, { id: 'c', name: 'C' }], columns: [{ ...column, editor: row => row.id === 'c' ? false : { type: 'input' }, render: value => 'Read ' + value }], onCellSave: event => { calls.push(event); return requests[calls.length - 1].promise; } });
  try {
    const inputs = ui.container.querySelectorAll('input'); assert.equal(inputs.length, 2); assert.match(ui.container.textContent, /Read C/);
    await focus(inputs[0]); await change(inputs[0], 'New A'); await focus(inputs[1]); await change(inputs[1], 'New B'); await focus(ui.outside); assert.equal(calls.length, 2);
    await ui.render({ data: [{ id: 'a', name: 'Normalized A' }, { id: 'b', name: 'B' }] });
    await act(async () => requests[0].resolve()); assert.equal(inputs[0].value, 'Normalized A');
    await ui.render({ data: [] }); await act(async () => requests[1].resolve()); assert.equal(calls.length, 2);
  } finally { await ui.dispose(); }
});

test('variants, sizes, layout, readonly compatibility and standalone controls', () => {
  for (const variant of ['default', 'ghost', 'striped', 'outline', 'grid', 'fixed']) {
    for (const size of ['sm', 'default', 'lg']) {
      const markup = renderToStaticMarkup(h(Table, { variant, size, data: [{ id: 0, name: 'A' }], columns: [column], onCellSave: async () => {} }));
      assert.match(markup, /border-0!/); assert.match(markup, /ring-0!/); assert.match(markup, /focus:bg-muted\/60!/);
      if (variant === 'fixed') assert.match(markup, /table-fixed/);
      if (variant === 'grid') assert.match(markup, /\[&amp;_td\]:border/);
    }
  }
  const readonly = renderToStaticMarkup(h(Table, { data: [{ id: 1, name: 'A' }], columns: [{ ...column, render: value => 'Read ' + value }], layout: 'fixed' }));
  assert.doesNotMatch(readonly, /<input/); assert.match(readonly, /Read A/); assert.match(readonly, /table-fixed/);
  assert.throws(() => renderToStaticMarkup(h(Table, { data: [{ name: 'A' }], columns: [column], onCellSave: async () => {} })), /rowKey/);
  assert.throws(() => renderToStaticMarkup(h(Table, { data: [{ id: 1 }, { id: 1 }], columns: [column], onCellSave: async () => {} })), /rowKey/);
  const standalone = renderToStaticMarkup(h(Input, { value: '', readOnly: true })); assert.doesNotMatch(standalone, /border-0!/);
  const badge = renderToStaticMarkup(h(Select, { value: 1, display: 'badge', options: [{ value: 1, label: 'One' }] }));
  // Controlled initial values must render on the server as well as after effects.
  assert.match(badge, /One/); assert.match(badge, /bg-neutral/);
});


test('select failure keeps the badge, retries on blur, and editors do not trigger row actions', async () => {
  let calls = 0, rowClicks = 0, selections = [];
  const previousWidth = window.innerWidth; window.innerWidth = 375;
  const ui = await mount({ selectable: true, onSelectionChange: value => { selections = value; }, onRowClick: () => rowClicks++, data: [{ id: 1, status: 'a' }], columns: [{ key: 'status', label: 'Status', editor: { type: 'select', display: 'badge', options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B', color: 'success' }] } }], onCellSave: async () => { if (++calls === 1) throw Error('Offline'); } });
  try {
    const trigger = ui.container.querySelector('[role="combobox"]');
    await focus(trigger); await click(trigger);
    await act(async () => trigger.dispatchEvent(new Event('touchstart', { bubbles: true })));
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 520)); });
    assert.deepEqual(selections, []);
    await click(ui.container.querySelectorAll('[role="option"]')[1]); assert.equal(rowClicks, 0);
    await focus(ui.outside); assert.equal(calls, 1); assert.match(trigger.innerHTML, /bg-success/);
    assert.match(ui.container.textContent, /Offline/); assert.match(trigger.className, /border-0!/);
    await focus(trigger); await focus(ui.outside); assert.equal(calls, 2); assert.doesNotMatch(ui.container.textContent, /Offline/);
    await click(ui.container.querySelector('tbody tr')); assert.equal(rowClicks, 1);
  } finally { await ui.dispose(); window.innerWidth = previousWidth; }
});

test('readonly table retains sorting, pagination, selection and responsive column policy', async () => {
  let sort, page, selected;
  const columns = ['first', 'second', 'third', 'fourth'].map(key => ({ key, label: key, sortable: true }));
  const ui = await mount({ columns, data: [{ id: 0, first: 'A' }], selectable: true, onSelectionChange: value => { selected = value; }, onSort: value => { sort = value; }, pagination: { currentPage: 1, totalPages: 2, totalItems: 2, itemsPerPage: 1 }, onPageChange: value => { page = value; } });
  try {
    await click(ui.container.querySelectorAll('th')[1]); assert.equal(sort, 'first');
    await click(ui.container.querySelector('tbody input')); assert.deepEqual(selected, [0]);
    const next = [...ui.container.querySelectorAll('button')].find(button => button.textContent.trim() === '2');
    assert.ok(next); await click(next); assert.equal(page, 2);
    assert.match(ui.container.querySelector('tbody td:last-child').className, /hidden md:table-cell/);
    await ui.render({ responsive: false }); assert.doesNotMatch(ui.container.querySelector('tbody td:last-child').className, /hidden/);
  } finally { await ui.dispose(); }
});
