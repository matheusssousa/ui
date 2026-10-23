'use client';
import * as React from 'react';
import { cn } from '../utils.js';
import { toneClasses, type UIColor } from './theme.js';
import { SidebarSection, type SidebarSectionConfig } from './sidebarSection.js';

export type SidebarSlot = React.ReactNode | ((isOpen: boolean) => React.ReactNode);

export type SidebarPart = 'brand' | 'header' | 'toggle' | 'search' | 'navigation' | 'notifications' | 'footer';
export interface SidebarProps {
  variant?: 'default' | 'outline' | 'floating' | 'compact' | 'glass';
  side?: 'left' | 'right';
  position?: 'static' | 'sticky' | 'fixed';
  animation?: 'none' | 'smooth' | 'spring';
  itemVariant?: 'solid' | 'soft' | 'outline' | 'minimal';
  itemShape?: 'rounded' | 'pill' | 'square';
  iconPosition?: 'start' | 'end' | 'top';
  align?: 'start' | 'center' | 'end';
  /** Ordem visual e de teclado; partes omitidas sao acrescentadas ao final. */
  order?: SidebarPart[];
  slotAlign?: Partial<Record<SidebarPart, 'start' | 'center' | 'end'>>;
  slotClassNames?: Partial<Record<SidebarPart, string>>;
  width?: number | string;
  collapsedWidth?: number | string;

  sections: SidebarSectionConfig[] | Record<string, SidebarSectionConfig>; // Sections to display in the sidebar, can be an array or an object with section titles as keys.
  isOpen?: boolean; // Whether the sidebar is open, if provided the sidebar will be controlled by the parent component.
  defaultOpen?: boolean; // Whether the sidebar is open by default, only used when the sidebar is uncontrolled.
  onOpenChange?: (open: boolean) => void; // Optional callback for when the sidebar open state changes, useful for controlling the sidebar state from a parent component.
  onLinkClick?: () => void; // Optional callback for when a link in the sidebar is clicked, useful for closing the sidebar on mobile.
  pathname?: string; // Optional current pathname to highlight the active link in the sidebar.
  linkComponent?: React.ElementType; // Optional custom link component to use for the sidebar links, defaults to 'a'.
  can?: (permission: string) => boolean; // Optional permission checking function to filter sections and links based on user permissions.
  loading?: boolean; // Whether the sidebar is in a loading state, which will display a loading indicator instead of the sections.
  logo?: SidebarSlot; // Optional logo content to display at the top of the sidebar, next to the name when the sidebar is open.
  name?: React.ReactNode; // Optional name to display next to the logo when the sidebar is open.
  search?: SidebarSlot; // Optional search content to display at the top of the sidebar, below the header.
  notifications?: SidebarSlot; // Optional notifications content to display at the bottom of the sidebar, above the footer.
  color?: UIColor; // Color theme for the sidebar, defaults to 'secondary'.
  hover?: boolean; // Whether to apply hover styles to the sidebar items.
  header?: SidebarSlot; // Optional header content to display at the top of the sidebar, next to the logo and name.
  footer?: SidebarSlot; // Optional footer content to display at the bottom of the sidebar.
  className?: string; // Additional class names to apply to the sidebar container.
  'aria-label'?: string; // Accessible label for the sidebar, defaults to 'Menu principal'.
}

/** Sidebar with configurable appearance, placement and slots. */
export function Sidebar({ sections, isOpen: controlledOpen, defaultOpen = false, onOpenChange, onLinkClick, pathname, linkComponent, can, loading, logo, name, search, notifications, color = 'secondary', hover = true, header, footer, className, variant = 'default', side = 'left', position = 'sticky', animation = 'smooth', itemVariant = 'solid', itemShape = 'rounded', iconPosition = 'start', align = 'start', order, slotAlign, slotClassNames, width = 240, collapsedWidth = 80, 'aria-label': label = 'Menu principal' }: SidebarProps) {
  const [localOpen, setLocalOpen] = React.useState(defaultOpen);
  const isOpen = controlledOpen ?? localOpen;
  const setOpen = (open: boolean) => { setLocalOpen(open); onOpenChange?.(open); };
  const slot = (value: SidebarSlot) => typeof value === 'function' ? value(isOpen) : value;
  const navId = React.useId();
  const logoContent = slot(logo);
  const hasLogo = logoContent != null && logoContent !== false;
  const toggleProps = { type: 'button' as const, 'aria-label': isOpen ? 'Recolher menu' : 'Expandir menu', 'aria-expanded': isOpen, 'aria-controls': navId, onClick: () => setOpen(!isOpen) };
  const toggleClass = cn('ui-sidebar-toggle shrink-0 rounded-md p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', toneClasses[color].text, hover && toneClasses[color].hoverSoft);
  const parts: Record<SidebarPart, React.ReactNode> = {
    brand: (hasLogo || (isOpen && name != null)) ? <div className="flex min-w-0 items-center gap-2">
      {hasLogo && <button {...toggleProps} className={toggleClass}><span className="flex h-8 w-8 items-center justify-center overflow-hidden [&>img]:max-h-full [&>img]:max-w-full [&>svg]:h-full [&>svg]:w-full">{logoContent}</span></button>}
      {isOpen && name != null && <span className="truncate font-semibold">{name}</span>}
    </div> : null,
    header: slot(header),
    toggle: !hasLogo ? <button {...toggleProps} className={toggleClass}><span aria-hidden="true">{'\u2630'}</span></button> : null,
    search: slot(search),
    navigation: <nav id={navId} aria-label={label} className="min-h-0 w-full space-y-4 overflow-y-auto" aria-busy={loading || undefined}>
      {loading ? <span role="status">Carregando menu...</span> : Object.values(sections).map(section => <SidebarSection key={section.title} section={section} isOpen={isOpen} color={color} hover={hover} itemVariant={itemVariant} pathname={pathname} linkComponent={linkComponent} can={can} onLinkClick={() => { if (window.innerWidth < 768) setOpen(false); onLinkClick?.(); }} />)}
    </nav>,
    footer: slot(footer), notifications: slot(notifications),
  };
  const defaultOrder: SidebarPart[] = ['brand', 'header', 'toggle', 'search', 'navigation', 'footer', 'notifications'];
  const ordered = Array.from(new Set([...(order ?? []), ...defaultOrder]));
  const length = (value: string | number) => typeof value === 'number' ? value + 'px' : value;
  return <aside aria-label={label} style={{ '--sidebar-width': length(width), '--sidebar-collapsed-width': length(collapsedWidth) } as React.CSSProperties}
    className={cn('ui-sidebar flex shrink-0 flex-col gap-4 bg-card py-3 text-card-foreground', className)}
    data-open={isOpen} data-variant={variant} data-side={side} data-position={position} data-animation={animation} data-item-shape={itemShape} data-icon-position={iconPosition} data-align={align}
    onKeyDown={event => { if (event.key === 'Escape' && !event.defaultPrevented) setOpen(false); }}>
    {ordered.map(part => parts[part] != null && parts[part] !== false && <div key={part} data-sidebar-part={part} data-align={slotAlign?.[part] ?? align}
      className={cn('ui-sidebar-slot min-w-0 px-4', part === 'navigation' ? 'min-h-0 flex flex-1' : 'shrink-0', ['search', 'navigation', 'footer', 'notifications'].includes(part) && 'ui-sidebar-content', part === 'footer' && 'text-xs text-muted-foreground', slotClassNames?.[part])}>{parts[part]}</div>)}
  </aside>;
}
