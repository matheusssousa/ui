import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true });
for (const key of ['window', 'document', 'HTMLElement', 'SVGElement', 'Element', 'Event']) globalThis[key] = key === 'window' ? dom.window : dom.window[key];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { default: React, act } = await import('react');
const { createRoot } = await import('react-dom/client');
const { renderToStaticMarkup } = await import('react-dom/server');
const { ProgressBar } = await import('../dist/components/progress-bar.js');
const { Slider } = await import('../dist/components/slider.js');
const { Avatar, AvatarGroup } = await import('../dist/components/avatar.js');
const { Card } = await import('../dist/components/card.js');
const { AreaChart } = await import('../dist/components/chart.js');
const h = React.createElement;
const render = (component, props) => new JSDOM(renderToStaticMarkup(h(component, props))).window.document;

test('progress sanitizes invalid bounds and exposes a named, bounded value', () => {
  for (const [value, max, expected, upper] of [[Infinity, 0, 0, 100], [-10, 50, 0, 50], [120, 100, 100, 100], [25, NaN, 25, 100]]) {
    const doc = render(ProgressBar, { value, max, label: 'Meta', variant: 'segmented', segments: Infinity });
    const bar = doc.querySelector('[role="progressbar"]');
    assert.equal(bar.getAttribute('aria-label'), 'Meta');
    assert.equal(Number(bar.getAttribute('aria-valuenow')), expected);
    assert.equal(Number(bar.getAttribute('aria-valuemax')), upper);
    assert.doesNotMatch(doc.body.innerHTML, /NaN|Infinity/);
  }
});

test('slider labels, form values and invalid configuration remain usable', () => {
  const doc = render(Slider, { label: 'Divisão', name: 'share', defaultValue: 52, step: 5, variant: 'split', description: 'Escolha a proporção' });
  const input = doc.querySelector('input');
  assert.equal(doc.querySelector('label').htmlFor, input.id);
  assert.equal(input.value, '50');
  assert.equal(input.getAttribute('aria-valuetext'), '50% | 50%');
  assert.equal(doc.getElementById(input.getAttribute('aria-describedby')).textContent, 'Escolha a proporção');
  assert.doesNotMatch(render(Slider, { min: NaN, max: Infinity, step: 0, value: NaN }).body.innerHTML, /NaN|Infinity/);
  assert.equal(render(Slider, { max: 99, step: 10, value: 99 }).querySelector('input').value, '90');
});

test('slider supports uncontrolled changes and controlled updates', async () => {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  const changes = [];
  await act(async () => root.render(h(Slider, { defaultValue: 20, onValueChange: value => changes.push(value), label: 'Parte' })));
  const input = container.querySelector('input');
  await act(async () => {
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(input, '65');
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
  });
  assert.deepEqual(changes, [65]);
  assert.equal(container.querySelector('output').textContent, '65');
  await act(async () => root.render(h(Slider, { value: 35, label: 'Parte' })));
  assert.equal(input.value, '35');
  await act(async () => root.unmount());
  container.remove();
});

test('avatar image failure falls back to accessible initials and groups count overflow', async () => {
  const container = document.createElement('div');
  const root = createRoot(container);
  await act(async () => root.render(h(Avatar, { name: 'Hannah Silva', src: '/missing.jpg' })));
  await act(async () => container.querySelector('img').dispatchEvent(new window.Event('error')));
  assert.equal(container.querySelector('[role="img"]').textContent, 'HS');
  assert.equal(container.querySelector('[role="img"]').getAttribute('aria-label'), 'Hannah Silva');
  await act(async () => root.unmount());
  const doc = render(AvatarGroup, { avatars: [{ name: 'Dan' }, { name: 'Hannah' }, { name: 'Ada' }], max: 2 });
  assert.match(doc.body.textContent, /\+1/);
});

test('media card retains content and area chart highlights only the final point', () => {
  const doc = render(Card, { media: h('img', { src: '/beach.jpg', alt: 'Praia' }), title: 'Viagem', eyebrow: 'Meta', children: h('p', null, 'Economia'), footer: 'Rodapé' });
  assert.equal(doc.querySelector('img').alt, 'Praia');
  for (const text of ['Viagem', 'Meta', 'Economia', 'Rodapé']) assert.ok(doc.body.textContent.includes(text));
  const chart = render(AreaChart, { data: [{ label: 'Jun', value: 1 }, { label: 'Jul', value: 2 }], highlightLast: true, animate: false });
  assert.equal(chart.querySelectorAll('circle').length, 1);
});
