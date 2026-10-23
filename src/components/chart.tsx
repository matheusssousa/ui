'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../utils.js';

const chartVariants = cva('relative flex w-full min-w-0 flex-col gap-3 rounded-xl border border-border bg-background p-4 text-foreground', {
    variants: {
        variant: { default: '', outlined: 'border-2 border-input', filled: 'bg-muted', minimal: 'border-0 bg-transparent p-0', elevated: 'bg-card shadow-md', soft: 'border-transparent bg-muted/40' },
        size: { sm: 'h-48', md: 'h-64', lg: 'h-80', xl: 'h-96' },
    },
    defaultVariants: { variant: 'default', size: 'md' },
});

export const chartPalettes = {
    default: ['var(--chart-1, #8b7cf8)', 'var(--chart-2, #2dd4bf)', 'var(--chart-3, #fbbf24)', 'var(--chart-4, #60a5fa)', 'var(--chart-5, #f472b6)', 'var(--chart-6, #fb923c)', 'var(--chart-7, #a3e635)', 'var(--chart-8, #22d3ee)'],
    ocean: ['#38bdf8', '#2dd4bf', '#818cf8', '#06b6d4', '#a5b4fc'],
    sunset: ['#fb7185', '#fb923c', '#fbbf24', '#c084fc', '#f472b6'],
} as const;

export type ChartDataPoint = { label: string; value: number; color?: string };
export interface ChartTooltipContext { data: ChartDataPoint; index: number; color: string; percentage: number; }
/** Opções comuns; valores não finitos são ignorados. */
export interface BaseChartProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>, VariantProps<typeof chartVariants> {
    data: ChartDataPoint[];
    title?: string;
    subtitle?: string;
    showLegend?: boolean;
    showGrid?: boolean;
    showValues?: boolean;
    animate?: boolean;
    colors?: readonly string[];
    /** Cor CSS única; aceita também tokens como primary, secondary e success. */
    color?: string;
    palette?: keyof typeof chartPalettes;
    showTooltip?: boolean;
    legendPosition?: 'top' | 'bottom' | 'right';
    valueFormatter?: (value: number) => string;
    labelFormatter?: (label: string) => string;
    emptyMessage?: string;
    renderTooltip?: (context: ChartTooltipContext) => React.ReactNode;
    onDataPointClick?: (point: ChartDataPoint, index: number) => void;
}
const numberFormat = (value: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 6 }).format(value);
const percentFormat = (value: number) => `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value)}%`;
const semanticColors = new Set(['primary', 'secondary', 'tertiary', 'success', 'warning', 'info', 'destructive', 'muted']);
function resolveColor(value: string) { return semanticColors.has(value) ? `var(--${value})` : value; }

