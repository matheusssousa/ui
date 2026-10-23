import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://example.test', pretendToBeVisual: true });
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
    assert.doesNotMatch(ui.container.querySelector('tbody td:last-child').className, /hidden/);
    await ui.render({ mobileLayout: 'responsive' });
    assert.match(ui.container.querySelector('tbody td:last-child').className, /hidden md:table-cell/);
    await ui.render({ responsive: false }); assert.doesNotMatch(ui.container.querySelector('tbody td:last-child').className, /hidden/);
  } finally { await ui.dispose(); }
});


test('row mode batches cells on row exit, locks the whole row, and does not call cell saving', async () => {
  const calls = [], request = deferred(); let cellCalls = 0;
  const columns = [column, { key: 'amount', label: 'Amount', editor: { type: 'input', parse: value => Number(value) } }];
  const ui = await mount({ columns, data: [{ id: 0, name: 'Before', amount: 1 }, { id: 2, name: 'Other', amount: 2 }], saveMode: 'row', onRowSave: event => { calls.push(event); return request.promise; }, onCellSave: async () => cellCalls++ });
  try {
    const [name, amount, other] = ui.container.querySelectorAll('input');
    await focus(name); await focus(other); assert.equal(calls.length, 0);
    await focus(name); await change(name, 'After'); await focus(amount); assert.equal(calls.length, 0);
    await change(amount, '3'); await focus(other); assert.equal(calls.length, 1); assert.equal(cellCalls, 0);
    assert.deepEqual(calls[0], { row: { id: 0, name: 'Before', amount: 1 }, rowKey: 0, changes: { name: 'After', amount: 3 }, previousValues: { name: 'Before', amount: 1 }, updatedRow: { id: 0, name: 'After', amount: 3 } });
    assert.equal(name.disabled, true); assert.equal(amount.disabled, true); assert.equal(other.disabled, false);
    await act(async () => name.dispatchEvent(new dom.window.FocusEvent('focusout', { bubbles: true }))); assert.equal(calls.length, 1);
    await act(async () => request.resolve());
    await focus(name); await focus(ui.outside); assert.equal(calls.length, 1);
    await focus(amount); await change(amount, '4'); await focus(ui.outside); assert.equal(calls.length, 2);
    assert.deepEqual(calls[1].changes, { amount: 4 }); assert.equal(calls[1].updatedRow.name, 'After');
  } finally { await ui.dispose(); }
});

test('row validation prevents partial saves and failure retains all drafts for retry', async () => {
  const calls = [];
  const ui = await mount({ columns: [column, { key: 'amount', label: 'Amount', editor: { type: 'input', parse: value => Number(value), validate: value => value < 0 ? 'Positive only' : undefined } }], data: [{ id: 1, name: 'Before', amount: 1 }], saveMode: 'row', onRowSave: async event => { calls.push(event); if (calls.length === 1) throw Error('Offline row'); } });
  try {
    const [name, amount] = ui.container.querySelectorAll('input');
    await focus(name); await change(name, 'After'); await focus(amount); await change(amount, '-1'); await focus(ui.outside);
    assert.equal(calls.length, 0); assert.match(ui.container.textContent, /Positive only/);
    await focus(amount); await change(amount, '2'); await focus(ui.outside);
    assert.equal(calls.length, 1); assert.match(ui.container.textContent, /Offline row/); assert.equal(name.value, 'After'); assert.equal(amount.value, '2');
    await click(ui.container.querySelector('button')); assert.equal(calls.length, 2); assert.deepEqual(calls[0].changes, calls[1].changes);
    assert.doesNotMatch(ui.container.textContent, /Offline row/);
    await focus(name); await change(name, 'Before'); await focus(ui.outside); assert.equal(calls.length, 3); assert.equal(calls[2].previousValues.name, 'After');
  } finally { await ui.dispose(); }
});

