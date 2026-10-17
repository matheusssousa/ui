import type { SearchProps, Filter } from './data-types.js';
'use client';

import * as React from 'react';
import { cn } from '../utils.js';
import { Input } from './input.js';
import { Select, SelectOption } from './select.js';
import { Button } from './button.js';
import { CalendarIcon, FunnelIcon, MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react/dist/ssr';
import { toneScopeStyle } from './theme.js';

const Search = React.forwardRef<HTMLInputElement, SearchProps>(
  ({
    value = '',
    placeholder = 'Pesquisar...',
    onSearch,
    onClear,
    className,
    disabled = false,
    filters = [],
    filterValues = {},
    onFilterChange,
    showFilters = false,
    showClearAll = false,
    debounceMs = 300,
    globalSearch = false,
    color = 'primary',
    ...props
  }, ref) => {

    const [searchQuery, setSearchQuery] = React.useState(value);
    const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);
    const [localFilters, setLocalFilters] = React.useState(filterValues);

    React.useEffect(() => {
      setSearchQuery(value);
    }, [value]);

    React.useEffect(() => {
      setLocalFilters(filterValues);
    }, [filterValues]);

    const handleSearchChange = (newQuery: string) => {
      setSearchQuery(newQuery);
      onSearch?.(newQuery);
    };

    const handleClear = () => {
      setSearchQuery('');
      onSearch?.('');
      onClear?.();
    };

    const handleFilterChange = (filterKey: string, filterValue: any) => {
      const newFilters = {
        ...localFilters,
        [filterKey]: filterValue
      };

      setLocalFilters(newFilters);
      onFilterChange?.(newFilters);
    };

    const handleClearAllFilters = () => {
      const clearedFilters = Object.keys(localFilters).reduce((acc, key) => {
        acc[key] = undefined;
        return acc;
      }, {} as Record<string, any>);

      setLocalFilters(clearedFilters);
      onFilterChange?.(clearedFilters);
    };

    const hasActiveFilters = Object.values(localFilters).some(value =>
      value !== undefined && value !== '' && value !== null
    );

    const renderFilterInput = (filter: Filter) => {
      const filterValue = localFilters[filter.key];

      switch (filter.type) {
        case 'select':
          const selectOptions: SelectOption[] = filter.options?.map(option => ({
            value: option.value.toString(),
            label: option.count
              ? `${option.label} (${option.count})`
              : option.label
          })) || [];

          return (
            <Select
              value={filterValue?.toString() || ''}
              onValueChange={(value) => handleFilterChange(filter.key, value || undefined)}
              placeholder={filter.placeholder || `Selecione ${filter.label}`}
              options={selectOptions}
              size="sm"
            />
          );

        case 'date':
          return (
            <div className="relative">
              <Input
                type="date"
                value={filterValue || ''}
                onChange={(e) => handleFilterChange(filter.key, e.target.value || undefined)}
                leftIcon={<CalendarIcon className="h-4 w-4" />}
                size="sm"
              />
            </div>
          );

        case 'number':
          return (
            <Input
              type="number"
              value={filterValue || ''}
              onChange={(e) => handleFilterChange(filter.key, e.target.value ? Number(e.target.value) : undefined)}
              placeholder={filter.placeholder}
              size="sm"
            />
          );

        case 'money':
          return (
            <Input
              type="number"
              value={filterValue || ''}
              onChange={(e) => handleFilterChange(filter.key, e.target.value ? Number(e.target.value) : undefined)}
              placeholder={filter.placeholder}
              leftIcon="R$"
              size="sm"
            />
          );
          
        default:
          return (
            <Input
              type="text"
              value={filterValue || ''}
              onChange={(e) => handleFilterChange(filter.key, e.target.value || undefined)}
              placeholder={filter.placeholder}
              size="sm"
            />
          );
      }
    };

    return (
      <div className="w-full space-y-1" style={toneScopeStyle(color)}>
        {/* Barra de Pesquisa Principal */}
        <div className="relative">
          <Input
            ref={ref}
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
            rightIcon={
              <div className="flex items-center gap-1">
                {/* Botão de Filtros */}
                {filters.length > 0 && (
                  <Button
                    variant="outlined"
                    size="xs"
                    onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                    className={cn(
                      'p-2 rounded hover:bg-accent dark:hover:bg-foreground/30 transition-colors relative',
                      isFiltersOpen && 'bg-accent dark:bg-foreground/20',
                      hasActiveFilters && 'text-primary-text'
                    )}
                  >
                    <FunnelIcon className="h-4 w-4" />
                  </Button>
                )}

                {/* Botão de Limpar */}
                {(searchQuery || hasActiveFilters) && (
                  <Button
                    variant="outlined"
                    size="xs"
                    onClick={handleClear}
                    className="p-2 rounded hover:bg-accent dark:hover:bg-foreground/30 transition-colors"
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            }
            className={className ? cn('w-full', className) : 'w-full rounded-xl bg-card border-none'}
            {...props}
          />
        </div>

        {/* Painel de Filtros */}
        {isFiltersOpen && filters.length > 0 && (
          <div className="rounded-xl p-4 bg-card space-y-4">
            <div className="flex items-center justify-between w-full">
              <h3 className="text-sm font-medium">Filtros</h3>
              {showClearAll && hasActiveFilters && (
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={handleClearAllFilters}
                  className="text-xs text-muted-foreground hover:text-foreground w-fit py-0 px-2"
                >
                  Limpar
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filters.map((filter) => (
                <div key={filter.key} className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    {filter.label}
                  </label>
                  {renderFilterInput(filter)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

Search.displayName = 'Search';

export { Search };



