import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ComponentDemo } from '../../../components/component-demo';
import { CodeBlock } from '../../../components/code-block';
import { components, getComponent } from '../../../lib/registry';
import { readProps } from '../../../lib/props';
import { readExampleGroups } from '../../../lib/examples';
import { ExampleGallery } from '../../../components/example-gallery';

interface PageProps { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return components.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const component = getComponent((await params).slug);
  return component ? { title: component.name, description: component.description } : {};
}

export default async function ComponentPage({ params }: PageProps) {
  const component = getComponent((await params).slug);
  if (!component) notFound();
  const props = readProps(component);
  const usage = component.name === 'Stepper' ? '<Stepper steps={[{ title: "Dados" }, { title: "Confirmação" }]} currentStep={0} />' : component.name === 'Input' ? '<Input label="Nome" />\n<Input type="image" label="Foto" variant="circle" maxSize={5} onChange={(file, previewUrl) => console.log(file, previewUrl)} />' : `<${component.name} />`;
  const code = `import { ${component.name} } from '@matheusssousa/ui/components/${component.slug}';\n\n${usage}`;

  return (
    <article className="mx-auto max-w-6xl px-5 py-12 lg:px-10 lg:py-16">
      <header className="max-w-3xl">
        <p className="mb-3 text-sm font-semibold text-primary-text">{component.category}</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{component.name}</h1>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">{component.description}</p>
      </header>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">Demonstração</h2>
        <p className="mb-5 mt-2 text-sm text-muted-foreground">Renderização real usando os estilos e tokens atuais da biblioteca.</p>
        <ComponentDemo slug={component.slug} />
        <ExampleGallery slug={component.slug} groups={readExampleGroups(component)} />
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">Uso</h2>
        <p className="mb-5 mt-2 text-sm text-muted-foreground">Importe diretamente pelo caminho do componente.</p>
        <CodeBlock code={code} />
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">Props</h2>
        <p className="mb-5 mt-2 text-sm text-muted-foreground">Props declaradas em <code className="rounded bg-muted px-1.5 py-0.5">src/components/{component.source}</code>.</p>
        {props.length ? (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-3xl border-collapse text-left text-sm">
              <thead className="bg-muted/70 text-foreground"><tr><th className="px-5 py-3 font-semibold">Propriedade</th><th className="px-5 py-3 font-semibold">Tipo</th><th className="px-5 py-3 font-semibold">Descrição</th><th className="px-5 py-3 font-semibold">Obrigatória</th></tr></thead>
              <tbody className="divide-y divide-border">
                {props.map((prop) => <tr key={prop.name} className="align-top"><td className="px-5 py-4 font-mono text-primary-text">{prop.name}</td><td className="max-w-sm px-5 py-4"><code className="break-words rounded bg-muted px-1.5 py-0.5 text-xs">{prop.type}</code></td><td className="px-5 py-4 leading-6 text-muted-foreground">{prop.description || '—'}</td><td className="px-5 py-4">{prop.required ? 'Sim' : 'Não'}</td></tr>)}
              </tbody>
            </table>
          </div>
        ) : <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">Este componente compõe suas props a partir de outros tipos exportados. Consulte o código de uso e os tipos no arquivo-fonte.</div>}
      </section>
    </article>
  );
}