type Plot = {
    width: number; height: number; active: number | null; animate: boolean;
    data: ChartDataPoint[]; color: (index: number) => string; format: (value: number) => string;
    label: (value: string) => string; id: string;
    bind: (index: number) => Omit<React.SVGProps<SVGElement>, 'ref'>;
};
interface FrameProps extends Omit<BaseChartProps, 'children'> {
    chartRef: React.ForwardedRef<HTMLDivElement>;
    positive?: boolean; singleColor?: boolean;
    children: (plot: Plot) => React.ReactNode;
}
function ChartFrame({ chartRef, children, data: input, positive, singleColor, title, subtitle, className, variant, size,
    showLegend = false, showGrid: _grid, showValues: _values, animate = true, colors, color, palette = 'default',
    showTooltip = true, legendPosition = 'bottom', valueFormatter = numberFormat, labelFormatter = (v) => v,
    emptyMessage = 'Sem dados disponíveis', renderTooltip, onDataPointClick, ...props }: FrameProps) {
    const plotRef = React.useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = React.useState({ width: 480, height: 200 });
    const [active, setActive] = React.useState<number | null>(null);
    const id = React.useId().replace(/:/g, '');
    const reducedMotion = useReducedMotion();
    const entries = input.map((point, index) => ({ point, index })).filter(({ point }) => Number.isFinite(point.value) && (!positive || point.value > 0));
    const data = entries.map(({ point }) => point);
    const selected = active !== null ? data[active] : undefined;
    const total = data.reduce((sum, point) => sum + Math.abs(point.value), 0);
    const colorsUsed = colors?.length ? colors : chartPalettes[palette];
    const getColor = (i: number) => resolveColor(data[i]?.color || color || colorsUsed[singleColor ? 0 : i % colorsUsed.length]);
    React.useEffect(() => {
        const element = plotRef.current;
        if (!element) return;
        const measure = () => {
            const rect = element.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) setDimensions({ width: rect.width, height: rect.height });
        };
        measure();
        if (typeof ResizeObserver === 'undefined') {
            window.addEventListener('resize', measure);
            return () => window.removeEventListener('resize', measure);
        }
        const observer = new ResizeObserver(measure);
        observer.observe(element);
        return () => observer.disconnect();
    }, []);
    React.useEffect(() => { setActive(null); }, [input]);
    const activate = (index: number) => setActive(index);
    const click = (index: number) => { activate(index); onDataPointClick?.(data[index], entries[index].index); };
    const bind = (index: number): Omit<React.SVGProps<SVGElement>, 'ref'> => ({
        tabIndex: 0, role: onDataPointClick ? 'button' : 'img',
        'aria-label': `${labelFormatter(data[index].label)}: ${valueFormatter(data[index].value)}`,
        'aria-describedby': showTooltip && active === index ? `${id}-tooltip` : undefined,
        onPointerEnter: () => activate(index), onPointerLeave: () => setActive(null),
        onFocus: () => activate(index), onBlur: () => setActive(null), onClick: () => click(index),
        onKeyDown: (event) => {
            if (event.key === 'Escape') setActive(null);
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); click(index); }
        },
        style: { outline: 'none', cursor: onDataPointClick ? 'pointer' : 'default' },
    });
    const legend = showLegend && data.length > 0 && <div className={cn('flex shrink-0 flex-wrap justify-center gap-x-4 gap-y-2 overflow-auto text-xs', legendPosition === 'right' ? 'max-h-full w-32 flex-col justify-start' : 'max-h-20')} aria-label="Legenda">
        {data.map((point, index) => <button key={index} type="button" className="flex min-w-0 items-center gap-2 rounded text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring" onPointerEnter={() => activate(index)} onPointerLeave={() => setActive(null)} onFocus={() => activate(index)} onBlur={() => setActive(null)} onClick={() => click(index)} onKeyDown={(event) => { if (event.key === 'Escape') setActive(null); }}>
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: getColor(index), opacity: active !== null && active !== index ? 0.35 : 1 }} />
            <span className="truncate" title={point.label}>{labelFormatter(point.label)}</span>
        </button>)}
    </div>;
    return <div ref={chartRef} className={cn(chartVariants({ variant, size }), className)} {...props}>
        {(title || subtitle) && <div className="shrink-0">{title && <h3 className="text-sm font-semibold">{title}</h3>}{subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}</div>}
        {legendPosition === 'top' && legend}
        <div className="flex min-h-0 flex-1 gap-4">
            <div ref={plotRef} className="relative min-h-0 min-w-0 flex-1">
                {data.length === 0 ? <div role="status" className="flex h-full items-center justify-center text-sm text-muted-foreground">{emptyMessage}</div> : <svg width="100%" height="100%" viewBox={`0 0 ${dimensions.width} ${dimensions.height}`} role="group" aria-label={title || 'Gráfico'} className="block overflow-visible">
                    {children({ ...dimensions, data, active: selected ? active : null, color: getColor, bind, format: valueFormatter, label: labelFormatter, id, animate: animate && !reducedMotion })}
                </svg>}
                {showTooltip && selected && active !== null && <div id={`${id}-tooltip`} role="tooltip" className="pointer-events-none absolute top-2 z-10 max-w-full rounded-lg border border-border bg-background px-3 py-2 text-xs shadow-lg" style={{ [active < data.length / 2 ? 'right' : 'left']: 8 }}>
                    {renderTooltip ? renderTooltip({ data: selected, index: entries[active].index, color: getColor(active), percentage: total ? Math.abs(selected.value) / total * 100 : 0 }) : <><div className="flex items-center gap-2 text-muted-foreground"><span className="h-2 w-2 rounded-full" style={{ background: getColor(active) }} />{labelFormatter(selected.label)}</div><div className="mt-1 font-semibold tabular-nums">{valueFormatter(selected.value)}{positive && <span className="ml-2 font-normal text-muted-foreground">{percentFormat(selected.value / total * 100)}</span>}</div></>}
                </div>}
            </div>
            {legendPosition === 'right' && legend}
        </div>
        {legendPosition === 'bottom' && legend}
    </div>;
}