test('row mode keeps select/search focus internal and allows independent concurrent rows', async () => {
  const calls = [], requests = [deferred(), deferred()];
  const ui = await mount({ columns: [column, { key: 'status', label: 'Status', editor: { type: 'select', searchable: true, display: 'badge', options: [{ value: 0, label: 'Pending' }, { value: 1, label: 'Done', color: 'success' }] } }], data: [{ id: 1, name: 'A', status: 0 }, { id: 2, name: 'B', status: 0 }], saveMode: 'row', onRowSave: event => { calls.push(event); return requests[calls.length - 1].promise; } });
  try {
    const names = ui.container.querySelectorAll('input:not([type="hidden"])');
    const trigger = ui.container.querySelector('[role="combobox"]');
    await focus(names[0]); await change(names[0], 'New A'); await focus(trigger); await click(trigger);
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 10)); });
    assert.equal(calls.length, 0);
    await click(ui.container.querySelectorAll('[role="option"]')[1]); assert.equal(calls.length, 0);
    await focus(names[1]); assert.equal(calls.length, 1); assert.deepEqual(calls[0].changes, { name: 'New A', status: 1 });
    await change(names[1], 'New B'); await focus(ui.outside); assert.equal(calls.length, 2);
    await ui.render({ data: [{ id: 2, name: 'B', status: 0 }, { id: 1, name: 'Server A', status: 1 }] });
    await act(async () => requests[0].resolve()); assert.equal(ui.container.querySelector('[aria-label="Name, linha 1"]').value, 'Server A');
    await ui.render({ data: [] }); await act(async () => requests[1].resolve()); assert.equal(calls.length, 2);
  } finally { await ui.dispose(); }
});

test('row mode requires its own callback; reverting a draft does not save', async () => {
  const markup = renderToStaticMarkup(h(Table, { columns: [column], data: [{ id: 1, name: 'A' }], saveMode: 'row', onCellSave: async () => {} }));
  assert.doesNotMatch(markup, /<input/);
  let calls = 0;
  const ui = await mount({ columns: [column], data: [{ id: 1, name: 'A' }], saveMode: 'row', onRowSave: async () => { if (++calls === 1) throw Error('Retry by blur'); } });
  try {
    const input = ui.container.querySelector('input');
    await focus(input); await change(input, 'B'); await change(input, 'A'); await focus(ui.outside); assert.equal(calls, 0);
    await focus(input); await change(input, 'B'); await focus(ui.outside); assert.equal(calls, 1);
    await focus(input); await focus(ui.outside); assert.equal(calls, 2); assert.doesNotMatch(ui.container.textContent, /Retry by blur/);
  } finally { await ui.dispose(); }
});


test('spreadsheet selects cells, edits by typing or F2, restores the edit session and navigates rows', async () => {
  const calls = [];
  const ui = await mount({ variant: 'spreadsheet', saveMode: 'row', columns: [column, { ...column, key: 'note', label: 'Note' }], data: [{ id: 1, name: 'A', note: 'One' }, { id: 2, name: 'B', note: 'Two' }], onRowSave: async event => calls.push(event) });
  try {
    let cells = ui.container.querySelectorAll('[role="gridcell"]');
    assert.equal(ui.container.querySelector('input'), null);
    await focus(cells[0]); await key(cells[0], 'x');
    let input = cells[0].querySelector('input'); assert.equal(input.value, 'x');
    await change(input, 'New A'); await key(input, 'Tab');
    assert.equal(document.activeElement, cells[1]); assert.equal(calls.length, 0);
    await key(cells[1], 'F2'); input = cells[1].querySelector('input'); assert.equal(input.value, 'One');
    await change(input, 'Do not keep'); await key(input, 'Escape'); assert.match(cells[1].textContent, /One/); assert.match(cells[0].textContent, /New A/);
    await key(cells[1], 'ArrowLeft'); assert.equal(document.activeElement, cells[0]);
    await key(cells[0], 'Enter'); assert.equal(document.activeElement, cells[2]); assert.equal(calls.length, 1);
    assert.deepEqual(calls[0].changes, { name: 'New A' });
    await act(async () => cells[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true, bubbles: true })));
    assert.equal(document.activeElement, cells[0]);
    await act(async () => cells[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true })));
  } finally { await ui.dispose(); }
});

