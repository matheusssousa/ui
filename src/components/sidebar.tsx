'use client';
import * as React from 'react';
import { cn } from '../utils.js';
import { SidebarSection, type SidebarSectionConfig } from './sidebarSection.js';

export interface SidebarProps {
  sections: SidebarSectionConfig[] | Record<string, SidebarSectionConfig>;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onLinkClick?: () => void;
  pathname?: string;
  linkComponent?: React.ElementType;
  can?: (permission: string) => boolean;
  loading?: boolean;
  header?: React.ReactNode | ((isOpen: boolean) => React.ReactNode);
  footer?: React.ReactNode | ((isOpen: boolean) => React.ReactNode);
  className?: string;
  'aria-label'?: string;
}
/** Responsive sidebar with optional permission filtering and no application context dependency. */
export function Sidebar({ sections, isOpen: controlledOpen, defaultOpen = false, onOpenChange, onLinkClick, pathname, linkComponent, can, loading, header, footer, className, 'aria-label': label = 'Menu principal' }: SidebarProps) {
  const [localOpen, setLocalOpen] = React.useState(defaultOpen);
  const isOpen = controlledOpen ?? localOpen;
  const setOpen = (open: boolean) => { setLocalOpen(open); onOpenChange?.(open); };
  const slot = (value: SidebarProps['header']) => typeof value === 'function' ? value(isOpen) : value;
  return <aside aria-label={label} className={cn('ui-sidebar flex shrink-0 flex-col gap-4 bg-card py-3', className)} data-open={isOpen} onKeyDown={event => { if (event.key === 'Escape') setOpen(false); }}>
    <div className="flex items-center justify-between gap-2 px-4">{slot(header)}<button type="button" className="rounded-md p-2 hover:bg-accent" aria-label={isOpen ? 'Recolher menu' : 'Expandir menu'} aria-expanded={isOpen} onClick={() => setOpen(!isOpen)}><span aria-hidden="true">☰</span></button></div>
    <nav aria-label={label} className="ui-sidebar-content min-h-0 flex-1 space-y-4 overflow-y-auto px-4" aria-busy={loading || undefined}>
      {loading ? <span role="status">Carregando menu…</span> : Object.values(sections).map(section => <SidebarSection key={section.title} section={section} isOpen={isOpen} pathname={pathname} linkComponent={linkComponent} can={can} onLinkClick={() => { if (window.innerWidth < 768) setOpen(false); onLinkClick?.(); }} />)}
    </nav>
    {footer && <div className="ui-sidebar-content px-4 text-center text-xs text-muted-foreground">{slot(footer)}</div>}
  </aside>;
}
