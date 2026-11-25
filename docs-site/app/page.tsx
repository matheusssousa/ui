import Link from 'next/link';
import { ArrowRightIcon, BookOpenIcon, CubeIcon } from '@phosphor-icons/react/dist/ssr';
import { categories, components } from '../lib/registry';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-10 lg:py-16">
      <div className="max-w-3xl">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-sm font-medium text-primary-text"><BookOpenIcon /> Documentação local</span>
        <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">Componentes da biblioteca, como eles realmente são.</h1>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">Explore os componentes renderizados com os tokens reais, exemplos de uso, variantes, código e referência de props.</p>
        <div className="mt-8 flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="rounded-lg border border-border bg-card px-3 py-2"><strong className="text-foreground">{components.length}</strong> componentes</span>
          <span className="rounded-lg border border-border bg-card px-3 py-2"><strong className="text-foreground">{categories.length}</strong> categorias</span>
        </div>
      </div>
      <div className="mt-16 space-y-14">
        {categories.map((category) => (
          <section key={category}>
            <div className="mb-5 flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary-text"><CubeIcon /></span><h2 className="text-xl font-semibold">{category}</h2></div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {components.filter((item) => item.category === category).map((item) => (
                <Link key={item.slug} href={`/components/${item.slug}`} className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg hover:shadow-black/5 focus-visible:outline-2 focus-visible:outline-ring">
                  <div className="flex items-start justify-between gap-4"><div><h3 className="font-semibold text-card-foreground">{item.name}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p></div><ArrowRightIcon className="mt-1 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary-text" /></div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
