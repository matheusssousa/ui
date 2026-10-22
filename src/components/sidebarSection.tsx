'use client';
import * as React from 'react';
import { type UIColor } from './theme.js';
import { SidebarNavItem, type SidebarItem } from './sidebarNavItem.js';

export interface SidebarSectionConfig { title: string; items: SidebarItem[]; }
export interface SidebarSectionProps {
  section: SidebarSectionConfig;
  isOpen: boolean;
  color?: UIColor;
  hover?: boolean;
  onLinkClick?: () => void;
  openSubMenus?: string[];
  toggleSubMenu?: (label: string) => void;
  pathname?: string;
  linkComponent?: React.ElementType;
  /** Optional permission checker; omitted for systems without permissions. */
  can?: (permission: string) => boolean;
}
export function SidebarSection({ section, isOpen, onLinkClick, openSubMenus, toggleSubMenu, pathname, linkComponent, can, color = 'secondary', hover = true }: SidebarSectionProps) {
  const [localOpen, setLocalOpen] = React.useState<string[]>([]);
  const opened = openSubMenus ?? localOpen;
  const toggle = toggleSubMenu ?? ((label: string) => setLocalOpen(previous => previous.includes(label) ? previous.filter(value => value !== label) : [...previous, label]));
  const filter = (items: SidebarItem[]): SidebarItem[] => items.filter(item => !item.permission || !can || can(item.permission)).flatMap(item => {
    const subItems = item.subItems ? filter(item.subItems) : undefined;
    return !item.href && item.subItems && !subItems?.length ? [] : [{ ...item, subItems }];
  });
  const items = filter(section.items);
  const renderItems = (entries: SidebarItem[]): React.ReactNode => entries.map(item => <div key={item.href ?? item.label} className="space-y-1">
    <SidebarNavItem item={item} isOpen={isOpen} color={color} hover={hover} onClick={onLinkClick} isSubMenuOpen={opened.includes(item.label)} toggleSubMenu={() => toggle(item.label)} pathname={pathname} linkComponent={linkComponent} />
    {isOpen && opened.includes(item.label) && Boolean(item.subItems?.length) && <div className="space-y-1 pl-4">{renderItems(item.subItems!)}</div>}
  </div>);
  if (!items.length) return null;
  return <div className="space-y-1">{isOpen && <h3 className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{section.title}</h3>}{renderItems(items)}</div>;
}
