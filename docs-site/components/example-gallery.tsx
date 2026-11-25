'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ComponentDemo } from './component-demo';
import { CodeBlock } from './code-block';
import type { ExampleGroup } from '../lib/examples';
import { PlusIcon, ArrowRightIcon } from '@phosphor-icons/react/dist/ssr';

/** Uma demonstração isolada permite repetir animações sem afetar as demais. */
function Example({ slug, property, value }: { slug: string; property: string; value: string | number | boolean }) {
  const [iteration, setIteration] = useState(0);
  const [visible, setVisible] = useState(true);
  const overrides: Record<string, unknown> = { [property]: value };
  if (property === 'gradient') {
    if (slug === 'progress-bar') overrides.color = 'gradient';
    else overrides.variant = 'gradient';
    if (value === 'gradient-image') overrides.gradient = { preset: value, image: 'https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?auto=format&fit=crop&w=1000&q=80' };
  }
  return <section className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h3 className="font-mono text-sm">{property} = {String(value)}</h3>
      <div className="flex gap-3 text-sm"><button type="button" onClick={() => setIteration(current => current + 1)}>Repetir</button><button type="button" onClick={() => setVisible(current => !current)}>{visible ? 'Ocultar' : 'Mostrar'}</button></div>
    </div>
    <AnimatePresence mode="wait">{visible && <ComponentDemo key={iteration} slug={slug} overrides={overrides} />}</AnimatePresence>
    <details><summary className="cursor-pointer text-sm text-primary-text">Props deste exemplo</summary><CodeBlock code={Object.entries(overrides).map(([name, item]) => `${name}={${JSON.stringify(item)}}`).join('\n')} /></details>
  </section>;
}

export function ExampleGallery({ slug, groups }: { slug: string; groups: ExampleGroup[] }) {
  const buttonExamples = [
    { title: 'Ícone à esquerda', props: { leftIcon: <PlusIcon /> }, code: 'leftIcon={<PlusIcon />}' },
    { title: 'Ícone à direita', props: { rightIcon: <ArrowRightIcon /> }, code: 'rightIcon={<ArrowRightIcon />}' },
    { title: 'Somente ícone', props: { children: <PlusIcon />, 'aria-label': 'Adicionar' }, code: 'aria-label="Adicionar" children={<PlusIcon />}' },
    { title: 'Copiar conteúdo', props: { copyValue: 'Texto de exemplo' }, code: 'copyValue="Texto de exemplo"' },
    { title: 'Link', props: { asLink: true, href: '#top' }, code: 'asLink href="#top"' },
  ];
  const imageExamples = [
    ...['circle', 'square', 'rectangle'].flatMap(variant => ['sm', 'md', 'lg'].map(size => ({ title: variant + ' / ' + size, props: { type: 'image', variant, size } }))),
    { title: 'Sem imagem', props: { type: 'image', currentImageUrl: null } },
    { title: 'Carregando', props: { type: 'image', isLoading: true } },
    { title: 'Desabilitado', props: { type: 'image', disabled: true } },
    { title: 'Erro', props: { type: 'image', error: 'Escolha uma imagem válida.' } },
    { title: 'Obrigatório', props: { type: 'image', currentImageUrl: null, required: true } },
  ];
  return <div className="mt-10 space-y-12">{slug === 'input' && imageExamples.map(example => <section key={example.title} className="space-y-3"><h2 className="text-xl font-semibold">Imagem: {example.title}</h2><ComponentDemo slug={slug} overrides={example.props} /><CodeBlock code={'<Input ' + Object.entries(example.props).map(([name, value]) => name + '={' + JSON.stringify(value) + '}').join(' ') + ' />'} /></section>)}{slug === 'button' && buttonExamples.map(example => <section key={example.title} className="space-y-3"><h2 className="text-xl font-semibold">{example.title}</h2><ComponentDemo slug={slug} overrides={example.props} /><CodeBlock code={example.code} /></section>)}{groups.map(group => <section key={group.name}>
    <h2 className="mb-6 text-2xl font-semibold">{group.name} <span className="text-sm font-normal text-muted-foreground">{group.values.length} opções</span></h2>
    <div className="space-y-8">{group.values.map(value => <Example key={String(value)} slug={slug} property={group.name} value={value} />)}</div>
  </section>)}</div>;
}