test('spreadsheet text arrows stay in the editor and select keys stay in the open list', async () => {
  const ui = await mount({ appearance: 'spreadsheet', variant: 'grid', columns: [column, { key: 'status', label: 'Status', editor: { type: 'select', options: [{ value: 0, label: 'A' }, { value: 1, label: 'B' }] } }], data: [{ id: 1, name: 'Text', status: 0 }], saveMode: 'row', onRowSave: async () => {} });
  try {
    const cells = ui.container.querySelectorAll('[role="gridcell"]');
    await focus(cells[0]); await key(cells[0], 'F2'); const input = cells[0].querySelector('input');
    await key(input, 'ArrowRight'); assert.equal(document.activeElement, input);
    await key(input, 'Tab'); await key(cells[1], 'F2');
    const trigger = cells[1].querySelector('[role="combobox"]');
    await key(trigger, 'ArrowDown'); await key(trigger, 'ArrowDown'); await key(trigger, 'Enter');
    assert.equal(document.activeElement, trigger); assert.match(trigger.textContent, /B/);
    await key(trigger, 'Escape'); assert.match(cells[1].textContent, /A/);
  } finally { await ui.dispose(); }
});

test('draft-dependent editors and patches update immediately; full row validation includes untouched required fields', async () => {
  const editingRef = React.createRef(), htmlRef = React.createRef(), states = [], calls = [];
  const columns = [
    { key: 'kind', label: 'Kind', editor: { type: 'select', options: [{ value: 'expense', label: 'Expense' }, { value: 'transfer', label: 'Transfer' }], onChange: value => value === 'transfer' ? { category: undefined } : { destination: undefined } } },
    { key: 'category', label: 'Category', editor: row => ({ type: 'input', disabled: row.kind === 'transfer', required: row.kind !== 'transfer' }) },
    { key: 'destination', label: 'Destination', editor: row => ({ type: 'input', disabled: row.kind !== 'transfer', required: row.kind === 'transfer' }) },
  ];
  const ui = await mount({ ref: htmlRef, editingRef, onEditingStateChange: state => states.push(state), columns, data: [{ id: 1, kind: 'expense', category: 'Food', destination: '' }], saveMode: 'row', onRowSave: async event => calls.push(event) });
  try {
    assert.equal(htmlRef.current.tagName, 'TABLE');
    const trigger = ui.container.querySelector('[role="combobox"]'); await focus(trigger); await click(trigger); await click(ui.container.querySelectorAll('[role="option"]')[1]);
    const category = ui.container.querySelector('[aria-label="Category, linha 1"]'), destination = ui.container.querySelector('[aria-label="Destination, linha 1"]');
    assert.equal(category.disabled, true); assert.equal(destination.disabled, false); assert.equal(category.value, '');
    assert.deepEqual(editingRef.current.getDraftRow(1), { id: 1, kind: 'transfer', category: undefined, destination: '' });
    let result; await act(async () => { result = await editingRef.current.saveRow(1); });
    assert.equal(result.status, 'invalid'); assert.ok(result.errors.destination); assert.equal(calls.length, 0);
    await act(async () => { assert.equal(editingRef.current.focusCell(1, 'destination'), true); }); assert.equal(document.activeElement, destination);
    await change(destination, 'Savings'); await focus(ui.outside); assert.equal(calls.length, 1); assert.equal(calls[0].changes.category, undefined);
    assert.ok(states.some(state => state.dirtyRows.includes(1))); assert.deepEqual(editingRef.current.getEditingState().dirtyRows, []);
    await act(async () => { editingRef.current.patchDraft(1, { destination: 'Other' }); });
    await act(async () => { assert.equal(editingRef.current.discardRow(1), true); }); assert.equal(destination.value, 'Savings');
  } finally { await ui.dispose(); }
});

