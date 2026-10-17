'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils.js';
import { CaretDownIcon, CheckIcon, CircleNotchIcon, XIcon } from '@phosphor-icons/react/dist/ssr';
import { toneScopeStyle, type UIColor } from './theme.js';

// --- Variantes de Estilo (CVA) ---

const selectVariants = cva(
    // A altura mínima já está correta para permitir o crescimento vertical
    'flex w-full min-h-10 rounded-md border border-border/60 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-primary/20 cursor-pointer transition-colors',
    {
        variants: {
            variant: {
                default: '',
                outline: 'border border-border/60',
                filled: 'bg-muted border-muted text-foreground',
                visible: 'border-none p-0 bg-transparent',
                times: 'border-none p-0 bg-transparent',
            },
            size: {
                sm: 'min-h-9 px-3 rounded-md',
                md: 'min-h-10 py-2 px-4',
                lg: 'min-h-11 px-8 rounded-md',
            },
            validation: {
                default: '',
                error: 'border-destructive focus-visible:ring-destructive',
                success: 'border-success focus-visible:ring-success',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
        },
    }
);

const selectContentVariants = cva(
    'absolute z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-border/60 bg-background p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95',
    {
        variants: {
            position: {
                top: 'bottom-full mb-1',
                bottom: 'top-full mt-1',
            },
        },
        defaultVariants: {
            position: 'bottom',
        },
    }
);


// --- Tipos e Interfaces ---

export interface SelectOption {
    /** Valor enviado em `onValueChange`. */
    value: string | number;
    /** Texto principal da opção. */
    label: string;
    /** Impede selecionar esta opção. */
    disabled?: boolean;
    /** Texto auxiliar mostrado sob o rótulo. */
    description?: string;
}

/** Seletor simples ou múltiplo com busca, validação e variantes visuais. */
export interface SelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect' | 'defaultValue'>, VariantProps<typeof selectVariants> {
    /** Opções disponíveis. */
    options: SelectOption[];
    /** Valor controlado, ou lista de valores em modo múltiplo. */
    value?: string | number | boolean | Array<string | number>;
    /** Valor inicial quando o componente não é controlado. */
    defaultValue?: string | number | Array<string | number>;
    /** Recebe a seleção atualizada. */
    onValueChange?: (value: string | number | Array<string | number> | undefined) => void;
    /** Texto mostrado sem seleção. */
    placeholder?: string;
    /** Rótulo do seletor. */
    label?: string;
    /** Impede interação. */
    disabled?: boolean;
    /** Marca o campo como obrigatório. */
    required?: boolean;
    /** Mostra carregamento. */
    isLoading?: boolean;
    /** Habilita busca entre opções. */
    searchable?: boolean;
    /** Permite limpar a seleção. */
    clearable?: boolean;
    /** Permite selecionar vários valores. */
    multiple?: boolean;
    /** Exibe a ação de selecionar todos em modo múltiplo. */
    showSelectAll?: boolean;
    /** Texto da ação de selecionar todos. */
    selectAllLabel?: string;
    /** Estado visual da validação. */
    validation?: 'default' | 'error' | 'success';
    /** Ícone no início do seletor. */
    leftIcon?: React.ReactNode;
    /** Texto mostrado quando a busca não encontra opções. */
    emptyMessage?: string;
    /** Nome usado na submissão de formulário. */
    name?: string;
    /** Mensagem de erro abaixo do campo. */
    error?: string;
    /** Cor do foco e das opções selecionadas; padrão `primary`. */
    color?: UIColor;
    /** Ajusta a apresentação dentro de um card. */
    isInCard?: boolean;
}