function scale(data: ChartDataPoint[]) {
    let min = Math.min(0, ...data.map(p => p.value));
    let max = Math.max(0, ...data.map(p => p.value));
    if (min === max) max = min + 1;
    const raw = (max - min) / 4;
    const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
    const fraction = raw / magnitude;
    const step = (fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10) * magnitude;
    min = Math.floor(min / step) * step;
    max = Math.ceil(max / step) * step;
    const ticks = Array.from({ length: Math.round((max - min) / step) + 1 }, (_, i) => Number((min + step * i).toPrecision(12)));
    return { min, max, ticks };
}
function bounds(plot: Plot, horizontal = false, compact = false) {
    const domain = scale(plot.data);
    const longest = Math.max(...(horizontal ? plot.data.map(p => plot.label(p.label).length) : domain.ticks.map(v => plot.format(v).length)));
    const left = compact ? 5 : Math.min(plot.width * 0.3, Math.max(32, longest * 6.5 + 12));
    const top = compact ? 6 : 22;
    const width = Math.max(1, plot.width - left - (compact ? 5 : 24));
    const height = Math.max(1, plot.height - top - (compact ? 6 : 28));
    return { ...domain, left, top, width, height, x: (v: number) => left + (v - domain.min) / (domain.max - domain.min) * width, y: (v: number) => top + height - (v - domain.min) / (domain.max - domain.min) * height };
}
function Axes({ plot, horizontal = false, grid = true }: { plot: Plot; horizontal?: boolean; grid?: boolean }) {
    const b = bounds(plot, horizontal);
    return <g aria-hidden="true">{b.ticks.map(value => <g key={value}>
        {grid && <line x1={horizontal ? b.x(value) : b.left} x2={horizontal ? b.x(value) : b.left + b.width} y1={horizontal ? b.top : b.y(value)} y2={horizontal ? b.top + b.height : b.y(value)} stroke="currentColor" opacity={value === 0 ? 0.22 : 0.1} strokeDasharray={value === 0 ? undefined : '3 4'} />}
        <text x={horizontal ? b.x(value) : b.left - 8} y={horizontal ? b.top + b.height + 18 : b.y(value)} textAnchor={horizontal ? 'middle' : 'end'} dominantBaseline="middle" className="fill-muted-foreground" fontSize="11">{plot.format(value)}</text>
    </g>)}</g>;
}
function linePath(points: { x: number; y: number }[], curve: 'linear' | 'smooth' | 'step') {
    return points.map((p, i) => {
        if (!i) return `M ${p.x},${p.y}`;
        const previous = points[i - 1];
        const middle = (previous.x + p.x) / 2;
        return curve === 'step' ? `H ${middle} V ${p.y} H ${p.x}` : curve === 'smooth' ? `C ${middle},${previous.y} ${middle},${p.y} ${p.x},${p.y}` : `L ${p.x},${p.y}`;
    }).join(' ');
}
export interface LineChartProps extends BaseChartProps {
    smooth?: boolean;
    curve?: 'linear' | 'smooth' | 'step';
    strokeWidth?: number;
    showDots?: boolean;
    fillArea?: boolean;
    fillOpacity?: number;
    gradient?: boolean;
    /** Oculta eixos e usa toda a área para tendências compactas. */
    compact?: boolean;
}
export const LineChart = React.forwardRef<HTMLDivElement, LineChartProps>(({ smooth = false, curve, strokeWidth = 2.5, showDots = true, fillArea = false, fillOpacity = 0.25, gradient = true, compact = false, ...props }, ref) => <ChartFrame {...props} chartRef={ref} singleColor>{plot => {
    const b = bounds(plot, false, compact);
    const points = plot.data.map((p, i) => ({ x: b.left + (plot.data.length === 1 ? b.width / 2 : b.width * i / (plot.data.length - 1)), y: b.y(p.value) }));
    const path = linePath(points, curve || (smooth ? 'smooth' : 'linear'));
    const interval = Math.max(1, Math.ceil(points.length / Math.max(1, Math.floor(b.width / 65))));
    return <>
        {!compact && <Axes plot={plot} grid={props.showGrid !== false} />}
        <defs><linearGradient id={`${plot.id}-area`} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={plot.color(0)} stopOpacity={fillOpacity} /><stop offset="100%" stopColor={plot.color(0)} stopOpacity="0.02" /></linearGradient></defs>
        {fillArea && <path d={`${path} L ${points[points.length - 1].x},${b.y(0)} L ${points[0].x},${b.y(0)} Z`} fill={gradient ? `url(#${plot.id}-area)` : plot.color(0)} fillOpacity={gradient ? 1 : fillOpacity} />}
        <motion.path d={path} fill="none" stroke={plot.color(0)} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" initial={plot.animate ? { pathLength: 0 } : false} animate={{ pathLength: 1 }} transition={{ duration: plot.animate ? 0.6 : 0 }} />
        {points.map((point, i) => <g key={i}>
            {!compact && i % interval === 0 && <text x={point.x} y={b.top + b.height + 20} textAnchor="middle" fontSize="11" className="fill-muted-foreground">{plot.label(plot.data[i].label).slice(0, 14)}</text>}
            {plot.active === i && <line x1={point.x} x2={point.x} y1={b.top} y2={b.top + b.height} stroke={plot.color(i)} strokeDasharray="3 4" opacity="0.4" />}
            {(showDots || points.length === 1 || plot.active === i) && <circle cx={point.x} cy={point.y} r={plot.active === i ? 5 : 3.5} fill={plot.data[i].color || plot.color(0)} stroke="var(--background, #fff)" strokeWidth="2" />}
            {props.showValues && <text x={point.x} y={point.y - 10} textAnchor="middle" fontSize="11" fill="currentColor">{plot.format(plot.data[i].value)}</text>}
            <rect {...plot.bind(i) as React.SVGProps<SVGRectElement>} x={i === 0 ? b.left - 5 : (points[i - 1].x + point.x) / 2} y={b.top - 6} width={points.length === 1 ? b.width + 10 : b.width / (points.length - 1) / (i === 0 || i === points.length - 1 ? 2 : 1) + 5} height={b.height + 12} fill="transparent" />
        </g>)}
    </>;
}}</ChartFrame>);
LineChart.displayName = 'LineChart';
export interface AreaChartProps extends LineChartProps {}
export const AreaChart = React.forwardRef<HTMLDivElement, AreaChartProps>((props, ref) => <LineChart smooth showDots={false} {...props} ref={ref} fillArea />);
AreaChart.displayName = 'AreaChart';
export const SparklineChart = React.forwardRef<HTMLDivElement, LineChartProps>((props, ref) => <LineChart variant="minimal" showDots={false} {...props} ref={ref} compact />);
SparklineChart.displayName = 'SparklineChart';

