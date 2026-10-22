'use client';
import * as React from 'react';
import { cn } from '../utils.js';
import { toneClasses, type UIColor } from './theme.js';
import { SidebarSection, type SidebarSectionConfig } from './sidebarSection.js';

export type SidebarSlot = React.ReactNode | ((isOpen: boolean) => React.ReactNode);

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
  /** Logo visible in both expanded and collapsed states. */
  logo?: SidebarSlot;
  /** Brand name visible only when expanded. */
  name?: React.ReactNode;
  /** Search above navigation. Render functions can supply a collapsed control. */
  search?: SidebarSlot;
  /** Notifications anchored below navigation and footer. */
  notifications?: SidebarSlot;
  /** Active item and hover tone. @default 'secondary' */
  color?: UIColor;
  /** Enable hover backgrounds. @default true */
  hover?: boolean;
  header?: SidebarSlot;
  footer?: SidebarSlot;
  className?: string;
  'aria-label'?: string;
}
/** Responsive sidebar with optional permission filtering and no application context dependency. */
export function Sidebar({ sections, isOpen: controlledOpen, defaultOpen = false, onOpenChange, onLinkClick, pathname, linkComponent, can, loading, logo, name, search, notifications, color = 'secondary', hover = true, header, footer, className, 'aria-label': label = 'Menu principal' }: SidebarProps) {
  const [localOpen, setLocalOpen] = React.useState(defaultOpen);
  const isOpen = controlledOpen ?? localOpen;
  const setOpen = (open: boolean) => { setLocalOpen(open); onOpenChange?.(open); };
  const slot = (value: SidebarProps['header']) => typeof value === 'function' ? value(isOpen) : value;
  return <aside aria-label={label} className={cn('ui-sidebar flex shrink-0 flex-col gap-4 bg-card py-3 text-card-foreground', className)} data-open={isOpen} onKeyDown={event => { if (event.key === 'Escape') setOpen(false); }}>
    <div className={cn('flex items-center gap-2 px-4', isOpen ? 'justify-between' : 'flex-col')}>
      {(logo != null || (isOpen && name != null)) && <div className="flex min-w-0 items-center gap-2">
        {logo != null && <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden [&>img]:max-h-full [&>img]:max-w-full [&>svg]:h-full [&>svg]:w-full">{slot(logo)}</div>}
        {isOpen && name != null && <span className="truncate font-semibold">{name}</span>}
      </div>}
      {slot(header)}
      <button type="button" className={cn('shrink-0 rounded-md p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', toneClasses[color].text, hover && toneClasses[color].hoverSoft)} aria-label={isOpen ? 'Recolher menu' : 'Expandir menu'} aria-expanded={isOpen} onClick={() => setOpen(!isOpen)}><span aria-hidden="true">☰</span></button>
    </div>
    {search != null && <div className="ui-sidebar-content shrink-0 px-4">{slot(search)}</div>}
    <nav aria-label={label} className="ui-sidebar-content min-h-0 flex-1 space-y-4 overflow-y-auto px-4" aria-busy={loading || undefined}>
      {loading ? <span role="status">Carregando menu…</span> : Object.values(sections).map(section => <SidebarSection key={section.title} section={section} isOpen={isOpen} color={color} hover={hover} pathname={pathname} linkComponent={linkComponent} can={can} onLinkClick={() => { if (window.innerWidth < 768) setOpen(false); onLinkClick?.(); }} />)}
    </nav>
    {footer != null && <div className="ui-sidebar-content shrink-0 px-4 text-center text-xs text-muted-foreground">{slot(footer)}</div>}
    {notifications != null && <div className="ui-sidebar-content shrink-0 px-4">{slot(notifications)}</div>}
  </aside>;
}