test('saveAll waits in-flight requests, reports failures, preserves off-page drafts and permits discard', async () => {
  const editingRef = React.createRef(), request = deferred(), calls = [];
  const ui = await mount({ editingRef, columns: [column], data: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }], saveMode: 'row', onRowSave: event => { calls.push(event); return event.rowKey === 1 ? request.promise : Promise.reject(Error('Offline')); } });
  try {
    await act(async () => { editingRef.current.setDraftValue(1, 'name', 'New A'); editingRef.current.setDraftValue(2, 'name', 'New B'); });
    let saving; await act(async () => { saving = editingRef.current.saveRow(1); });
    assert.equal(calls.length, 1); assert.equal(editingRef.current.discardRow(1), false);
    await ui.render({ data: [{ id: 1, name: 'A' }] });
    let all, finished = false;
    await act(async () => { all = editingRef.current.saveAll().then(result => { finished = true; return result; }); });
    assert.equal(finished, false); assert.equal(calls.length, 2);
    await act(async () => request.resolve()); const result = await all;
    assert.equal((await saving).ok, true); assert.equal(result.ok, false); assert.equal(result.results.find(row => row.rowKey === 2).status, 'error');
    assert.deepEqual(editingRef.current.getEditingState().dirtyRows, [2]);
    await act(async () => { editingRef.current.discardRow(2); }); assert.deepEqual(editingRef.current.getEditingState().dirtyRows, []);
    assert.equal((await editingRef.current.saveRow('missing')).status, 'not-found');
  } finally { await ui.dispose(); }
});

test('money and date editors send exact decimal and ISO strings and format editable cells when idle', async () => {
  const calls = [];
  const ui = await mount({ variant: 'spreadsheet', saveMode: 'row', columns: [
    { key: 'amount', label: 'Amount', editor: { type: 'money' } },
    { key: 'date', label: 'Date', editor: { type: 'date', required: true } },
    { key: 'note', label: 'Note', editor: { type: 'input' }, render: value => 'Formatted ' + value },
  ], data: [{ id: 1, amount: '9007199254740993.01', date: '2026-10-19', note: 'note' }], onRowSave: async event => calls.push(event) });
  try {
    const cells = ui.container.querySelectorAll('[role="gridcell"]');
    assert.match(cells[0].textContent, /9\.007\.199\.254\.740\.993,01/); assert.match(cells[0].className, /tabular-nums/);
    assert.match(cells[1].textContent, /19\/10\/2026/); assert.match(cells[2].textContent, /Formatted note/);
    await focus(cells[0]); await key(cells[0], 'F2'); let input = cells[0].querySelector('input');
    await change(input, '145,50'); await key(input, 'Tab');
    await key(cells[1], 'F2'); input = cells[1].querySelector('input'); assert.equal(input.type, 'text');
    await click(input);
    let dialog = document.body.querySelector('[role="dialog"]');
    assert.ok(dialog); assert.equal(ui.container.contains(dialog), false);
    assert.equal(dialog.style.position, 'fixed'); assert.ok(parseFloat(dialog.style.width) >= 304);
    await focus(dialog.querySelector('button')); assert.equal(calls.length, 0);
    await click(dialog.querySelectorAll('button')[2]);
    dialog = document.body.querySelector('[role="dialog"]');
    await click([...dialog.querySelectorAll('button')].find(button => button.textContent.trim() === '2'));
    assert.equal(document.activeElement, input); await focus(ui.outside);
    assert.equal(calls.length, 1); assert.deepEqual(calls[0].changes, { amount: '145.50', date: '2026-11-02' });
  } finally { await ui.dispose(); }
});

test('spreadsheet copy is single-cell text; range paste is not interpreted; stacked layout exposes every label', async () => {
  const ui = await mount({ appearance: 'spreadsheet', mobileLayout: 'stacked', columns: ['a', 'b', 'c', 'd'].map(key => ({ key, label: key, editor: { type: 'input' } })), data: [{ id: 1, a: 'Copy me', b: 'B', c: 'C', d: 'D' }], onCellSave: async () => {} });
  try {
    const cells = ui.container.querySelectorAll('[role="gridcell"]');
    assert.equal(cells.length, 4); assert.equal(ui.container.querySelectorAll('.ui-table-mobile-label').length, 4);
    for (const cell of cells) assert.doesNotMatch(cell.className, /hidden/);
    await focus(cells[0]); let copied;
    const copy = new Event('copy', { bubbles: true, cancelable: true }); Object.defineProperty(copy, 'clipboardData', { value: { setData: (type, text) => { copied = text; } } });
    await act(async () => cells[0].dispatchEvent(copy)); assert.equal(copied, 'Copy me');
    const paste = new Event('paste', { bubbles: true, cancelable: true }); Object.defineProperty(paste, 'clipboardData', { value: { getData: () => 'A\tB\nC\tD' } });
    await act(async () => cells[0].dispatchEvent(paste)); assert.equal(ui.container.querySelector('input'), null);
    assert.match(ui.container.querySelector('table').className, /ui-table-sticky/);
  } finally { await ui.dispose(); }
});