export interface BarChartProps extends BaseChartProps { horizontal?: boolean; barRadius?: number; barGap?: number; }
export const BarChart = React.forwardRef<HTMLDivElement, BarChartProps>(({ horizontal = false, barRadius = 5, barGap = 0.3, ...props }, ref) => <ChartFrame {...props} chartRef={ref}>{plot => {
    const b = bounds(plot, horizontal);
    const slot = (horizontal ? b.height : b.width) / plot.data.length;
    const thickness = slot * (1 - Math.min(0.9, Math.max(0, barGap)));
    const interval = Math.max(1, Math.ceil(plot.data.length / Math.max(1, Math.floor((horizontal ? b.height : b.width) / (horizontal ? 24 : 60)))));
    return <><Axes plot={plot} horizontal={horizontal} grid={props.showGrid !== false} />{plot.data.map((point, i) => {
        const position = (horizontal ? b.top : b.left) + slot * i + (slot - thickness) / 2;
        const x = horizontal ? Math.min(b.x(0), b.x(point.value)) : position;
        const y = horizontal ? position : Math.min(b.y(0), b.y(point.value));
        const width = horizontal ? Math.abs(b.x(point.value) - b.x(0)) : thickness;
        const height = horizontal ? thickness : Math.abs(b.y(point.value) - b.y(0));
        return <g key={i}>
            <g {...plot.bind(i)}><motion.rect x={x} y={y} width={width} height={height} rx={Math.min(barRadius, thickness / 2)} fill={plot.color(i)} initial={plot.animate ? { opacity: 0 } : false} animate={{ opacity: plot.active !== null && plot.active !== i ? 0.4 : 1 }} transition={{ duration: plot.animate ? 0.25 : 0 }} />
                <rect x={x} y={y} width={Math.max(width, 8)} height={Math.max(height, 8)} fill="transparent" />
            </g>
            {i % interval === 0 && <text x={horizontal ? b.left - 8 : position + thickness / 2} y={horizontal ? position + thickness / 2 : b.top + b.height + 20} dominantBaseline="middle" textAnchor={horizontal ? 'end' : 'middle'} fontSize="11" className="fill-muted-foreground">{plot.label(point.label).slice(0, horizontal ? Math.max(3, Math.floor((b.left - 12) / 6.5)) : 12)}</text>}
            {props.showValues && <text x={horizontal ? b.x(point.value) + (point.value < 0 ? 6 : -6) : position + thickness / 2} y={horizontal ? position + thickness / 2 : point.value < 0 ? b.y(point.value) - 6 : b.y(point.value) - 8} dominantBaseline="middle" textAnchor={horizontal ? point.value < 0 ? 'start' : 'end' : 'middle'} fontSize="11" fill="currentColor">{plot.format(point.value)}</text>}
        </g>;
    })}</>;
}}</ChartFrame>);
BarChart.displayName = 'BarChart';

