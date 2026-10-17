import * as React from 'react';
import Link from 'next/link.js';
import { usePathname } from 'next/navigation.js';
import { cn } from '../utils.js';
import dynamic from 'next/dynamic.js';

const HouseIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.HouseIcon), { ssr: false });
const LineVerticalIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.LineVerticalIcon), { ssr: false });

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

/** Trilha de navegação com início e separador configuráveis. */
export interface BreadcrumbsProps {
  /** Páginas em ordem de navegação. */
  items?: BreadcrumbItem[];
  /** Elemento entre páginas. */
  separator?: React.ReactNode;
  /** Exibe o link inicial. */
  showHome?: boolean;
  /** Texto do link inicial. */
  homeLabel?: string;
  /** Destino do link inicial. */
  homeHref?: string;
  /** Classe da trilha. */
  className?: string;
  /** Classe dos links. */
  itemClassName?: string;
  /** Classe dos separadores. */
  separatorClassName?: string;
  /** Máximo de itens exibidos sem abreviação. */
  maxItems?: number;
}

const Breadcrumbs = React.forwardRef<HTMLElement, BreadcrumbsProps>(
  ({
    items = [],
    separator,
    showHome = true,
    homeLabel = 'Dashboard',
    homeHref = '/landlord',
    className,
    itemClassName,
    separatorClassName,
    maxItems = 1,
    ...props
  }, ref) => {
    const pathname = usePathname();

    // Detecta se está no contexto de tenant ou landlord
    const isTenant = pathname.startsWith('/admin');
    const defaultHomeHref = isTenant ? '/admin' : '/landlord';
    const finalHomeHref = homeHref === '/landlord' ? defaultHomeHref : homeHref;

    // Auto-generate breadcrumbs based on pathname if no items provided
    const generateBreadcrumbs = React.useMemo(() => {
      if (items.length > 0) return items;

      const segments = pathname.split('/').filter(Boolean);
      const breadcrumbs: BreadcrumbItem[] = [];

      // Route mapping for better labels
      const routeMap: Record<string, string> = {
        'admin': 'Dashboard',
        'establishments': 'Estabelecimentos',
        'users': 'Usuários',
        'analytics': 'Analytics',
        'billing': 'Financeiro',
        'notifications': 'Notificações',
        'settings': 'Configurações',
        'profile': 'Perfil',
        'security': 'Segurança',
        'new': 'Novo',
        'edit': 'Editar',
        'appointments': 'Agendamentos',
        'services': 'Serviços',
        'clients': 'Clientes',
        'staff': 'Equipe',
        'calendar': 'Calendário',
        'products': 'Produtos',
        'inventory': 'Estoque',
        'reports': 'Relatórios',
        'integrations': 'Integrações',
        'marketing': 'Marketing',
        'landlord': 'Landlord',
        'home': 'Home',
        'tenants': 'Tenants',
        'subscriptions': 'Assinaturas',
        'plans': 'Planos',
        'invoices': 'Faturas',
        'payments': 'Pagamentos',
        'create': 'Adicionar',
        'admins': 'Administradores',
        'employees': 'Profissionais',
        'service-categories': 'Categorias',
        'customers': 'Clientes',
        'expense-categories': 'Categorias de Despesas',
        'expenses': 'Despesas',
        'product-categories': 'Categorias de Produtos',
        'loyalty-plans': 'Planos de Fidelidade',
        'subscription-plans': 'Planos de Assinatura',
        'help': 'Ajuda',
        'transactions': 'Transações',
        'support': 'Suporte',
        'communication': 'Comunicação',
        'conversations': 'Vamos Conversar',
        'legal-documents': 'Termos e Condições',
      };

      let currentPath = '';
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        currentPath += `/${segment}`;

        // Skip the first 'landlord' segment if showHome is true
        if (i === 0 && segment === 'landlord' || segment === 'admin' && showHome) continue;

        const label = routeMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
        const isLast = i === segments.length - 1;
        
        breadcrumbs.push({
          label,
          href: isLast ? undefined : currentPath,
        });
      }

      return breadcrumbs;
    }, [items, pathname, showHome]);

    // Truncate items if maxItems is specified
    const finalItems = React.useMemo(() => {
      if (!maxItems || generateBreadcrumbs.length <= maxItems) {
        return generateBreadcrumbs;
      }

      const truncated = [...generateBreadcrumbs];
      const itemsToRemove = truncated.length - maxItems;
      
      // Remove items from the middle, keeping first and last
      if (itemsToRemove > 0) {
        truncated.splice(1, itemsToRemove, {
          label: '...',
          href: undefined,
        });
      }

      return truncated;
    }, [generateBreadcrumbs, maxItems]);

    const defaultSeparator = separator || (
      <LineVerticalIcon className={cn('h-4 w-4 text-muted-foreground', separatorClassName)} />
    );

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn('flex items-center space-x-1', className)}
        {...props}
      >
        {/* Home breadcrumb */}
        {showHome && (
          <>
            <Link
              href={finalHomeHref}
              className={cn(
                'flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors',
                itemClassName
              )}
            >
              <HouseIcon size={20} />
              <span className='hidden md:inline'>{homeLabel}</span>
            </Link>
            {finalItems.length > 0 && (
              <span className="hidden md:flex items-center">{defaultSeparator}</span>
            )}
          </>
        )}

        {/* Breadcrumb items */}
        {finalItems.map((item, index) => {
          const isLast = index === finalItems.length - 1;
          const isEllipsis = item.label === '...';

          return (
            <React.Fragment key={`${item.label}-${index}`}>
              {item.href && !isEllipsis ? (
                <Link
                  href={item.href}
                  className={cn(
                    'hidden md:flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors',
                    itemClassName
                  )}
                >
                  {item.icon && <span className="flex items-center">{item.icon}</span>}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className={cn(
                    'hidden md:flex items-center text-sm font-medium',
                    isLast ? 'text-foreground' : 'text-muted-foreground',
                    isEllipsis && 'cursor-default',
                    itemClassName
                  )}
                  {...(isLast && { 'aria-current': 'page' })}
                >
                  {item.icon && <span className="flex items-center">{item.icon}</span>}
                  <span>{item.label}</span>
                </span>
              )}

              {/* Separator */}
              {!isLast && (
                <span className="hidden md:flex items-center">{defaultSeparator}</span>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    );
  }
);

Breadcrumbs.displayName = 'Breadcrumbs';

export const BreadcrumbsBuilder = {
  create: (items: BreadcrumbItem[]) => items,
  item: (label: string, href?: string, icon?: React.ReactNode): BreadcrumbItem => ({
    label,
    href,
    icon,
  }),
};

export { Breadcrumbs };