// --- Componente Principal ---

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({
        options = [],
        value,
        defaultValue,
        onValueChange,
        placeholder = 'Selecione uma opção...',
        label,
        disabled = false,
        required = false,
        isLoading = false,
        searchable = false,
        clearable = false,
        multiple = false,
        showSelectAll = true,
        selectAllLabel = 'Selecionar todos',
        className,
        variant,
        size,
        validation = 'default',
        leftIcon,
        name,
        error,
        color = 'primary',
        emptyMessage = 'Nenhuma opção encontrada',
        isInCard = false,
        ...props
    }, ref) => {
        const [isOpen, setIsOpen] = React.useState(false);
        const [searchQuery, setSearchQuery] = React.useState('');

        const [selectedValues, setSelectedValues] = React.useState<(string | number)[]>(() => {
            const initial = defaultValue;
            if (initial === undefined) return [];
            if (multiple) {
                return Array.isArray(initial) ? initial : [initial];
            }
            return [initial as string | number];
        });

        const [isFocused, setIsFocused] = React.useState(false);
        const [highlightedIndex, setHighlightedIndex] = React.useState<number>(-1);

        const [typeaheadBuffer, setTypeaheadBuffer] = React.useState('');
        const typeaheadTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

        const selectContainerRef = React.useRef<HTMLDivElement>(null);
        const searchInputRef = React.useRef<HTMLInputElement>(null);
        const optionRefs = React.useRef<(HTMLDivElement | null)[]>([]);

        React.useEffect(() => {
            if (value === undefined) return;
            if (multiple) {
                setSelectedValues(Array.isArray(value) ? value : []);
            } else {
                setSelectedValues(value !== undefined && value !== null ? [value as string | number] : []);
            }
        }, [value, multiple]);

        React.useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (selectContainerRef.current && !selectContainerRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);


        React.useEffect(() => {
            if (isOpen && searchable) {
                setTimeout(() => searchInputRef.current?.focus(), 50);
            }
        }, [isOpen, searchable]);

        React.useEffect(() => {
            if (isOpen && highlightedIndex > -1 && optionRefs.current[highlightedIndex]) {
                optionRefs.current[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
            }
        }, [highlightedIndex, isOpen]);

        const handleTypeahead = (key: string) => {
            if (typeaheadTimerRef.current) clearTimeout(typeaheadTimerRef.current);
            typeaheadTimerRef.current = setTimeout(() => setTypeaheadBuffer(''), 700);

            const newBuffer = (typeaheadBuffer + key).toLowerCase();
            setTypeaheadBuffer(newBuffer);

            const matchIndex = filteredOptions.findIndex(
                opt => !opt.disabled && opt.label.toLowerCase().startsWith(newBuffer)
            );
            if (matchIndex !== -1) {
                setHighlightedIndex(matchIndex);
                optionRefs.current[matchIndex]?.scrollIntoView({ block: 'nearest' });
            }
        };

        const moveHighlight = (direction: number) => {
            if (filteredOptions.length === 0) return;
            let newIndex = highlightedIndex;
            do {
                newIndex = (newIndex + direction + filteredOptions.length) % filteredOptions.length;
            } while (filteredOptions[newIndex]?.disabled);
            setHighlightedIndex(newIndex);
        };

        // selectHighlighted was removed because it's unused; keyboard selection calls handleOptionSelect directly.

        const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
            if (disabled || isLoading) return;

            if (!isOpen && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
                event.preventDefault();
                setIsOpen(true);
                if (event.key === 'ArrowDown' && filteredOptions.length > 0) {
                    setHighlightedIndex(0);
                }
                return;
            }

            if (!isOpen && event.key.length === 1 && !event.metaKey && !event.ctrlKey) {
                setIsOpen(true);
                handleTypeahead(event.key);
                return;
            }

            if (!isOpen) return;

            switch (event.key) {
                case 'Escape':
                    setIsOpen(false);
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    moveHighlight(1);
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    moveHighlight(-1);
                    break;
                case 'Enter':
                case ' ':
                    event.preventDefault();
                    if (highlightedIndex !== -1) {
                        const option = filteredOptions[highlightedIndex];
                        if (option && !option.disabled) handleOptionSelect(option);
                    }
                    break;
                default:
                    if (!searchable && event.key.length === 1 && !event.metaKey && !event.ctrlKey) {
                        event.preventDefault();
                        handleTypeahead(event.key);
                    }
            }
        };

        const filteredOptions = React.useMemo(() => {
            if (!searchable || !searchQuery) return options;
            return options.filter(option =>
                option.label.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }, [options, searchQuery, searchable]);

        const enabledOptionValues = React.useMemo(
            () => options.filter(option => !option.disabled).map(option => option.value),
            [options]
        );

        const areAllOptionsSelected = enabledOptionValues.length > 0
            && enabledOptionValues.every(optionValue => selectedValues.includes(optionValue));
        const areSomeOptionsSelected = !areAllOptionsSelected
            && enabledOptionValues.some(optionValue => selectedValues.includes(optionValue));

        const handleSelectAll = () => {
            if (!multiple || enabledOptionValues.length === 0) return;

            const newValues = areAllOptionsSelected
                ? selectedValues.filter(selectedValue => !enabledOptionValues.includes(selectedValue))
                : [
                    ...selectedValues,
                    ...enabledOptionValues.filter(optionValue => !selectedValues.includes(optionValue)),
                ];

            if (value === undefined) {
                setSelectedValues(newValues);
            }
            onValueChange?.(newValues);
        };

        const handleOptionSelect = (option: SelectOption) => {
            if (option.disabled) return;

            let newValues: (string | number)[];

            if (multiple) {
                newValues = selectedValues.includes(option.value)
                    ? selectedValues.filter(v => v !== option.value)
                    : [...selectedValues, option.value];
            } else {
                newValues = [option.value];
                setIsOpen(false);
                setSearchQuery('');
            }

            if (value === undefined) {
                setSelectedValues(newValues);
            }
            onValueChange?.(multiple ? newValues : newValues[0]);
        };

        const handleClear = (event: React.MouseEvent) => {
            event.stopPropagation();
            const newValues: (string | number)[] = [];
            if (value === undefined) {
                setSelectedValues(newValues);
            }
            onValueChange?.(multiple ? newValues : undefined);
        };

        const getDisplayValue = () => {
            if (selectedValues.length === 0) {
                return placeholder;
            }
            return options.find(opt => opt.value === selectedValues[0])?.label ?? placeholder;
        };

        const shouldFloatLabel = isFocused || selectedValues.length > 0 || searchQuery.length > 0 || (placeholder && isOpen);

        if (variant === 'times') {
            return (
                <div className="relative w-full" ref={selectContainerRef} style={toneScopeStyle(color)}>
                    {multiple ? (
                        <select
                            ref={ref}
                            name={name}
                            multiple
                            value={selectedValues.map(String)}
                            className="absolute w-0 h-0 opacity-0 -z-10"
                            tabIndex={-1}
                            aria-hidden="true"
                            onChange={() => { }}
                            disabled={disabled}
                            required={required}
                        >
                            {selectedValues.map(val => (
                                <option key={val} value={val.toString()} />
                            ))}
                        </select>
                    ) : (
                        <select
                            ref={ref}
                            name={name}
                            value={selectedValues[0]?.toString() ?? ''}
                            className="absolute w-0 h-0 opacity-0 -z-10"
                            tabIndex={-1}
                            aria-hidden="true"
                            onChange={() => { }}
                            disabled={disabled}
                            required={required}
                        >
                            <option value={selectedValues[0]?.toString() ?? ''} />
                        </select>
                    )}
                    {label && (
                        <label className="block text-sm font-medium mb-3 text-foreground">
                            {label}
                            {required && <span className="text-destructive ml-1">*</span>}
                        </label>
                    )}
                    <div className={cn(
                        "flex flex-wrap gap-3 items-center justify-center",
                        size === 'sm' && 'gap-2',
                        size === 'lg' && 'gap-4'
                    )}>
                        {options.map((option) => {
                            const isSelected = selectedValues.includes(option.value);
                            const isDisabled = disabled || option.disabled;

                            return (
                                <div
                                    key={option.value}
                                    className={cn(
                                        "relative rounded-lg border p-4 transition-all duration-200 cursor-pointer w-20 text-center bg-background",
                                        "hover:shadow-md",
                                        size === 'sm' && 'p-3',
                                        size === 'lg' && 'p-5',
                                        isSelected
                                            ? "border-primary bg-primary/30 shadow-sm"
                                            : "border-border hover:border-primary/50",
                                        isDisabled && "opacity-50 cursor-not-allowed hover:shadow-none pointer-events-none",
                                        className
                                    )}
                                    onClick={() => !isDisabled && handleOptionSelect(option)}
                                    role="option"
                                    aria-selected={isSelected}
                                    aria-disabled={isDisabled}
                                >
                                    <div className={cn(
                                        "font-medium text-sm",
                                        size === 'lg' && 'text-lg',
                                    )}>
                                        {option.label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {error && (
                        <p className="mt-2 text-sm text-destructive animate-in fade-in slide-in-from-top-1">
                            {error}
                        </p>
                    )}
                </div>
            );
        }


        // Render visible variant (all options always displayed with checkboxes)
        if (variant === 'visible') {
            return (
                <div className="relative w-full space-y-2" ref={selectContainerRef} style={toneScopeStyle(color)}>
                    {multiple ? (
                        <select
                            ref={ref}
                            name={name}
                            multiple
                            value={selectedValues.map(String)}
                            className="absolute w-0 h-0 opacity-0 -z-10"
                            tabIndex={-1}
                            aria-hidden="true"
                            onChange={() => { }}
                            disabled={disabled}
                            required={required}
                        >
                            {selectedValues.map(val => (
                                <option key={val} value={val.toString()} />
                            ))}
                        </select>
                    ) : (
                        <select
                            ref={ref}
                            name={name}
                            value={selectedValues[0]?.toString() ?? ''}
                            className="absolute w-0 h-0 opacity-0 -z-10"
                            tabIndex={-1}
                            aria-hidden="true"
                            onChange={() => { }}
                            disabled={disabled}
                            required={required}
                        >
                            <option value={selectedValues[0]?.toString() ?? ''} />
                        </select>
                    )}

                    {label && (
                        <label className="block text-sm font-medium mb-3 text-foreground">
                            {label}
                            {required && <span className="text-destructive ml-1">*</span>}
                        </label>
                    )}

                    <div className={cn(
                        "grid gap-3",
                        size === 'sm' && 'gap-2',
                        size === 'lg' && 'gap-4'
                    )}>
                        {multiple && showSelectAll && enabledOptionValues.length > 0 && (
                            <button
                                type="button"
                                className={cn(
                                    "relative flex items-center rounded-lg border border-border p-4 text-left transition-all duration-200 cursor-pointer hover:border-primary/50 hover:shadow-md",
                                    size === 'sm' && 'p-3',
                                    size === 'lg' && 'p-5',
                                    areAllOptionsSelected && "border-primary bg-primary/10 shadow-sm",
                                    disabled && "opacity-50 cursor-not-allowed pointer-events-none",
                                    className
                                )}
                                onClick={handleSelectAll}
                                disabled={disabled}
                                aria-pressed={areAllOptionsSelected}
                            >
                                <span className="font-medium text-sm">{selectAllLabel}</span>
                                <span className={cn(
                                    "absolute top-4 right-4 flex h-5 w-5 items-center justify-center rounded border transition-colors",
                                    areAllOptionsSelected || areSomeOptionsSelected
                                        ? "border-primary bg-primary"
                                        : "border-border"
                                )}>
                                    {areAllOptionsSelected && <CheckIcon className="h-3 w-3 text-primary-foreground" weight="bold" />}
                                    {areSomeOptionsSelected && <span className="h-0.5 w-2.5 rounded bg-primary-foreground" />}
                                </span>
                            </button>
                        )}
                        {options.map((option) => {
                            const isSelected = selectedValues.includes(option.value);
                            const isDisabled = disabled || option.disabled;

                            return (
                                <div
                                    key={option.value}
                                    className={cn(
                                        "relative rounded-lg border border-border p-4 transition-all duration-200 cursor-pointer",
                                        "hover:shadow-md",
                                        size === 'sm' && 'p-3',
                                        size === 'lg' && 'p-5',
                                        isSelected
                                            ? "border-primary bg-primary/10 shadow-sm"
                                            : "border-border hover:border-primary/50",
                                        isDisabled && "opacity-50 cursor-not-allowed hover:shadow-none pointer-events-none",
                                        className
                                    )}
                                    onClick={() => !isDisabled && handleOptionSelect(option)}
                                    role="option"
                                    aria-selected={isSelected}
                                    aria-disabled={isDisabled}
                                >
                                    {/* Checkbox/Radio indicator */}
                                    <div className="absolute top-4 right-4">
                                        {multiple ? (
                                            <div className={cn(
                                                "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                                isSelected
                                                    ? "border-primary bg-primary"
                                                    : "border-border"
                                            )}>
                                                {isSelected && (
                                                    <CheckIcon className="w-3 h-3 text-primary-foreground" weight="bold" />
                                                )}
                                            </div>
                                        ) : (
                                            <div className={cn(
                                                "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                                                isSelected
                                                    ? "border-primary"
                                                    : "border-border"
                                            )}>
                                                {isSelected && (
                                                    <div className="w-3 h-3 rounded-full bg-primary" />
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pr-8">
                                        <div className={cn(
                                            "font-medium text-sm",
                                            size === 'lg' && 'text-lg'
                                        )}>
                                            {option.label}
                                        </div>
                                        {option.description && (
                                            <div className={cn(
                                                "text-muted-foreground text-xs",
                                                size === 'lg' && 'text-base'
                                            )}>
                                                {option.description}
                                            </div>
                                        )}
                                    </div>

                                    {/* Selected indicator overlay */}
                                    {isSelected && (
                                        <div className="absolute inset-0 rounded-lg bg-primary/5 pointer-events-none" />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {error && (
                        <p className="mt-2 text-sm text-destructive animate-in fade-in slide-in-from-top-1">
                            {error}
                        </p>
                    )}
                </div>
            );
        }

        return (
            <div className="relative w-full" style={toneScopeStyle(color)}>
                <div
                    className="relative"
                    ref={selectContainerRef}
                    onKeyDown={handleKeyDown}
                    tabIndex={disabled ? -1 : 0} // 1. Torna o componente focável
                    onFocus={() => setIsFocused(true)} // 2. Gerencia o estado de foco
                    onBlur={() => setIsFocused(false)} // 2. Gerencia o estado de foco
                >
                {multiple ? (
                    <select
                        ref={ref}
                        name={name}
                        multiple
                        value={selectedValues.map(String)}
                        className="absolute w-0 h-0 opacity-0 -z-10"
                        tabIndex={-1}
                        aria-hidden="true"
                        onChange={() => { }}
                        disabled={disabled}
                        required={required}
                    >
                        {selectedValues.map(val => (
                            <option key={val} value={val.toString()} />
                        ))}
                    </select>
                ) : (
                    <select
                        ref={ref}
                        name={name}
                        value={selectedValues[0]?.toString() ?? ''}
                        className="absolute w-0 h-0 opacity-0 -z-10"
                        tabIndex={-1}
                        aria-hidden="true"
                        onChange={() => { }}
                        disabled={disabled}
                        required={required}
                    >
                        <option value={selectedValues[0]?.toString() ?? ''} />
                    </select>
                )}


                {label && (
                    <label
                        className={cn(
                            'absolute left-3 text-sm text-muted-foreground transition-all duration-200 ease-in-out pointer-events-none z-10',
                            leftIcon && 'left-10',
                            disabled && 'opacity-60',
                            shouldFloatLabel
                                ? `-top-2 ${isInCard ? 'bg-card' : disabled ? 'bg-muted/50' : 'bg-background'} px-1 text-xs`
                                : 'top-1/2 -translate-y-1/2'
                        )}
                    >
                        {label}
                    </label>
                )}

                <div
                    className={cn(
                        selectVariants({ variant, size, validation }),
                        leftIcon && 'pl-10',
                        isInCard && 'bg-card!',
                        disabled && 'cursor-not-allowed opacity-60 bg-muted/50 border-dashed pointer-events-none',
                        isLoading && 'cursor-wait opacity-75',
                        className
                    )}
                    onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    tabIndex={disabled ? -1 : 0}
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-disabled={disabled}
                    {...props}
                >
                    {leftIcon && <span className={cn("absolute left-3 top-3 z-0", disabled && "opacity-50")}>{leftIcon}</span>}

                    {/* ÁREA DE EXIBIÇÃO CORRIGIDA */}
                    <div className="flex flex-wrap items-center gap-1.5 flex-1">
                        {multiple && selectedValues.length > 0 ? (
                            selectedValues.map(value => {
                                const option = options.find(opt => opt.value === value);
                                if (!option) return null;
                                return (
                                    <span key={option.value} className={cn(
                                        "flex items-center gap-1.5 bg-primary/10 text-primary-text rounded-md px-2 py-0.5 text-xs font-medium",
                                        disabled && "opacity-60"
                                    )}>
                                        {option.label}
                                        {!disabled && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOptionSelect(option);
                                                }}
                                                className="text-tertiary hover:text-foreground transition-colors cursor-pointer"
                                                aria-label={`Remover ${option.label}`}
                                            >
                                                <XIcon size={15} />
                                            </button>
                                        )}
                                    </span>
                                );
                            })
                        ) : (
                            <span className={cn(
                                'block truncate',
                                selectedValues.length === 0 && 'text-muted-foreground/60',
                                disabled && 'text-muted-foreground/60',
                                label && !shouldFloatLabel && 'opacity-0',
                                label && shouldFloatLabel && 'opacity-100 transition-opacity duration-300 delay-150'
                            )}>
                                {getDisplayValue()}
                            </span>
                        )}
                    </div>

                    <div className={cn(
                        "absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2",
                        disabled && "opacity-50"
                    )}>
                        {clearable && selectedValues.length > 0 && !disabled && !isLoading && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="flex items-center justify-center w-4 h-4 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            >
                                <span className="text-xs font-bold">×</span>
                            </button>
                        )}
                        {isLoading ? (
                            <CircleNotchIcon className="w-4 h-4 animate-spin text-muted-foreground" />
                        ) : (
                            <CaretDownIcon className={cn(
                                'w-4 h-4 text-muted-foreground transition-transform duration-200',
                                isOpen && 'rotate-180',
                                disabled && 'opacity-50'
                            )} />
                        )}
                    </div>
                </div>

                {isOpen && (
                    <div className={cn(selectContentVariants({ position: 'bottom' }), 'w-full')}>
                        {searchable && (
                            <div className="p-1 border-b border-border/60">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Buscar..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-2 py-1 text-sm bg-transparent border-0 rounded-md outline-none placeholder:text-muted-foreground"
                                />
                            </div>
                        )}
                        <div className="max-h-60 overflow-auto p-1">
                            {multiple && showSelectAll && enabledOptionValues.length > 0 && (
                                <button
                                    type="button"
                                    className="relative flex w-full cursor-pointer items-center rounded-sm border-b border-border/60 px-2 py-2 text-left text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        handleSelectAll();
                                    }}
                                    onKeyDown={event => event.stopPropagation()}
                                    aria-pressed={areAllOptionsSelected}
                                >
                                    <span className="flex-1 truncate">{selectAllLabel}</span>
                                    <span className={cn(
                                        "ml-2 flex h-4 w-4 items-center justify-center rounded border",
                                        areAllOptionsSelected || areSomeOptionsSelected
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-border"
                                    )}>
                                        {areAllOptionsSelected && <CheckIcon className="h-3 w-3" weight="bold" />}
                                        {areSomeOptionsSelected && <span className="h-0.5 w-2 rounded bg-primary-foreground" />}
                                    </span>
                                </button>
                            )}
                            {filteredOptions.length === 0 ? (
                                <div className="py-2 text-center text-sm text-muted-foreground">{emptyMessage}</div>
                            ) : (
                                filteredOptions.map((option, index) => (
                                    <div
                                        key={option.value}
                                        ref={el => { optionRefs.current[index] = el; }}
                                        className={cn(
                                            'relative flex items-center rounded-sm px-2 py-1.5 text-sm select-none transition-colors capitalize',
                                            option.disabled
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'cursor-pointer hover:bg-accent hover:text-accent-foreground',
                                            highlightedIndex === index && 'bg-accent/50', // <-- destaque visível
                                            selectedValues.includes(option.value) && 'font-medium'
                                        )}
                                        onClick={() => handleOptionSelect(option)}
                                    >
                                        <div className="flex-1 truncate">
                                            <div className="font-medium">{option.label}</div>
                                            {option.description && <div className="text-xs text-muted-foreground truncate">{option.description}</div>}
                                        </div>
                                        {selectedValues.includes(option.value) && <CheckIcon className="w-4 h-4 ml-2" />}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
                </div>
                {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';

export { Select, selectVariants };


