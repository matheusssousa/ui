import type { Metadata } from 'next';
import Link from 'next/link';
import { DocsSidebar } from '../components/sidebar';
import { ThemeToggle } from '../components/theme-toggle';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: { default: '@matheusssousa/ui', template: '%s · @matheusssousa/ui' },
  description: 'Documentação e exemplos da biblioteca de componentes.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>
          <DocsSidebar />
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/90 px-5 backdrop-blur lg:ml-72 lg:px-10">
            <Link href="/" className="font-semibold lg:hidden">@matheusssousa/ui</Link>
            <p className="hidden text-sm text-muted-foreground lg:block">Documentação de componentes</p>
            <ThemeToggle />
          </header>
          <main className="lg:ml-72">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