function polar(cx: number, cy: number, radius: number, angle: number) { return { x: cx + radius * Math.cos(angle * Math.PI / 180), y: cy + radius * Math.sin(angle * Math.PI / 180) }; }
function arc(cx: number, cy: number, radius: number, inner: number, start: number, end: number): string {
    const point = (r: number, a: number) => { const p = polar(cx, cy, r, a); return `${p.x},${p.y}`; };
    if (end - start >= 359.999) {
        return `M ${point(radius, start)} A ${radius},${radius} 0 1 1 ${point(radius, start + 180)} A ${radius},${radius} 0 1 1 ${point(radius, start + 360)} Z` + (inner > 0 ? ` M ${point(inner, start)} A ${inner},${inner} 0 1 0 ${point(inner, start + 180)} A ${inner},${inner} 0 1 0 ${point(inner, start + 360)} Z` : '');
    }
    const large = end - start > 180 ? 1 : 0;
    return `M ${point(radius, start)} A ${radius},${radius} 0 ${large} 1 ${point(radius, end)} ` + (inner > 0 ? `L ${point(inner, end)} A ${inner},${inner} 0 ${large} 0 ${point(inner, start)} Z` : `L ${cx},${cy} Z`);
}
export interface PieChartProps extends BaseChartProps {
    donut?: boolean;
    donutWidth?: number;
    showPercentage?: boolean;
    showCenter?: boolean;
    centerLabel?: string;
    centerValue?: React.ReactNode;
    /** Conteúdo customizado substitui todo o centro padrão. */
    centerContent?: React.ReactNode;
    activeCenter?: boolean;
    startAngle?: number;
    padAngle?: number;
}
export const PieChart = React.forwardRef<HTMLDivElement, PieChartProps>(({ donut = false, donutWidth, showPercentage = true, showCenter = true, centerLabel = 'Total', centerValue, centerContent, activeCenter = true, startAngle = -90, padAngle = 2, ...props }, ref) => <ChartFrame showLegend {...props} chartRef={ref} positive>{plot => {
    const cx = plot.width / 2, cy = plot.height / 2;
    const radius = Math.max(1, Math.min(plot.width, plot.height) / 2 - 10);
    const inner = donut ? Math.max(radius * 0.3, radius - (donutWidth ?? radius * 0.3)) : 0;
    const total = plot.data.reduce((sum, p) => sum + p.value, 0);
    let angle = startAngle;
    const current = activeCenter && plot.active !== null ? plot.data[plot.active] : undefined;
    return <>
        {plot.data.map((point, i) => {
            const sweep = point.value / total * 360;
            const gap = plot.data.length === 1 ? 0 : Math.min(Math.max(0, padAngle), sweep / 3);
            const start = angle + gap / 2, end = angle + sweep - gap / 2;
            angle += sweep;
            const label = polar(cx, cy, inner + (radius - inner) * 0.55, (start + end) / 2);
            const active = plot.active === i;
            return <g key={i}>
                <g {...plot.bind(i)}><motion.path d={arc(cx, cy, radius + (active ? 4 : 0), inner, start, end)} fill={plot.color(i)} fillRule="evenodd" initial={plot.animate ? { opacity: 0 } : false} animate={{ opacity: plot.active !== null && !active ? 0.45 : 1 }} transition={{ duration: plot.animate ? 0.2 : 0 }} /></g>
                {props.showValues && sweep >= 24 && <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" fill="var(--background, #fff)" stroke="var(--foreground, #111)" strokeWidth="2" paintOrder="stroke" fontSize="11" fontWeight="600" pointerEvents="none">{showPercentage ? percentFormat(point.value / total * 100) : plot.format(point.value)}</text>}
            </g>;
        })}
        {donut && showCenter && inner >= 20 && <foreignObject x={cx - inner * 0.82} y={cy - inner * 0.65} width={inner * 1.64} height={inner * 1.3} pointerEvents="none"><div className="flex h-full min-w-0 flex-col items-center justify-center gap-1 overflow-hidden text-center">
            {centerContent !== undefined ? centerContent : <><span className="w-full truncate text-muted-foreground" style={{ fontSize: Math.max(9, Math.min(12, inner / 4)) }}>{current ? plot.label(current.label) : centerLabel}</span><span className="w-full truncate font-semibold tabular-nums" style={{ fontSize: Math.max(11, Math.min(26, inner * 1.4 / Math.max(3, String(current ? plot.format(current.value) : centerValue ?? plot.format(total)).length) * 1.6)) }}>{current ? plot.format(current.value) : centerValue ?? plot.format(total)}</span></>}
        </div></foreignObject>}
    </>;
}}</ChartFrame>);
PieChart.displayName = 'PieChart';
export const DonutChart = React.forwardRef<HTMLDivElement, PieChartProps>((props, ref) => <PieChart {...props} ref={ref} donut />);
DonutChart.displayName = 'DonutChart';

export interface RadarChartProps extends BaseChartProps { maxValue?: number; fillOpacity?: number; }
export const RadarChart = React.forwardRef<HTMLDivElement, RadarChartProps>(({ maxValue, fillOpacity = 0.2, ...props }, ref) => <ChartFrame {...props} chartRef={ref}>{plot => {
    const radius = Math.max(1, Math.min(plot.width / 2 - 55, plot.height / 2 - 25));
    const cx = plot.width / 2, cy = plot.height / 2;
    const max = Math.max(1, maxValue ?? Math.max(...plot.data.map(p => p.value)));
    const position = (i: number, r: number) => polar(cx, cy, r, -90 + i * 360 / plot.data.length);
    const polygon = (ratio: number) => plot.data.map((_, i) => { const p = position(i, radius * ratio); return `${p.x},${p.y}`; }).join(' ');
    const points = plot.data.map((p, i) => position(i, radius * Math.max(0, Math.min(1, p.value / max))));
    return <>
        {props.showGrid !== false && [0.25, 0.5, 0.75, 1].map(ratio => <polygon key={ratio} points={polygon(ratio)} fill="none" stroke="currentColor" opacity="0.12" />)}
        {plot.data.map((p, i) => { const end = position(i, radius), label = position(i, radius + 14); return <g key={i}><line x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="currentColor" opacity="0.1" /><text x={label.x} y={label.y} textAnchor={Math.abs(label.x - cx) < 1 ? 'middle' : label.x > cx ? 'start' : 'end'} dominantBaseline="middle" fontSize="11" className="fill-muted-foreground">{plot.label(p.label).slice(0, 10)}</text></g>; })}
        <polygon points={points.map(p => `${p.x},${p.y}`).join(' ')} fill={plot.color(0)} fillOpacity={fillOpacity} stroke={plot.color(0)} strokeWidth="2" />
        {points.map((p, i) => <g key={i} {...plot.bind(i)}><circle cx={p.x} cy={p.y} r={plot.active === i ? 6 : 4} fill={plot.color(i)} /><circle cx={p.x} cy={p.y} r="12" fill="transparent" />{props.showValues && <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="11" fill="currentColor">{plot.format(plot.data[i].value)}</text>}</g>)}
    </>;
}}</ChartFrame>);
RadarChart.displayName = 'RadarChart';

export interface RadialBarChartProps extends BaseChartProps { maxValue?: number; trackWidth?: number; }
/** Anéis concêntricos de progresso; valores negativos são ignorados. */
export const RadialBarChart = React.forwardRef<HTMLDivElement, RadialBarChartProps>(({ maxValue, trackWidth = 14, ...props }, ref) => <ChartFrame showLegend {...props} chartRef={ref} positive>{plot => {
    const radius = Math.max(1, Math.min(plot.width, plot.height) / 2 - 10);
    const step = radius * 0.8 / plot.data.length;
    const thickness = Math.max(0.5, Math.min(trackWidth, step * 0.7));
    const max = Math.max(1, maxValue ?? Math.max(...plot.data.map(p => p.value)));
    return <>{plot.data.map((p, i) => {
        const outer = radius - i * step, inner = Math.max(0, outer - thickness);
        return <g key={i} {...plot.bind(i)}><path d={arc(plot.width / 2, plot.height / 2, outer, inner, -90, 270)} fill="currentColor" opacity="0.08" /><path d={arc(plot.width / 2, plot.height / 2, outer, inner, -90, -90 + Math.min(1, p.value / max) * 360)} fill={plot.color(i)} opacity={plot.active !== null && plot.active !== i ? 0.4 : 1} /></g>;
    })}</>;
}}</ChartFrame>);
RadialBarChart.displayName = 'RadialBarChart';


