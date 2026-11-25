import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true });
for (const name of ['window', 'document', 'HTMLElement', 'Element', 'Node', 'MouseEvent', 'KeyboardEvent']) {
  globalThis[name] = name === 'window' ? dom.window : dom.window[name];
}
globalThis.ResizeObserver = class { observe() {} disconnect() {} };
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { default: React, act } = await import('react');
const { createRoot } = await import('react-dom/client');
const { Dropdown, DropdownTrigger, DropdownContent, DropdownItem } = await import('../dist/components/dropdown.js');
const h = React.createElement;

test('pointer opening focuses the menu; keyboard opening focuses the first enabled item', async () => {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  const key = async (element, value) => act(async () => element.dispatchEvent(new KeyboardEvent('keydown', { key: value, bubbles: true })));
  const settle = async () => act(async () => { await new Promise(resolve => setTimeout(resolve, 40)); });
  try {
    await act(async () => root.render(h(Dropdown, null,
      h(DropdownTrigger, null, 'Abrir'),
      h(DropdownContent, null, h(DropdownItem, { disabled: true }, 'Bloqueado'), h(DropdownItem, null, 'Primeiro'), h(DropdownItem, null, 'Último')),
    )));
    const trigger = container.querySelector('button');
    assert.equal(trigger.getAttribute('aria-expanded'), 'false');
    await act(async () => trigger.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 })));
    await settle();
    const menu = document.querySelector('[role="menu"]');
    assert.equal(document.activeElement, menu);
    await key(menu, 'ArrowUp');
    assert.equal(document.activeElement.textContent, 'Último');
    await key(document.activeElement, 'Escape');
    assert.equal(document.activeElement, trigger);
    await settle();
    await key(trigger, 'ArrowDown');
    await settle();
    assert.equal(document.activeElement.textContent, 'Primeiro');
    await key(document.activeElement, 'ArrowDown');
    assert.equal(document.activeElement.textContent, 'Último');
  } finally {
    await act(async () => root.unmount());
    container.remove();
    dom.window.close();
  }
});
