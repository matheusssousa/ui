import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true });
for (const key of ['window', 'document', 'HTMLElement', 'SVGElement', 'Element', 'Event', 'MouseEvent', 'KeyboardEvent']) globalThis[key] = key === 'window' ? dom.window : dom.window[key];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let resize;
let disconnected = false;
globalThis.ResizeObserver = class { constructor(callback) { resize = callback; } observe() {} disconnect() { disconnected = true; } };
const { default: React, act } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToStaticMarkup } = await import('react-dom/server');
const charts = await import('../dist/components/chart.js');
const h = React.createElement;
const data = [{ label: 'Alimentação', value: 2.5 }, { label: 'Transporte', value: 1 }];
const render = (Component, props = {}) => renderToStaticMarkup(h(Component, { data, animate: false, ...props }));

for (const name of ['LineChart', 'AreaChart', 'BarChart', 'PieChart', 'DonutChart', 'SparklineChart', 'RadarChart', 'RadialBarChart']) {
  test(`${name}: empty, single, zero, negative and invalid values have finite geometry`, () => {
    for (const values of [[], [2.5], [0, 0], [-3, 2], [NaN, Infinity, 1]]) {
      const markup = render(charts[name], { data: values.map((value, i) => ({ label: String(i), value })), colors: [] });
      assert.doesNotMatch(markup, /NaN|Infinity/);
      assert.match(markup, /role="(?:group|status)"/);
    }
  });
}
test('decimal ticks stay distinct, horizontal bars use horizontal geometry, and area opacity works', () => {
  const doc = new JSDOM(render(charts.LineChart, { data: [{ label: 'A', value: 0.8 }] })).window.document;
  const labels = [...doc.querySelectorAll('g[aria-hidden] text')].map(e => e.textContent);
  assert.equal(new Set(labels).size, labels.length);
  assert.ok(labels.includes('0,2'));
  const horizontal = new JSDOM(render(charts.BarChart, { horizontal: true, data: [{ label: 'A', value: -2 }, { label: 'B', value: 4 }] })).window.document;
  const bars = [...horizontal.querySelectorAll('rect[fill]:not([fill="transparent"])')];
  assert.equal(bars[0].getAttribute('height'), bars[1].getAttribute('height'));
  assert.ok(Number(bars[1].getAttribute('width')) > Number(bars[0].getAttribute('width')));
  assert.match(render(charts.AreaChart, { gradient: false, fillOpacity: 0.65 }), /fill-opacity="0.65"/);
});
test('single donut has a continuous ring and custom center replaces the default', () => {
  const markup = render(charts.DonutChart, { data: [data[0]], centerContent: h('strong', null, 'R$ 2,50') });
  assert.match(markup, /R\$ 2,50/);
  assert.doesNotMatch(markup, />Total</);
  const doc = new JSDOM(markup).window.document;
  const path = doc.querySelector('path').getAttribute('d');
  assert.equal((path.match(/ A /g) || []).length, 4);
  assert.doesNotMatch(path, / L /);
});
test('hover, focus, Escape, click index, resize, empty-to-data and cleanup', async () => {
  const container = document.createElement('div'); document.body.append(container);
  const root = createRoot(container);
  const calls = [];
  const props = { data: [], animate: false, valueFormatter: value => `R$ ${value.toFixed(2)}`, onDataPointClick: (point, index) => calls.push([point.label, index]) };
  try {
    await act(async () => root.render(h(charts.DonutChart, props)));
    assert.match(container.textContent, /Sem dados/);
    await act(async () => root.render(h(charts.DonutChart, { ...props, data: [{ label: 'Invalid', value: NaN }, ...data] })));
    let target = container.querySelector('svg [tabindex="0"]');
    await act(async () => target.dispatchEvent(new MouseEvent('pointerover', { bubbles: true })));
    assert.match(container.querySelector('[role="tooltip"]').textContent, /R\$ 2.50/);
    await act(async () => target.dispatchEvent(new MouseEvent('pointerout', { bubbles: true })));
    assert.equal(container.querySelector('[role="tooltip"]'), null);
    await act(async () => target.focus());
    assert.ok(container.querySelector('[role="tooltip"]'));
    await act(async () => target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
    assert.deepEqual(calls, [['Alimentação', 1]]);
    await act(async () => target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    assert.equal(container.querySelector('[role="tooltip"]'), null);
    const plot = container.querySelector('svg').parentElement;
    plot.getBoundingClientRect = () => ({ width: 320, height: 160 });
    await act(async () => resize());
    assert.equal(container.querySelector('svg').getAttribute('viewBox'), '0 0 320 160');
  } finally { await act(async () => root.unmount()); container.remove(); }
  assert.equal(disconnected, true);
});

