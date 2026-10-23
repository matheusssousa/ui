'use client';
import * as React from 'react';
import { toneClasses, type UIColor } from './theme.js';
import { cn } from '../utils.js';

export interface SidebarItem {
  icon?: React.ElementType;
  label: string;
  href?: string;
  permission?: string;
  subItems?: SidebarItem[];
  exact?: boolean;
  dataTour?: string;
}
export interface SidebarNavItemProps {
  item: SidebarItem;
  isOpen: boolean;
  color?: UIColor;
  hover?: boolean;
  itemVariant?: 'solid' | 'soft' | 'outline' | 'minimal';
  onClick?: () => void;
  isSubMenuOpen?: boolean;
  toggleSubMenu?: () => void;
  dataTour?: string;
  pathname?: string;
  /** Pass Next.js Link or another router's anchor-compatible component. */
  linkComponent?: React.ElementType;
}
export function SidebarNavItem({ item, isOpen, onClick, isSubMenuOpen, toggleSubMenu, dataTour, pathname, linkComponent: Link = 'a', color = 'secondary', hover = true, itemVariant = 'solid' }: SidebarNavItemProps) {
  const [currentPath, setCurrentPath] = React.useState('');
  React.useEffect(() => {
    const update = () => setCurrentPath(window.location.pathname);
    update(); window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, []);
  const normalize = (path: string) => path.replace(/\/+$/, '') || '/';
  const path = normalize(pathname ?? currentPath);
  const href = item.href ? normalize(item.href) : undefined;
  const exact = item.exact ?? (href === '/' || ['/admin', '/tenant', '/landlord'].includes(href ?? ''));
  const active = Boolean(href && (path === href || (!exact && path.startsWith(href + '/'))));
  const Icon = item.icon;
  const children = <>{Icon && <Icon className="ui-sidebar-icon h-5 w-5 shrink-0" aria-hidden="true" />}{(isOpen || !Icon) && <span className="truncate font-medium">{item.label}</span>}</>;
  const tone = toneClasses[color];
  const activeClass = itemVariant === 'soft' ? tone.soft : itemVariant === 'outline' ? cn('border', tone.outline) : itemVariant === 'minimal' ? cn('font-semibold', tone.text) : tone.solid;
  const classes = cn('ui-sidebar-link flex min-w-0 flex-1 items-center gap-3 rounded-md p-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', !isOpen && 'justify-center', active ? activeClass : cn('text-muted-foreground', hover && tone.hoverSoft), active && hover && 'hover:brightness-95');
  return <div className="flex items-center gap-1" data-tour={dataTour ?? item.dataTour}>
    {item.href ? <Link href={item.href} onClick={onClick} aria-label={item.label} aria-current={active ? 'page' : undefined} title={!isOpen ? item.label : undefined} className={classes}>{children}</Link>
      : <button type="button" className={classes} aria-label={item.label} title={!isOpen ? item.label : undefined} aria-expanded={item.subItems?.length ? Boolean(isSubMenuOpen) : undefined} onClick={toggleSubMenu ?? onClick}>{children}</button>}
    {isOpen && Boolean(item.subItems?.length) && item.href && <button type="button" className={cn('rounded-md p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', tone.text, hover && tone.hoverSoft)} aria-label={`Alternar ${item.label}`} aria-expanded={Boolean(isSubMenuOpen)} onClick={toggleSubMenu}><span aria-hidden="true">{isSubMenuOpen ? '▴' : '▾'}</span></button>}
  </div>;
}
