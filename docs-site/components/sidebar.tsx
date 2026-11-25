import Link from 'next/link';
import { categories, components } from '../lib/registry';

export function DocsSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 overflow-y-auto border-r border-border bg-background px-5 py-7 lg:block">
      <Link href="/" className="mb-8 block text-lg font-bold tracking-tight text-foreground">
        @matheusssousa/ui
      </Link>
      <nav aria-label="Componentes" className="space-y-7">
        {categories.map((category) => (
          <section key={category}>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{category}</h2>
            <ul className="space-y-0.5">
              {components.filter((item) => item.category === category).map((item) => (
                <li key={item.slug}>
                  <Link href={`/components/${item.slug}`} className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>
    </aside>
  );
}