test('one click focuses the spreadsheet input and opens select options; readonly cells stay readonly', async () => {
  const ui = await mount({ variant: 'spreadsheet', saveMode: 'row', columns: [column,
    { key: 'status', label: 'Status', editor: { type: 'select', options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }] } },
    { key: 'locked', label: 'Locked', editor: { type: 'input', disabled: true } }],
    data: [{ id: 1, name: 'Original', status: 'a', locked: 'Locked' }], onRowSave: async () => {} });
  try {
    const cells = ui.container.querySelectorAll('[role="gridcell"]');
    await click(cells[0]);
    const input = cells[0].querySelector('input');
    assert.equal(input.value, 'Original'); assert.equal(document.activeElement, input);
    await change(input, 'Changed'); await key(input, 'Escape');
    assert.match(cells[0].textContent, /Original/);
    await click(cells[1]);
    assert.equal(cells[1].querySelector('[role="combobox"]').getAttribute('aria-expanded'), 'true');
    await click(cells[1].querySelectorAll('[role="option"]')[1]);
    assert.match(cells[1].querySelector('[role="combobox"]').textContent, /B/);
    await click(cells[2]); assert.equal(cells[2].querySelector('input'), null);
  } finally { await ui.dispose(); }
});

test('sidebar supports optional permissions, recursive menus and controlled collapse', async () => {
  const { Sidebar } = await import('../dist/components/sidebar.js');
  const sections = [{ title: 'Main', items: [
    { label: 'Home', href: '/home' },
    { label: 'Restricted', href: '/private', permission: 'view_private' },
    { label: 'Parent', href: '/parent', subItems: [{ label: 'Child', href: '/parent/child', permission: 'child' }] }
  ] }];
  const ui = await mount({ sections, defaultOpen: true, pathname: '/home' }, Sidebar);
  try {
    assert.ok(ui.container.querySelector('a[href="/private"]'));
    assert.equal(ui.container.querySelector('a[href="/home"]').getAttribute('aria-current'), 'page');
    await click(ui.container.querySelector('[aria-label="Alternar Parent"]'));
    assert.ok(ui.container.querySelector('a[href="/parent/child"]'));
    await ui.render({ can: () => false });
    assert.equal(ui.container.querySelector('a[href="/private"]'), null);
    assert.equal(ui.container.querySelector('a[href="/parent/child"]'), null);
    assert.ok(ui.container.querySelector('a[href="/parent"]'));
    await click(ui.container.querySelector('[aria-label="Recolher menu"]'));
    assert.equal(ui.container.querySelector('aside').getAttribute('data-open'), 'false');
    await ui.render({ isOpen: true });
    assert.equal(ui.container.querySelector('aside').getAttribute('data-open'), 'true');
  } finally { await ui.dispose(); }
});


test('date picker fits narrow viewports, respects bounds and returns focus on Escape', async () => {
  const previousWidth = window.innerWidth;
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 280 });
  for (const label of [undefined, 'Data']) {
    const ui = await mount({ type: 'date', label, value: '2026-10-19', min: '2026-10-10', max: '2026-10-20' }, Input);
    try {
      const input = ui.container.querySelector('input');
      await focus(input); await click(input);
      const dialog = document.body.querySelector('[role="dialog"]');
      assert.ok(dialog); assert.equal(dialog.parentElement, document.body);
      assert.ok(parseFloat(dialog.style.width) <= 264);
      const days = [...dialog.querySelectorAll('button')];
      assert.equal(days.find(button => button.textContent.trim() === '9').disabled, true);
      assert.equal(days.find(button => button.textContent.trim() === '19').disabled, false);
      assert.equal(days.find(button => button.textContent.trim() === '21').disabled, true);
      await focus(days[0]); await key(days[0], 'Escape');
      assert.equal(document.body.querySelector('[role="dialog"]'), null);
      assert.equal(document.activeElement, input);
    } finally { await ui.dispose(); }
  }
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: previousWidth });
});
