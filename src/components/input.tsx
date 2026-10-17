'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils.js';
import dynamic from 'next/dynamic.js';
import { Skeleton } from './skeleton.js';
import { useIMask } from 'react-imask';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';

const CircleNotchIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.CircleNotchIcon), { ssr: false });
const CaretLeftIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.CaretLeftIcon), { ssr: false });
const CaretRightIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.CaretRightIcon), { ssr: false });
const CheckIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.CheckIcon), { ssr: false });
const EyeIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.EyeIcon), { ssr: false });
const EyeSlashIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.EyeSlashIcon), { ssr: false });
const CalendarBlankIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.CalendarBlankIcon), { ssr: false });
const ClockIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.ClockIcon), { ssr: false });

const inputVariants = cva(
    'flex h-10 w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-sm placeholder:text-muted-foreground/60 disabled:cursor-not-allowed disabled:opacity-50 transition-colors focus-visible:outline-none focus:border-primary/60 focus:ring-primary/20',
    {
        variants: {
            variant: {
                default: '',
                outline: 'border border-border/60',
                filled: 'bg-muted border-muted text-foreground',
            },
            size: {
                sm: 'h-9 px-3 rounded-md',
                md: 'h-10 py-2 px-4',
                lg: 'h-11 px-8 rounded-md',
            },
            validation: {
                default: '',
                error: 'border-destructive focus-visible:ring-destructive',
                success: 'border-success focus-visible:ring-success',
            },
            hasLabel: {
                true: 'placeholder:opacity-0 placeholder:transition-opacity placeholder:duration-300 placeholder:delay-150 focus:placeholder:opacity-100',
                false: 'placeholder:opacity-100',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
            hasLabel: false,
        },
    }
);

const maskConfigs = {
    cpf: { mask: '000.000.000-00' },
    cnpj: { mask: '00.000.000/0000-00' },
    cep: { mask: '00000-000' },
    phone: {
        mask: [
            { mask: '(00) 0000-0000' },
            { mask: '(00) 00000-0000' },
        ]
    },
    date: { mask: '00/00/0000' },
    time: { mask: '00:00' },
    datetime: { mask: '00/00/0000 00:00' },
};

export interface InputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
    validation?: 'default' | 'error' | 'success';
    isLoading?: boolean;
    isPending?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    type?: React.InputHTMLAttributes<HTMLInputElement>['type'] | 'currency' | 'checkbox';
    label?: string;
    onValueChange?: (value: any) => void;
    error?: string;
    rightPlaceholder?: string;
    mask?: keyof typeof maskConfigs | string;
    animationEntrance?: boolean;
    animationOut?: boolean;
    isInCard?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, variant, size, validation, isLoading, isPending, leftIcon, rightIcon, type = 'text', label, placeholder, onValueChange, error, rightPlaceholder, mask, animationEntrance = false, animationOut = false, isInCard = false, ...props }, ref) => {
        const [isFocused, setIsFocused] = React.useState(false);
        const [hasValue, setHasValue] = React.useState(false);
        const [displayValue, setDisplayValue] = React.useState<string>(typeof props.value === 'string' ? (props.value as string) : '');
        const [showPassword, setShowPassword] = React.useState(false);


        const isMasked = !!mask;
        const isCurrency = type === 'currency' && !isMasked;
        const isDate = type === 'date' && !isMasked;
        const isTime = type === 'time' && !isMasked;
        const isDateTime = type === 'datetime-local' && !isMasked;
        const isPassword = type === 'password';
        const isColor = type === 'color';
        const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

        const [dateOpen, setDateOpen] = React.useState(false);
        const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
        const [viewMonth, setViewMonth] = React.useState<Date>(() => new Date());
        const [calendarView, setCalendarView] = React.useState<'day' | 'month' | 'year'>('day');
        const [calendarWidth, setCalendarWidth] = React.useState<number | undefined>();
        const [dateTimePosition, setDateTimePosition] = React.useState({
            top: 8,
            left: 8,
            width: 352,
            maxHeight: 400,
        });

        const [timeOpen, setTimeOpen] = React.useState(false);
        const [selectedTime, setSelectedTime] = React.useState<string>('');
        const [timePickerWidth, setTimePickerWidth] = React.useState<number | undefined>();

        const inputRef = React.useRef<HTMLInputElement>(null);
        const datePortalRef = React.useRef<HTMLDivElement>(null);
        const timePortalRef = React.useRef<HTMLDivElement>(null);
        const timeHourListRef = React.useRef<HTMLDivElement>(null);
        const timeMinuteListRef = React.useRef<HTMLDivElement>(null);

        const maskOptions = typeof mask === 'string' && maskConfigs[mask as keyof typeof maskConfigs]
            ? maskConfigs[mask as keyof typeof maskConfigs]
            : (typeof mask === 'string' ? { mask } : undefined);

        const {
            ref: maskRef,
            value: maskedValue,
            setValue,
        } = useIMask(
            (maskOptions as any) ?? {},
            {
                onAccept: (val, maskInstance) => {
                    const unmaskedValue = maskInstance.unmaskedValue;
                    
                    // Propaga o valor SEM máscara para onValueChange
                    onValueChange?.(unmaskedValue);

                    // Simula o evento onChange para bibliotecas de formulário, enviando o valor SEM máscara
                    if (props.onChange) {
                        const syntheticEvent = {
                            target: {
                                name: props.name,
                                value: unmaskedValue,
                            },
                            currentTarget: {
                                name: props.name,
                                value: unmaskedValue,
                            }
                        } as React.ChangeEvent<HTMLInputElement>;
                        
                        props.onChange(syntheticEvent);
                    }
                }
            }
        );

        // Sincroniza o valor externo (de props) com o estado da máscara
        React.useEffect(() => {
            if (isMasked) {
                const externalValue = props.value ?? props.defaultValue;
                if (externalValue !== undefined && externalValue !== null) {
                    setValue(String(externalValue));
                }
            }
        }, [props.value, props.defaultValue, setValue, isMasked]);

        // Combina o ref do iMask com o ref encaminhado (forwardRef)
        const setCombinedRefs = React.useCallback(
            (node: HTMLInputElement | null) => { // Aceitar 'null' para desmontagem
                // CORREÇÃO: Atribua à propriedade .current em vez de chamar como função
                if (maskRef) {
                    (maskRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
                }

                // Atribui o nó ao ref encaminhado (forwardRef)
                if (typeof ref === 'function') {
                    ref(node);
                } else if (ref) {
                    ref.current = node;
                }

                // Atribui ao ref local também, se necessário para outras lógicas
                if (inputRef) {
                    inputRef.current = node;
                }
            },
            [ref, maskRef] // A dependência é o próprio objeto maskRef
        );

        React.useImperativeHandle(ref, () => inputRef.current!);

        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(true);
            props.onFocus?.(e);
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(false);
            if (!isDate) {
                setHasValue(!!e.target.value);
            }
            props.onBlur?.(e);
        };

        const formatCurrencyInput = (val: string | number): string => {
            const num = typeof val === 'number' ? val : Number(val);
            if (Number.isNaN(num)) return '';
            return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
        };

        const parseCurrencyInput = (text: string): number => {
            const digits = text.replace(/\D/g, '');
            const value = Number(digits) / 100;
            return value;
        };

        const getColorName = (hex: string): string => {
            if (!hex) return 'Nenhuma';

            const colors: { [key: string]: string } = {
                '#000000': 'Preto', '#FFFFFF': 'Branco', '#FF0000': 'Vermelho', '#00FF00': 'Verde Lima',
                '#0000FF': 'Azul', '#FFFF00': 'Amarelo', '#FF00FF': 'Magenta', '#00FFFF': 'Ciano',
                '#C0C0C0': 'Prata', '#808080': 'Cinza', '#800000': 'Marrom Escuro', '#808000': 'Oliva',
                '#008000': 'Verde', '#800080': 'Roxo', '#008080': 'Azul Petróleo', '#000080': 'Azul Marinho',
                '#FFA500': 'Laranja', '#FFC0CB': 'Rosa', '#FFD700': 'Dourado', '#A52A2A': 'Marrom',
                '#DEB887': 'Bege', '#5F9EA0': 'Azul Acinzentado', '#D2691E': 'Chocolate',
                '#FF7F50': 'Coral', '#6495ED': 'Azul Royal', '#DC143C': 'Carmesim',
                '#00BFFF': 'Azul Céu', '#B8860B': 'Dourado Escuro', '#A9A9A9': 'Cinza Escuro',
                '#BDB76B': 'Cáqui', '#FF8C00': 'Laranja Escuro', '#9932CC': 'Orquídea Escuro',
                '#8B0000': 'Vermelho Escuro', '#E9967A': 'Salmão Escuro', '#8FBC8F': 'Verde Mar',
                '#483D8B': 'Ardósia Azul', '#00CED1': 'Turquesa Escuro', '#9400D3': 'Violeta Escuro',
                '#FF1493': 'Rosa Profundo', '#1E90FF': 'Azul Dodger', '#B22222': 'Tijolo',
                '#228B22': 'Verde Floresta', '#DCDCDC': 'Cinza Claro', '#F8F8FF': 'Branco Fantasma',
                '#ADFF2F': 'Verde Amarelado', '#FF69B4': 'Rosa Choque', '#CD5C5C': 'Vermelho Indiano',
                '#4B0082': 'Índigo', '#F0E68C': 'Cáqui Claro', '#E6E6FA': 'Lavanda',
                '#FFFACD': 'Limão', '#ADD8E6': 'Azul Claro', '#90EE90': 'Verde Claro',
                '#FFB6C1': 'Rosa Claro', '#FFA07A': 'Salmão Claro', '#20B2AA': 'Verde Mar Claro',
                '#87CEFA': 'Azul Céu Claro', '#778899': 'Cinza Ardósia', '#B0C4DE': 'Azul Aço Claro',
                '#FFFFE0': 'Amarelo Claro', '#32CD32': 'Verde Limão', '#66CDAA': 'Água Marinha',
                '#0000CD': 'Azul Médio', '#BA55D3': 'Orquídea Médio', '#9370DB': 'Roxo Médio',
                '#3CB371': 'Verde Mar Médio', '#7B68EE': 'Ardósia Azul Médio', '#00FA9A': 'Verde Primavera Médio',
                '#48D1CC': 'Turquesa Médio', '#C71585': 'Violeta Vermelho Médio', '#191970': 'Azul Meia-Noite',
                '#FFE4E1': 'Rosa Nevoeiro', '#FFE4B5': 'Mocassim', '#FFDEAD': 'Branco Navajo',
                '#FDF5E6': 'Renda Antiga', '#6B8E23': 'Verde Oliva Escuro', '#FF4500': 'Laranja Vermelho',
                '#DA70D6': 'Orquídea', '#EEE8AA': 'Dourado Pálido', '#98FB98': 'Verde Pálido',
                '#AFEEEE': 'Turquesa Pálido', '#DB7093': 'Violeta Vermelho Pálido', '#FFEFD5': 'Pêssego Claro',
                '#FFDAB9': 'Pêssego', '#CD853F': 'Peru', '#DDA0DD': 'Ameixa',
                '#B0E0E6': 'Azul Pó', '#663399': 'Roxo Rebecca', '#BC8F8F': 'Marrom Rosado',
                '#4169E1': 'Azul Royal Brilhante', '#8B4513': 'Marrom Sela', '#FA8072': 'Salmão',
                '#F4A460': 'Marrom Areia', '#2E8B57': 'Verde Mar Escuro', '#FFF5EE': 'Concha',
                '#A0522D': 'Siena', '#87CEEB': 'Azul Céu Vivo', '#6A5ACD': 'Ardósia Azul Médio',
                '#708090': 'Cinza Ardósia Escuro', '#FFFAFA': 'Neve', '#00FF7F': 'Verde Primavera',
                '#4682B4': 'Azul Aço', '#D2B48C': 'Bronzeado', '#D8BFD8': 'Cardo',
                '#FF6347': 'Tomate', '#40E0D0': 'Turquesa', '#EE82EE': 'Violeta',
                '#F5DEB3': 'Trigo', '#F5F5F5': 'Branco Fumaça', '#9ACD32': 'Verde Amarelado Escuro'
            };

            const upperHex = hex.toUpperCase();
            return colors[upperHex] || 'Cor Personalizada';
        };

        const parseDateString = (dateString: string): Date | null => {
            if (!dateString) return null;
            const date = new Date(`${dateString}T00:00:00`);
            if (isNaN(date.getTime())) return null;
            return date;
        };

        const toISODate = (d: Date) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const formatDisplayDate = (d: Date | null) => {
            if (!d) return '';
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${day}/${month}/${year}`;
        };

        const parseDateTimeString = (value: string): { date: Date; time: string } | null => {
            const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
            if (!match) return null;

            const [, year, month, day, hour, minute] = match;
            const date = new Date(Number(year), Number(month) - 1, Number(day));
            if (
                Number.isNaN(date.getTime())
                || date.getFullYear() !== Number(year)
                || date.getMonth() !== Number(month) - 1
                || date.getDate() !== Number(day)
            ) {
                return null;
            }

            const normalizedHour = Number(hour);
            const normalizedMinute = Number(minute);

            if (
                !Number.isInteger(normalizedHour)
                || !Number.isInteger(normalizedMinute)
                || normalizedHour < 0
                || normalizedHour > 23
                || normalizedMinute < 0
                || normalizedMinute > 59
            ) {
                return null;
            }

            return {
                date,
                time: `${String(normalizedHour).padStart(2, '0')}:${String(normalizedMinute).padStart(2, '0')}`,
            };
        };

        const serializeDateTime = (date: Date, time: string): string => `${toISODate(date)}T${time}`;

        const formatDisplayDateTime = (date: Date | null, time: string): string => {
            if (!date) return '';
            return `${formatDisplayDate(date)} ${time || '00:00'}`;
        };

        const emitDateTimeChange = (date: Date, time: string) => {
            const serializedValue = serializeDateTime(date, time);
            setDisplayValue(formatDisplayDateTime(date, time));
            setHasValue(true);
            onValueChange?.(serializedValue);

            const syntheticEvent = {
                target: { name: props.name, value: serializedValue },
                currentTarget: { name: props.name, value: serializedValue },
            } as React.ChangeEvent<HTMLInputElement>;
            props.onChange?.(syntheticEvent);
        };

        const normalizeTimeInput = (value: string): string => {
            const digits = value.replace(/\D/g, '').slice(0, 4);

            if (digits.length <= 2) {
                return digits;
            }

            if (digits.length === 3) {
                return `${digits.slice(0, 1)}:${digits.slice(1)}`;
            }

            return `${digits.slice(0, 2)}:${digits.slice(2)}`;
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (isCurrency) {
                const val = parseCurrencyInput(e.target.value);
                setDisplayValue(formatCurrencyInput(val));
                setHasValue(val > 0);
                onValueChange?.(val);
                const synthetic = { ...e, target: { ...(e.target as any), value: String(val) } } as React.ChangeEvent<HTMLInputElement>;
                props.onChange?.(synthetic);
                return;
            }

            if (isTime) {
                const normalizedTime = normalizeTimeInput(e.target.value);

                setDisplayValue(normalizedTime);
                setSelectedTime(normalizedTime);
                setHasValue(!!normalizedTime);
                onValueChange?.(normalizedTime);

                if (props.onChange) {
                    const synthetic = {
                        ...e,
                        target: {
                            ...(e.target as any),
                            name: props.name,
                            value: normalizedTime,
                        },
                        currentTarget: {
                            ...(e.currentTarget as any),
                            name: props.name,
                            value: normalizedTime,
                        }
                    } as React.ChangeEvent<HTMLInputElement>;

                    props.onChange(synthetic);
                }

                return;
            }

            setHasValue(!!e.target.value);
            props.onChange?.(e);
        };

        // O IMask escuta o evento nativo pelo ref. O handler vazio evita que o React
        // trate o campo controlado como somente leitura sem duplicar o onAccept.
        const handleMaskedReactChange = React.useCallback(() => undefined, []);

        React.useEffect(() => {
            if (isMasked) {
                setHasValue(!!maskedValue);
                return;
            }
            if (isCurrency) {
                const initial = props.value ?? props.defaultValue ?? '';
                const num = typeof initial === 'number' ? initial : parseFloat(String(initial)) || 0;
                setDisplayValue(num ? formatCurrencyInput(num) : '');
                setHasValue(!!num);
            } else if (isDateTime) {
                const value = String(props.value ?? props.defaultValue ?? '');
                const parsed = parseDateTimeString(value);

                if (parsed) {
                    setSelectedDate(parsed.date);
                    setSelectedTime(parsed.time);
                    setTimeHour(parsed.time.slice(0, 2));
                    setTimeMinute(parsed.time.slice(3, 5));
                    setViewMonth(new Date(parsed.date.getFullYear(), parsed.date.getMonth(), 1));
                    setDisplayValue(formatDisplayDateTime(parsed.date, parsed.time));
                    setHasValue(true);
                } else {
                    setDisplayValue('');
                    setSelectedDate(null);
                    setSelectedTime('');
                    setHasValue(false);
                }
            } else if (isDate) {
                const v = (props.value ?? props.defaultValue) as string | undefined;
                if (v) {
                    const d = parseDateString(v);
                    if (d) {
                        setSelectedDate(d);
                        setViewMonth(new Date(d.getFullYear(), d.getMonth(), 1));
                        setDisplayValue(formatDisplayDate(d));
                        setHasValue(true);
                    }
                } else {
                    setDisplayValue('');
                    setSelectedDate(null);
                    setHasValue(false);
                }
            } else if (isTime) {
                const v = (props.value ?? props.defaultValue) as string | undefined;
                if (v) {
                    const normalizedTime = normalizeTimeInput(v);
                    setSelectedTime(normalizedTime);
                    setDisplayValue(normalizedTime);
                    setHasValue(true);
                } else {
                    setDisplayValue('');
                    setSelectedTime('');
                    setHasValue(false);
                }
            } else {
                if (inputRef.current) {
                    setHasValue(!!inputRef.current.value);
                }
            }
        }, [props.value, props.defaultValue, isCurrency, isDate, isTime, isDateTime, isMasked, maskedValue]);

        const shouldFloatLabel = isFocused || hasValue;

        // NOVO: Helpers para o calendário
        const daysOfWeek = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
        const monthsOfYear = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

        const getMonthMatrix = (date: Date) => {
            const year = date.getFullYear();
            const month = date.getMonth();
            const firstDayOfMonth = new Date(year, month, 1);
            const startDay = firstDayOfMonth.getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const weeks: Array<Array<Date | null>> = [];
            let current = 1 - startDay;
            for (let w = 0; w < 6; w++) {
                const week: Array<Date | null> = [];
                for (let d = 0; d < 7; d++) {
                    const thisDate = new Date(year, month, current);
                    if (current < 1 || current > daysInMonth) week.push(null);
                    else week.push(thisDate);
                    current++;
                }
                weeks.push(week);
            }
            return weeks;
        };

        const handlePickDate = (d: Date) => {
            setSelectedDate(d);

            if (isDateTime) {
                const time = selectedTime || `${timeHour}:${timeMinute}`;
                emitDateTimeChange(d, time);
                setCalendarView('day');
                return;
            }

            const iso = toISODate(d);
            setDisplayValue(formatDisplayDate(d));
            setHasValue(true);
            onValueChange?.(d);
            const event = { target: { value: iso } } as unknown as React.ChangeEvent<HTMLInputElement>;
            props.onChange?.(event);
            setDateOpen(false);
            setCalendarView('day'); // Reseta a view
        };

        // ALTERADO: Mede a largura do input ao abrir o calendário
        const openCalendar = () => {
            if ((!isDate && !isDateTime) || props.disabled || props.readOnly) return;

            if (isDateTime) {
                const currentTime = selectedTime || '00:00';
                setTimeHour(currentTime.slice(0, 2));
                setTimeMinute(currentTime.slice(3, 5));
            }

            setCalendarWidth(inputRef.current?.offsetWidth);
            setDateOpen((open) => !open);
            setIsFocused(true);
        };

        const updateDateTimePosition = React.useCallback(() => {
            if (!isDateTime || !inputRef.current || typeof window === 'undefined') return;

            const viewportPadding = 8;
            const gap = 8;
            const inputRect = inputRef.current.getBoundingClientRect();
            const width = Math.min(
                Math.max(inputRect.width, 352),
                window.innerWidth - (viewportPadding * 2)
            );
            const panelHeight = datePortalRef.current?.offsetHeight ?? 520;
            const spaceBelow = window.innerHeight - inputRect.bottom - gap - viewportPadding;
            const spaceAbove = inputRect.top - gap - viewportPadding;
            const hasLimitedVerticalSpace = Math.max(spaceBelow, spaceAbove) < 320;
            const placeBelow = spaceBelow >= Math.min(panelHeight, 320) || spaceBelow >= spaceAbove;
            const availableHeight = hasLimitedVerticalSpace
                ? window.innerHeight - (viewportPadding * 2)
                : Math.max(220, placeBelow ? spaceBelow : spaceAbove);
            const visiblePanelHeight = Math.min(panelHeight, availableHeight);
            const top = hasLimitedVerticalSpace
                ? viewportPadding
                : placeBelow
                    ? inputRect.bottom + gap
                    : Math.max(viewportPadding, inputRect.top - gap - visiblePanelHeight);
            const left = Math.min(
                Math.max(viewportPadding, inputRect.left),
                Math.max(viewportPadding, window.innerWidth - width - viewportPadding)
            );

            setDateTimePosition({ top, left, width, maxHeight: availableHeight });
        }, [isDateTime]);

        React.useLayoutEffect(() => {
            if (!isDateTime || !dateOpen) return;

            updateDateTimePosition();
            const animationFrameId = window.requestAnimationFrame(updateDateTimePosition);

            window.addEventListener('resize', updateDateTimePosition);
            window.addEventListener('scroll', updateDateTimePosition, true);

            return () => {
                window.cancelAnimationFrame(animationFrameId);
                window.removeEventListener('resize', updateDateTimePosition);
                window.removeEventListener('scroll', updateDateTimePosition, true);
            };
        }, [isDateTime, dateOpen, updateDateTimePosition]);

        const closeCalendarOnOutside = React.useCallback((e: MouseEvent) => {
            if (datePortalRef.current && inputRef.current) {
                if (!datePortalRef.current.contains(e.target as Node) && !inputRef.current.contains(e.target as Node)) {
                    setDateOpen(false);
                    setIsFocused(false);
                }
            }
        }, []);

        React.useEffect(() => {
            if (dateOpen) {
                document.addEventListener('mousedown', closeCalendarOnOutside);
                return () => document.removeEventListener('mousedown', closeCalendarOnOutside);
            }
        }, [dateOpen, closeCalendarOnOutside]);

        // NOVO: Funções para navegar entre as views do calendário
        const handleHeaderClick = () => {
            if (calendarView === 'day') setCalendarView('month');
            else if (calendarView === 'month') setCalendarView('year');
        };

        const handlePickMonth = (monthIndex: number) => {
            setViewMonth(new Date(viewMonth.getFullYear(), monthIndex, 1));
            setCalendarView('day');
        };

        const handlePickYear = (year: number) => {
            setViewMonth(new Date(year, viewMonth.getMonth(), 1));
            setCalendarView('month');
        };

        const changeViewDate = (amount: number) => {
            const newDate = new Date(viewMonth);
            if (calendarView === 'day') newDate.setMonth(newDate.getMonth() + amount);
            else if (calendarView === 'month') newDate.setFullYear(newDate.getFullYear() + amount);
            else if (calendarView === 'year') newDate.setFullYear(newDate.getFullYear() + amount * 12);
            setViewMonth(newDate);
        };

        // NOVO: Lógica para renderizar o cabeçalho dinamicamente
        const renderCalendarHeader = () => {
            let headerText = '';
            if (calendarView === 'day') {
                headerText = viewMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            } else if (calendarView === 'month') {
                headerText = String(viewMonth.getFullYear());
            } else {
                const startYear = Math.floor(viewMonth.getFullYear() / 12) * 12;
                headerText = `${startYear} - ${startYear + 11}`;
            }

            return (
                <div className="flex items-center justify-between mb-2">
                    <button type="button" className="p-1 rounded hover:bg-accent" onClick={() => changeViewDate(-1)}>
                        <CaretLeftIcon className="w-4 h-4" />
                    </button>
                    <button type="button" className="text-sm font-medium hover:text-primary" onClick={handleHeaderClick}>
                        {headerText}
                    </button>
                    <button type="button" className="p-1 rounded hover:bg-accent" onClick={() => changeViewDate(1)}>
                        <CaretRightIcon className="w-4 h-4" />
                    </button>
                </div>
            )
        };

        // NOVO: Lógica para renderizar o corpo do calendário dinamicamente
        const isDateOutsideBounds = (date: Date): boolean => {
            const minValue = typeof props.min === 'string' ? props.min.slice(0, 10) : '';
            const maxValue = typeof props.max === 'string' ? props.max.slice(0, 10) : '';
            const value = toISODate(date);

            return (minValue !== '' && value < minValue) || (maxValue !== '' && value > maxValue);
        };

        const renderCalendarBody = () => {
            if (calendarView === 'year') {
                const startYear = Math.floor(viewMonth.getFullYear() / 12) * 12;
                const years = Array.from({ length: 12 }, (_, i) => startYear + i);
                return (
                    <div className="grid grid-cols-4 gap-2">
                        {years.map(year => (
                            <button key={year} type="button" onClick={() => handlePickYear(year)}
                                className="p-2 rounded text-sm hover:bg-accent">
                                {year}
                            </button>
                        ))}
                    </div>
                )
            }

            if (calendarView === 'month') {
                return (
                    <div className="grid grid-cols-3 gap-2">
                        {monthsOfYear.map((month, index) => (
                            <button key={month} type="button" onClick={() => handlePickMonth(index)}
                                className="p-2 rounded text-sm hover:bg-accent">
                                {month}
                            </button>
                        ))}
                    </div>
                )
            }

            // Default é a view de 'day'
            return (
                <>
                    <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground mb-1">
                        {daysOfWeek.map((d, i) => (
                            <div key={i} className="text-center py-1">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {getMonthMatrix(viewMonth).map((week, wi) => (
                            <React.Fragment key={wi}>
                                {week.map((d, di) => {
                                    if (!d) return <div key={di} className="h-8" />;
                                    const isToday = toISODate(d) === toISODate(new Date());
                                    const isSelected = selectedDate && toISODate(d) === toISODate(selectedDate);
                                    const isDisabled = isDateOutsideBounds(d);
                                    return (
                                        <button
                                            key={di}
                                            type="button"
                                            className={cn(
                                                'h-8 w-full rounded text-sm',
                                                'hover:bg-accent hover:text-accent-foreground',
                                                isDisabled && 'cursor-not-allowed opacity-40 hover:bg-transparent',
                                                isSelected ? 'bg-primary text-primary-foreground' : isToday ? 'border border-border/60' : ''
                                            )}
                                            disabled={isDisabled}
                                            onClick={() => handlePickDate(d)}
                                        >
                                            {d.getDate()}
                                        </button>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </>
            );
        }

        // Time Picker Functions
        const handlePickTime = (time: string) => {
            setSelectedTime(time);
            setDisplayValue(time);
            setHasValue(true);
            onValueChange?.(time);
            const event = { target: { value: time } } as unknown as React.ChangeEvent<HTMLInputElement>;
            props.onChange?.(event);
            setTimeOpen(false);
        };

        const openTimePicker = () => {
            if (!isTime || props.disabled || props.readOnly) return;

            const currentTimeValue = selectedTime || displayValue || String(props.value ?? props.defaultValue ?? '');
            const { hour, minute } = parseTimeValue(currentTimeValue);

            setTimeHour(hour);
            setTimeMinute(minute);
            setTimePickerWidth(inputRef.current?.offsetWidth);
            setTimeOpen(true);
            setIsFocused(true);
        };

        const closeTimePickerOnOutside = React.useCallback((e: MouseEvent) => {
            if (timePortalRef.current && inputRef.current) {
                if (!timePortalRef.current.contains(e.target as Node) && !inputRef.current.contains(e.target as Node)) {
                    setTimeOpen(false);
                    setIsFocused(false);
                }
            }
        }, []);

        React.useEffect(() => {
            if (timeOpen) {
                document.addEventListener('mousedown', closeTimePickerOnOutside);
                return () => document.removeEventListener('mousedown', closeTimePickerOnOutside);
            }
        }, [timeOpen, closeTimePickerOnOutside]);

        const generateHours = () => {
            return Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
        };

        const generateMinutes = () => {
            return Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
        };

        const parseTimeValue = (timeStr: string): { hour: string; minute: string } => {
            if (!timeStr) return { hour: '00', minute: '00' };

            const normalizedTime = normalizeTimeInput(timeStr);
            const [hour, minute] = normalizedTime.split(':');
            const parsedHour = Number(hour);
            const parsedMinute = Number(minute);

            return {
                hour: String(Number.isNaN(parsedHour) ? 0 : Math.min(23, Math.max(0, parsedHour))).padStart(2, '0'),
                minute: String(Number.isNaN(parsedMinute) ? 0 : Math.min(59, Math.max(0, parsedMinute))).padStart(2, '0')
            };
        };

        const centerSelectedTimeOption = React.useCallback((container: HTMLDivElement | null, optionValue: string) => {
            if (!container) {
                return;
            }

            const targetButton = container.querySelector<HTMLButtonElement>(`button[data-time-option="${optionValue}"]`);

            if (!targetButton) {
                return;
            }

            const targetScrollTop = targetButton.offsetTop - (container.clientHeight / 2) + (targetButton.clientHeight / 2);
            container.scrollTop = Math.max(0, targetScrollTop);
        }, []);

        const [timeHour, setTimeHour] = React.useState('00');
        const [timeMinute, setTimeMinute] = React.useState('00');

        React.useEffect(() => {
            if ((isTime || isDateTime) && selectedTime) {
                const { hour, minute } = parseTimeValue(selectedTime);
                setTimeHour(hour);
                setTimeMinute(minute);
            }
        }, [isTime, isDateTime, selectedTime]);

        React.useEffect(() => {
            const pickerOpen = (isTime && timeOpen) || (isDateTime && dateOpen);
            if (!pickerOpen) {
                return;
            }

            const animationFrameId = window.requestAnimationFrame(() => {
                centerSelectedTimeOption(timeHourListRef.current, timeHour);
                centerSelectedTimeOption(timeMinuteListRef.current, timeMinute);
            });

            return () => window.cancelAnimationFrame(animationFrameId);
        }, [isTime, isDateTime, timeOpen, dateOpen, timeHour, timeMinute, centerSelectedTimeOption]);

        const handleTimeComponentChange = (hour: string, minute: string) => {
            const timeValue = `${hour}:${minute}`;
            setTimeHour(hour);
            setTimeMinute(minute);
            setSelectedTime(timeValue);

            if (isDateTime) {
                if (selectedDate) {
                    emitDateTimeChange(selectedDate, timeValue);
                }
                return;
            }

            setDisplayValue(timeValue);
            setHasValue(true);
            onValueChange?.(timeValue);
            const event = { target: { value: timeValue } } as unknown as React.ChangeEvent<HTMLInputElement>;
            props.onChange?.(event);
        };

        const renderDateTimePicker = () => typeof document !== 'undefined' ? createPortal((
            <div
                ref={datePortalRef}
                role="dialog"
                aria-label="Selecionar data e hora"
                style={{
                    position: 'fixed',
                    top: `${dateTimePosition.top}px`,
                    left: `${dateTimePosition.left}px`,
                    width: `${dateTimePosition.width}px`,
                    maxHeight: `${dateTimePosition.maxHeight}px`,
                }}
                className="z-[100] overflow-y-auto overscroll-contain rounded-xl border border-border/60 bg-background p-4 shadow-xl"
            >
                <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold">Data e hora</p>
                        <p className="text-xs text-muted-foreground">
                            {selectedDate ? formatDisplayDateTime(selectedDate, selectedTime || `${timeHour}:${timeMinute}`) : 'Selecione uma data'}
                        </p>
                    </div>
                    <div className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                        <ClockIcon className="size-3.5" />
                        {timeHour}:{timeMinute}
                    </div>
                </div>

                <div className="rounded-lg border border-border/50 p-3">
                    {renderCalendarHeader()}
                    {renderCalendarBody()}
                </div>

                <div className="mt-3 grid grid-cols-[1fr_auto_1fr] gap-2 border-t border-border/60 pt-3">
                    <div>
                        <div className="mb-2 text-center text-xs font-medium text-muted-foreground">Hora</div>
                        <div
                            ref={timeHourListRef}
                            role="listbox"
                            aria-label="Horas"
                            className="max-h-32 overflow-y-auto rounded-md border border-border/60"
                        >
                            {generateHours().map((hour) => (
                                <button
                                    key={hour}
                                    data-time-option={hour}
                                    type="button"
                                    role="option"
                                    aria-selected={timeHour === hour}
                                    onClick={() => handleTimeComponentChange(hour, timeMinute)}
                                    className={cn(
                                        'w-full px-3 py-2 text-center text-sm transition-colors hover:bg-accent',
                                        timeHour === hour && 'bg-primary font-semibold text-primary-foreground'
                                    )}
                                >
                                    {hour}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-center pt-6 text-xl font-bold text-muted-foreground">:</div>

                    <div>
                        <div className="mb-2 text-center text-xs font-medium text-muted-foreground">Minuto</div>
                        <div
                            ref={timeMinuteListRef}
                            role="listbox"
                            aria-label="Minutos"
                            className="max-h-32 overflow-y-auto rounded-md border border-border/60"
                        >
                            {generateMinutes().map((minute) => (
                                <button
                                    key={minute}
                                    data-time-option={minute}
                                    type="button"
                                    role="option"
                                    aria-selected={timeMinute === minute}
                                    onClick={() => handleTimeComponentChange(timeHour, minute)}
                                    className={cn(
                                        'w-full px-3 py-2 text-center text-sm transition-colors hover:bg-accent',
                                        timeMinute === minute && 'bg-primary font-semibold text-primary-foreground'
                                    )}
                                >
                                    {minute}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-3 flex justify-end border-t border-border/60 pt-3">
                    <button
                        type="button"
                        disabled={!selectedDate}
                        onClick={() => {
                            setDateOpen(false);
                            setIsFocused(false);
                        }}
                        className="rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Concluir
                    </button>
                </div>
            </div>
        ), document.body) : null;

        if (type === 'checkbox') {
            const id = props.id || React.useId(); // Garante um ID para o label funcionar
            return (
                <div className="flex items-center space-x-2">
                    <div className="relative flex items-center justify-center">
                        <input
                            id={id}
                            type="checkbox"
                            ref={ref}
                            className={cn(
                                'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
                                'appearance-none', // Remove o estilo padrão do browser
                                'checked:bg-primary checked:border-primary',
                                className
                            )}
                            {...props}
                        />
                        {/* Adiciona o ícone de "check" por cima quando selecionado */}
                        <div className="absolute text-primary-foreground pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity">
                            <CheckIcon className="h-3 w-3" weight="bold" />
                        </div>
                    </div>
                    {label && (
                        <label
                            htmlFor={id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            {label}
                        </label>
                    )}
                </div>
            );
        }

        if (isColor) {
            const colorValue = (props.value as string) || '#000000';
            const colorName = getColorName(colorValue);
            const id = props.id || React.useId();

            return (
                <div className='w-full'>
                    {label && (
                        <label htmlFor={id} className="block text-sm font-medium mb-2 text-foreground">
                            {label}
                        </label>
                    )}
                    <div className="group relative rounded-lg bg-card transition-all duration-300 overflow-hidden">
                        {/* Background Gradient Effect */}
                        <div
                            className="absolute inset-0 opacity-5 transition-opacity duration-300 group-hover:opacity-10"
                            style={{ background: `linear-gradient(135deg, ${colorValue}00 0%, ${colorValue} 100%)` }}
                        />

                        <div className="relative flex items-center gap-4 p-4">
                            {/* Color Circle with Ring */}
                            <div className="relative flex-shrink-0">
                                <input
                                    id={id}
                                    type="color"
                                    ref={ref}
                                    value={colorValue}
                                    onChange={(e) => {
                                        props.onChange?.(e);
                                        onValueChange?.(e.target.value);
                                    }}
                                    className="sr-only"
                                    disabled={props.disabled}
                                    {...props}
                                />
                                <label
                                    htmlFor={id}
                                    className={cn(
                                        "relative block w-16 h-16 rounded-xl cursor-pointer shadow-lg transition-all duration-300",
                                        "ring-2 ring-offset-2 ring-offset-background group-hover:ring-4 group-hover:scale-105",
                                        "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-white/20 before:to-transparent",
                                        props.disabled ? "opacity-50 cursor-not-allowed ring-border" : "ring-border hover:ring-primary/50"
                                    )}
                                    style={{ backgroundColor: colorValue }}
                                >
                                    <span className="absolute inset-0 rounded-xl shadow-inner" />
                                </label>
                            </div>

                            {/* Color Info */}
                            <div className="flex-1 min-w-0 space-y-5">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-semibold text-foreground truncate">
                                        {colorName}
                                    </p>
                                    <p className="text-sm text-muted-foreground font-mono tracking-wide">
                                        {colorValue.toUpperCase()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Color preview bar */}
                                    <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r overflow-hidden">
                                        <div
                                            className="h-full transition-all duration-300"
                                            style={{ backgroundColor: colorValue }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {error && (
                        <small role="alert" className="mt-1.5 text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1">
                            {error}
                        </small>
                    )}
                </div>
            );
        }

        if (isPending) {
            return <Skeleton />;
        }

        const shouldUseHiddenSerializedValue = (isMasked || isDate || isTime || isDateTime) && !!props.name;

        const rawDateValue = typeof props.value === 'string'
            ? props.value
            : typeof props.defaultValue === 'string'
                ? props.defaultValue
                : '';

        const rawTimeValue = typeof props.value === 'string'
            ? props.value
            : typeof props.defaultValue === 'string'
                ? props.defaultValue
                : '';

        const hiddenDateValue = selectedDate
            ? toISODate(selectedDate)
            : (/^\d{4}-\d{2}-\d{2}$/.test(rawDateValue) ? rawDateValue : '');

        const hiddenTimeValue = selectedTime
            ? selectedTime
            : (rawTimeValue ? rawTimeValue.split(':').slice(0, 2).join(':') : '');

        const hiddenDateTimeValue = selectedDate
            ? serializeDateTime(selectedDate, selectedTime || `${timeHour}:${timeMinute}`)
            : (parseDateTimeString(rawDateValue) ? rawDateValue.slice(0, 16) : '');

        const hiddenInputValue = isMasked
            ? String(props.value ?? '')
            : isDate
                ? hiddenDateValue
                : isTime
                    ? hiddenTimeValue
                    : isDateTime
                        ? hiddenDateTimeValue
                    : '';

        const renderInputWithLabel = () => {
            // Remove props controladas internamente para evitar sobrescrita via spread.
            const {
                value: _,
                name: _name,
                onChange: _onChange,
                onFocus: _onFocus,
                onBlur: _onBlur,
                onClick: _onClick,
                readOnly: _readOnly,
                ...restProps
            } = props;
            const inputName = props.name;
            
            return (
            <div className='w-full'>
                <div className="relative w-full">
                    {leftIcon && <span className="absolute left-3 top-1/2 -translate-y-1/2 z-10">{leftIcon}</span>}
                    {/* Campo hidden para enviar valor serializado em máscaras, datas e horas. */}
                    {shouldUseHiddenSerializedValue && inputName && (
                        <input
                            type="hidden"
                            name={inputName}
                            value={hiddenInputValue}
                        />
                    )}
                    <input
                        ref={setCombinedRefs}
                        type={isCurrency || isMasked ? 'text' : (isDate || isTime || isDateTime ? 'text' : effectiveType)}
                        name={isMasked || isDate || isTime || isDateTime ? undefined : inputName}
                        className={cn(
                            inputVariants({ variant, size, validation, hasLabel: true }),
                            leftIcon && !isCurrency && 'pl-10',
                            isCurrency && !leftIcon && 'pl-12',
                            isCurrency && leftIcon && 'pl-16',
                            (isLoading || rightIcon || isDate || isTime || isDateTime || isPassword) && 'pr-10',
                            'peer',
                            isInCard && 'bg-card',
                            className
                        )}
                        placeholder={shouldFloatLabel ? placeholder : ''}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onChange={isMasked ? handleMaskedReactChange : handleChange}
                        value={isMasked ? maskedValue : (isCurrency || isDate || isTime || isDateTime ? displayValue : props.value)}
                        readOnly={isDate || isDateTime || props.readOnly}
                        inputMode={isCurrency ? 'numeric' : isDate || isDateTime ? 'none' : isTime ? 'numeric' : undefined}
                        onClick={isDate || isDateTime ? openCalendar : isTime ? openTimePicker : undefined}
                        {...restProps}
                    />
                    <label
                        className={cn(
                            'absolute text-sm text-muted-foreground transition-all duration-200 ease-in-out pointer-events-none',
                            leftIcon && !isCurrency && 'left-10',
                            isCurrency && !leftIcon && 'left-10',
                            isCurrency && leftIcon && 'left-16',
                            !leftIcon && !isCurrency && 'left-3',
                            shouldFloatLabel
                                ? '-top-2 bg-background px-1 text-xs' // Ajuste fino no px
                                : 'top-1/2 -translate-y-1/2',
                            isInCard && 'bg-card',
                        )}
                    >
                        {label}
                    </label>
                    {isLoading && (
                        <CircleNotchIcon className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />
                    )}
                    {!isLoading && rightIcon && <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightIcon}</span>}
                    {!isLoading && !rightIcon && (isDate || isTime || isDateTime) && (
                        <button
                            type="button"
                            disabled={props.disabled || props.readOnly}
                            aria-label={isDateTime ? 'Abrir seletor de data e hora' : isDate ? 'Abrir calendário' : 'Abrir seletor de horário'}
                            aria-expanded={isDateTime || isDate ? dateOpen : timeOpen}
                            onMouseDown={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                            }}
                            onClick={isDate || isDateTime ? openCalendar : openTimePicker}
                            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isTime ? <ClockIcon className="size-4" /> : <CalendarBlankIcon className="size-4" />}
                        </button>
                    )}
                    {isPassword && (
                        <button
                            type="button"
                            tabIndex={-1}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        >
                            {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                        </button>
                    )}
                    {isCurrency && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                    )}
                    {rightPlaceholder && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{rightPlaceholder}</span>
                    )}
                    {isDateTime && dateOpen && renderDateTimePicker()}
                    {isDate && dateOpen && (
                        // ALTERADO: Estilo e classe para largura dinâmica
                        <div
                            ref={datePortalRef}
                            style={{ width: calendarWidth ? `${calendarWidth}px` : 'auto' }}
                            className="absolute z-50 mt-2 rounded-md border border-border/60 bg-background shadow-lg p-3 top-full">
                            {renderCalendarHeader()}
                            {renderCalendarBody()}
                        </div>
                    )}
                    {isTime && timeOpen && (
                        <div
                            ref={timePortalRef}
                            style={{ width: timePickerWidth ? `${timePickerWidth}px` : 'auto' }}
                            className="absolute z-50 mt-2 rounded-md border border-border/60 bg-background shadow-lg p-3 top-full">
                            <div className="flex gap-2">
                                {/* Hour Select */}
                                <div className="flex-1">
                                    <div className="text-xs text-muted-foreground mb-2 text-center font-medium">Hora</div>
                                    <div ref={timeHourListRef} className="max-h-40 overflow-y-auto border border-border/60 rounded-md">
                                        {generateHours().map((hour) => (
                                            <button
                                                key={hour}
                                                data-time-option={hour}
                                                type="button"
                                                onClick={() => handleTimeComponentChange(hour, timeMinute)}
                                                className={cn(
                                                    'w-full px-3 py-2 text-sm hover:bg-accent transition-colors text-center',
                                                    timeHour === hour && 'bg-primary text-primary-foreground font-semibold'
                                                )}
                                            >
                                                {hour}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Separator */}
                                <div className="flex items-center justify-center pt-6">
                                    <span className="text-2xl font-bold text-muted-foreground">:</span>
                                </div>

                                {/* Minute Select */}
                                <div className="flex-1">
                                    <div className="text-xs text-muted-foreground mb-2 text-center font-medium">Minuto</div>
                                    <div ref={timeMinuteListRef} className="max-h-40 overflow-y-auto border border-border/60 rounded-md">
                                        {generateMinutes().map((minute) => (
                                            <button
                                                key={minute}
                                                data-time-option={minute}
                                                type="button"
                                                onClick={() => handleTimeComponentChange(timeHour, minute)}
                                                className={cn(
                                                    'w-full px-3 py-2 text-sm hover:bg-accent transition-colors text-center',
                                                    timeMinute === minute && 'bg-primary text-primary-foreground font-semibold'
                                                )}
                                            >
                                                {minute}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {error && (
                    <small role="alert" className="mt-1.5 text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1">
                        {error}
                    </small>
                )}
            </div>
            );
        }

        const renderInputWithoutLabel = () => {
            // Remove props controladas internamente para evitar sobrescrita via spread.
            const {
                value: _,
                name: _name,
                onChange: _onChange,
                onFocus: _onFocus,
                onBlur: _onBlur,
                onClick: _onClick,
                readOnly: _readOnly,
                ...restProps
            } = props;
            const inputName = props.name;
            
            return (
            <div className='w-full'>
                <div className="relative w-full">
                    {leftIcon && <span className="absolute left-3 top-1/2 -translate-y-1/2">{leftIcon}</span>}
                    {/* Campo hidden para enviar valor serializado em máscaras, datas e horas. */}
                    {shouldUseHiddenSerializedValue && inputName && (
                        <input
                            type="hidden"
                            name={inputName}
                            value={hiddenInputValue}
                        />
                    )}
                    <input
                        ref={setCombinedRefs}
                        type={isCurrency || isMasked ? 'text' : (isDate || isTime || isDateTime ? 'text' : effectiveType)}
                        name={isMasked || isDate || isTime || isDateTime ? undefined : inputName}
                        className={cn(
                            inputVariants({ variant, size, validation, hasLabel: false }),
                            leftIcon && !isCurrency && 'pl-10',
                            isCurrency && !leftIcon && 'pl-12',
                            isCurrency && leftIcon && 'pl-16',
                            (isLoading || rightIcon || isDate || isTime || isDateTime || isPassword) && 'pr-10',
                            className
                        )}
                        placeholder={placeholder}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onChange={isMasked ? handleMaskedReactChange : handleChange}
                        value={isMasked ? maskedValue : (isCurrency || isDate || isTime || isDateTime ? displayValue : props.value)}
                        readOnly={isDate || isDateTime || props.readOnly}
                        inputMode={isCurrency ? 'numeric' : isDate || isDateTime ? 'none' : isTime ? 'numeric' : undefined}
                        onClick={isDate || isDateTime ? openCalendar : isTime ? openTimePicker : undefined}
                        {...restProps}
                    />
                    {isLoading && (
                        <CircleNotchIcon className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />
                    )}
                    {!isLoading && rightIcon && <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightIcon}</span>}
                    {!isLoading && !rightIcon && (isDate || isTime || isDateTime) && (
                        <button
                            type="button"
                            disabled={props.disabled || props.readOnly}
                            aria-label={isDateTime ? 'Abrir seletor de data e hora' : isDate ? 'Abrir calendário' : 'Abrir seletor de horário'}
                            aria-expanded={isDateTime || isDate ? dateOpen : timeOpen}
                            onMouseDown={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                            }}
                            onClick={isDate || isDateTime ? openCalendar : openTimePicker}
                            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isTime ? <ClockIcon className="size-4" /> : <CalendarBlankIcon className="size-4" />}
                        </button>
                    )}
                    {isPassword && (
                        <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                        </button>
                    )}
                    {isCurrency && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                    )}
                    {rightPlaceholder && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{rightPlaceholder}</span>
                    )}
                    {isDateTime && dateOpen && renderDateTimePicker()}
                    {isDate && dateOpen && (
                        <div
                            ref={datePortalRef}
                            style={{ width: calendarWidth ? `${calendarWidth}px` : 'auto' }}
                            className="absolute z-50 mt-2 rounded-md border border-border/60 bg-background shadow-lg p-3 top-full"
                        >
                            {renderCalendarHeader()}
                            {renderCalendarBody()}
                        </div>
                    )}
                    {isTime && timeOpen && (
                        <div
                            ref={timePortalRef}
                            style={{ width: timePickerWidth ? `${timePickerWidth}px` : 'auto' }}
                            className="absolute z-50 mt-2 rounded-md border border-border/60 bg-background shadow-lg p-3 top-full">
                            <div className="flex gap-2">
                                {/* Hour Select */}
                                <div className="flex-1">
                                    <div className="text-xs text-muted-foreground mb-2 text-center font-medium">Hora</div>
                                    <div ref={timeHourListRef} className="max-h-40 overflow-y-auto border border-border/60 rounded-md">
                                        {generateHours().map((hour) => (
                                            <button
                                                key={hour}
                                                data-time-option={hour}
                                                type="button"
                                                onClick={() => handleTimeComponentChange(hour, timeMinute)}
                                                className={cn(
                                                    'w-full px-3 py-2 text-sm hover:bg-accent transition-colors text-center',
                                                    timeHour === hour && 'bg-primary text-primary-foreground font-semibold'
                                                )}
                                            >
                                                {hour}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Separator */}
                                <div className="flex items-center justify-center pt-6">
                                    <span className="text-2xl font-bold text-muted-foreground">:</span>
                                </div>

                                {/* Minute Select */}
                                <div className="flex-1">
                                    <div className="text-xs text-muted-foreground mb-2 text-center font-medium">Minuto</div>
                                    <div ref={timeMinuteListRef} className="max-h-40 overflow-y-auto border border-border/60 rounded-md">
                                        {generateMinutes().map((minute) => (
                                            <button
                                                key={minute}
                                                data-time-option={minute}
                                                type="button"
                                                onClick={() => handleTimeComponentChange(timeHour, minute)}
                                                className={cn(
                                                    'w-full px-3 py-2 text-sm hover:bg-accent transition-colors text-center',
                                                    timeMinute === minute && 'bg-primary text-primary-foreground font-semibold'
                                                )}
                                            >
                                                {minute}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {error && (
                    <small role="alert" className="mt-1.5 text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1">
                        {error}
                    </small>
                )}
            </div>
            );
        };

        const animationProps = (animationEntrance || animationOut) ? {
            initial: { opacity: 0, y: animationEntrance ? 10 : 0, scale: 0.98 },
            animate: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, scale: 0.98 },
            transition: { duration: 0.2, ease: "easeOut" as const }
        } : {};

        const inputResult = label ? renderInputWithLabel() : renderInputWithoutLabel();

        if (animationEntrance || animationOut) {
            return (
                <motion.div {...animationProps}>
                    {inputResult}
                </motion.div>
            );
        }

        return inputResult;
    }
);

Input.displayName = 'Input';

export { Input, inputVariants };


