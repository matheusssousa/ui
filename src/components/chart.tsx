'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils.js';
import { motion } from 'framer-motion';

const chartVariants = cva(
    'w-full rounded-lg border border-border bg-background p-4 relative',
    {
        variants: {
            variant: {
                default: '',
                outlined: 'border-2 border-input',
                filled: 'bg-muted',
                minimal: 'border-none p-0',
            },
            size: {
                sm: 'h-48',
                md: 'h-64',
                lg: 'h-80',
                xl: 'h-96',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
        },
    }
);

export type ChartDataPoint = {
    label: string;
    value: number;
    color?: string;
};

/** Configuração compartilhada pelos gráficos. */
export interface BaseChartProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chartVariants> {
    /** Pontos exibidos no gráfico. */
    data: ChartDataPoint[];
    /** Título acima do gráfico. */
    title?: string;
    /** Texto auxiliar abaixo do título. */
    subtitle?: string;
    /** Exibe a legenda. */
    showLegend?: boolean;
    /** Exibe linhas de grade. */
    showGrid?: boolean;
    /** Exibe valores dos pontos. */
    showValues?: boolean;
    /** Anima a apresentação dos dados. */
    animate?: boolean;
    /** Cores CSS usadas nas séries; padrão usa os tokens `--chart-*`. */
    colors?: string[];
}

// Cores padrão para os gráficos
const defaultColors = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
    'var(--chart-6)',
    'var(--chart-7)',
    'var(--chart-8)',
];

// Componente de legenda
const Legend: React.FC<{
    data: ChartDataPoint[];
    colors: string[];
    className?: string;
}> = ({ data, colors, className }) => {
    return (
        <div className={cn('flex flex-wrap gap-3 justify-center', className)}>
            {data.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                    <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: item.color || colors[index % colors.length] }}
                    />
                    <span className="text-xs text-foreground">
                        {item.label}
                    </span>
                </div>
            ))}
        </div>
    );
};

// Componente de título e subtítulo
const ChartHeader: React.FC<{
    title?: string;
    subtitle?: string;
}> = ({ title, subtitle }) => {
    if (!title && !subtitle) return null;

    return (
        <div className="mb-4">
            {title && (
                <h3 className="text-lg font-semibold text-foreground">
                    {title}
                </h3>
            )}
            {subtitle && (
                <p className="text-sm text-muted-foreground mt-1">
                    {subtitle}
                </p>
            )}
        </div>
    );
};

// ======================
// LINE CHART
// ======================
/** Opções específicas do gráfico de linha. */
export interface LineChartProps extends BaseChartProps {
    /** Suaviza a curva. */
    smooth?: boolean;
    /** Espessura da linha em pixels. */
    strokeWidth?: number;
    /** Exibe marcadores dos pontos. */
    showDots?: boolean;
    /** Preenche a área abaixo da linha. */
    fillArea?: boolean;
}

export const LineChart = React.forwardRef<HTMLDivElement, LineChartProps>(
    (
        {
            className,
            variant,
            size,
            data,
            title,
            subtitle,
            showLegend = false,
            showGrid = true,
            showValues = false,
            animate = true,
            colors = defaultColors,
            smooth = false,
            strokeWidth = 2,
            showDots = true,
            fillArea = false,
            ...props
        },
        ref
    ) => {
        const svgRef = React.useRef<SVGSVGElement>(null);
        const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

        React.useEffect(() => {
            if (svgRef.current) {
                const { width, height } = svgRef.current.getBoundingClientRect();
                setDimensions({ width, height });
            }
        }, []);

        if (data.length === 0) {
            return (
                <div ref={ref} className={cn(chartVariants({ variant, size }), className)} {...props}>
                    <ChartHeader title={title} subtitle={subtitle} />
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        Sem dados disponíveis
                    </div>
                </div>
            );
        }

        const padding = { top: 20, right: 20, bottom: 40, left: 50 };
        const chartWidth = dimensions.width - padding.left - padding.right;
        const chartHeight = dimensions.height - padding.top - padding.bottom;

        const maxValue = Math.max(...data.map((d) => d.value));
        const minValue = Math.min(...data.map((d) => d.value));
        const valueRange = maxValue - minValue || 1;

        const points = data.map((d, i) => ({
            x: padding.left + (chartWidth / (data.length - 1)) * i,
            y: padding.top + chartHeight - ((d.value - minValue) / valueRange) * chartHeight,
            value: d.value,
            label: d.label,
        }));

        const pathData = smooth
            ? generateSmoothPath(points)
            : generateLinearPath(points);

        const areaPathData = fillArea
            ? `${pathData} L ${points[points.length - 1].x},${padding.top + chartHeight} L ${points[0].x},${padding.top + chartHeight} Z`
            : '';

        return (
            <div ref={ref} className={cn(chartVariants({ variant, size }), className)} {...props}>
                <ChartHeader title={title} subtitle={subtitle} />
                <svg ref={svgRef} className="w-full h-full">
                    {/* Grid */}
                    {showGrid && (
                        <g className="opacity-20">
                            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                                <line
                                    key={i}
                                    x1={padding.left}
                                    y1={padding.top + chartHeight * ratio}
                                    x2={padding.left + chartWidth}
                                    y2={padding.top + chartHeight * ratio}
                                    stroke="currentColor"
                                    strokeWidth="1"
                                />
                            ))}
                        </g>
                    )}

                    {/* Y-axis labels */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                        const value = maxValue - valueRange * ratio;
                        return (
                            <text
                                key={i}
                                x={padding.left - 10}
                                y={padding.top + chartHeight * ratio}
                                textAnchor="end"
                                alignmentBaseline="middle"
                                className="text-xs fill-muted-foreground"
                            >
                                {value.toFixed(0)}
                            </text>
                        );
                    })}

                    {/* X-axis labels */}
                    {points.map((point, i) => (
                        <text
                            key={i}
                            x={point.x}
                            y={padding.top + chartHeight + 20}
                            textAnchor="middle"
                            className="text-xs fill-muted-foreground"
                        >
                            {data[i].label}
                        </text>
                    ))}

                    {/* Area fill */}
                    {fillArea && (
                        <motion.path
                            d={areaPathData}
                            fill={colors[0]}
                            fillOpacity="0.2"
                            initial={animate ? { opacity: 0 } : undefined}
                            animate={animate ? { opacity: 0.2 } : undefined}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        />
                    )}

                    {/* Line path */}
                    <motion.path
                        d={pathData}
                        fill="none"
                        stroke={colors[0]}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={animate ? { pathLength: 0 } : undefined}
                        animate={animate ? { pathLength: 1 } : undefined}
                        transition={{ duration: 1, ease: 'easeInOut' }}
                    />

                    {/* Dots */}
                    {showDots &&
                        points.map((point, i) => (
                            <motion.g key={i}>
                                <motion.circle
                                    cx={point.x}
                                    cy={point.y}
                                    r="4"
                                    fill={colors[0]}
                                    stroke="white"
                                    strokeWidth="2"
                                    initial={animate ? { scale: 0 } : undefined}
                                    animate={animate ? { scale: 1 } : undefined}
                                    transition={{ duration: 0.3, delay: i * 0.1 }}
                                    className="cursor-pointer hover:r-6"
                                />
                                {showValues && (
                                    <motion.text
                                        x={point.x}
                                        y={point.y - 10}
                                        textAnchor="middle"
                                        className="text-xs fill-foreground font-medium"
                                        initial={animate ? { opacity: 0, y: point.y } : undefined}
                                        animate={animate ? { opacity: 1, y: point.y - 10 } : undefined}
                                        transition={{ duration: 0.3, delay: i * 0.1 + 0.5 }}
                                    >
                                        {point.value}
                                    </motion.text>
                                )}
                            </motion.g>
                        ))}
                </svg>
                {showLegend && <Legend data={data} colors={colors} />}
            </div>
        );
    }
);

LineChart.displayName = 'LineChart';

// ======================
// BAR CHART
// ======================
/** Opções específicas do gráfico de barras. */
export interface BarChartProps extends BaseChartProps {
    /** Desenha as barras na horizontal. */
    horizontal?: boolean;
    /** Raio dos cantos das barras em pixels. */
    barRadius?: number;
}

export const BarChart = React.forwardRef<HTMLDivElement, BarChartProps>(
    (
        {
            className,
            variant,
            size,
            data,
            title,
            subtitle,
            showLegend = false,
            showGrid = true,
            showValues = false,
            animate = true,
            colors = defaultColors,
            horizontal = false,
            barRadius = 4,
            ...props
        },
        ref
    ) => {
        const svgRef = React.useRef<SVGSVGElement>(null);
        const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

        React.useEffect(() => {
            if (svgRef.current) {
                const { width, height } = svgRef.current.getBoundingClientRect();
                setDimensions({ width, height });
            }
        }, []);

        if (data.length === 0) {
            return (
                <div ref={ref} className={cn(chartVariants({ variant, size }), className)} {...props}>
                    <ChartHeader title={title} subtitle={subtitle} />
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        Sem dados disponíveis
                    </div>
                </div>
            );
        }

        const padding = { top: 20, right: 20, bottom: 40, left: 50 };
        const chartWidth = dimensions.width - padding.left - padding.right;
        const chartHeight = dimensions.height - padding.top - padding.bottom;

        const maxValue = Math.max(...data.map((d) => d.value));
        const barWidth = chartWidth / data.length * 0.7;
        const barGap = chartWidth / data.length * 0.3;

        return (
            <div ref={ref} className={cn(chartVariants({ variant, size }), className)} {...props}>
                <ChartHeader title={title} subtitle={subtitle} />
                <svg ref={svgRef} className="w-full h-full">
                    {/* Grid */}
                    {showGrid && (
                        <g className="opacity-20">
                            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                                <line
                                    key={i}
                                    x1={padding.left}
                                    y1={padding.top + chartHeight * ratio}
                                    x2={padding.left + chartWidth}
                                    y2={padding.top + chartHeight * ratio}
                                    stroke="currentColor"
                                    strokeWidth="1"
                                />
                            ))}
                        </g>
                    )}

                    {/* Y-axis labels */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                        const value = maxValue - maxValue * ratio;
                        return (
                            <text
                                key={i}
                                x={padding.left - 10}
                                y={padding.top + chartHeight * ratio}
                                textAnchor="end"
                                alignmentBaseline="middle"
                                className="text-xs fill-muted-foreground"
                            >
                                {value.toFixed(0)}
                            </text>
                        );
                    })}

                    {/* Bars */}
                    {data.map((item, i) => {
                        const barHeight = (item.value / maxValue) * chartHeight;
                        const x = padding.left + (i * (barWidth + barGap)) + barGap / 2;
                        const y = padding.top + chartHeight - barHeight;
                        const color = item.color || colors[i % colors.length];

                        return (
                            <g key={i}>
                                <motion.rect
                                    x={x}
                                    y={y}
                                    width={barWidth}
                                    height={barHeight}
                                    fill={color}
                                    rx={barRadius}
                                    initial={animate ? { height: 0, y: padding.top + chartHeight } : undefined}
                                    animate={animate ? { height: barHeight, y } : undefined}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    className="cursor-pointer hover:opacity-80"
                                />
                                {showValues && (
                                    <motion.text
                                        x={x + barWidth / 2}
                                        y={y - 5}
                                        textAnchor="middle"
                                        className="text-xs fill-foreground font-medium"
                                        initial={animate ? { opacity: 0 } : undefined}
                                        animate={animate ? { opacity: 1 } : undefined}
                                        transition={{ duration: 0.3, delay: i * 0.1 + 0.5 }}
                                    >
                                        {item.value}
                                    </motion.text>
                                )}
                                {/* X-axis label */}
                                <text
                                    x={x + barWidth / 2}
                                    y={padding.top + chartHeight + 20}
                                    textAnchor="middle"
                                    className="text-xs fill-muted-foreground"
                                >
                                    {item.label}
                                </text>
                            </g>
                        );
                    })}
                </svg>
                {showLegend && <Legend data={data} colors={colors} />}
            </div>
        );
    }
);

BarChart.displayName = 'BarChart';

// ======================
// PIE CHART
// ======================
/** Opções específicas do gráfico de setores. */
export interface PieChartProps extends BaseChartProps {
    /** Abre um espaço no centro do gráfico. */
    donut?: boolean;
    /** Largura do anel quando `donut` está ativo. */
    donutWidth?: number;
    /** Exibe a porcentagem por setor. */
    showPercentage?: boolean;
}

export const PieChart = React.forwardRef<HTMLDivElement, PieChartProps>(
    (
        {
            className,
            variant,
            size,
            data,
            title,
            subtitle,
            showLegend = true,
            showValues = false,
            animate = true,
            colors = defaultColors,
            donut = false,
            donutWidth = 60,
            showPercentage = true,
            ...props
        },
        ref
    ) => {
        const svgRef = React.useRef<SVGSVGElement>(null);
        const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

        React.useEffect(() => {
            if (svgRef.current) {
                const { width, height } = svgRef.current.getBoundingClientRect();
                setDimensions({ width, height });
            }
        }, []);

        if (data.length === 0) {
            return (
                <div ref={ref} className={cn(chartVariants({ variant, size }), className)} {...props}>
                    <ChartHeader title={title} subtitle={subtitle} />
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        Sem dados disponíveis
                    </div>
                </div>
            );
        }

        const centerX = dimensions.width / 2;
        const centerY = dimensions.height / 2;
        const radius = Math.min(dimensions.width, dimensions.height) / 2 - 40;
        const innerRadius = donut ? radius - donutWidth : 0;

        const total = data.reduce((sum, item) => sum + item.value, 0);
        let currentAngle = -90;

        const slices = data.map((item, i) => {
            const angle = (item.value / total) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            currentAngle = endAngle;

            const color = item.color || colors[i % colors.length];
            const percentage = ((item.value / total) * 100).toFixed(1);

            return {
                ...item,
                color,
                percentage,
                startAngle,
                endAngle,
                angle,
            };
        });

        return (
            <div ref={ref} className={cn(chartVariants({ variant, size }), className)} {...props}>
                <ChartHeader title={title} subtitle={subtitle} />
                <svg ref={svgRef} className="w-full h-full">
                    <g>
                        {slices.map((slice, i) => {
                            const path = createArcPath(
                                centerX,
                                centerY,
                                radius,
                                innerRadius,
                                slice.startAngle,
                                slice.endAngle
                            );

                            // Posição do label
                            const labelAngle = (slice.startAngle + slice.endAngle) / 2;
                            const labelRadius = radius + 20;
                            const labelX = centerX + labelRadius * Math.cos((labelAngle * Math.PI) / 180);
                            const labelY = centerY + labelRadius * Math.sin((labelAngle * Math.PI) / 180);

                            return (
                                <g key={i}>
                                    <motion.path
                                        d={path}
                                        fill={slice.color}
                                        stroke="white"
                                        strokeWidth="2"
                                        initial={animate ? { opacity: 0, scale: 0 } : undefined}
                                        animate={animate ? { opacity: 1, scale: 1 } : undefined}
                                        transition={{ duration: 0.5, delay: i * 0.1 }}
                                        className="cursor-pointer hover:opacity-80"
                                        style={{ transformOrigin: `${centerX}px ${centerY}px` }}
                                    />
                                    {showValues && (
                                        <motion.text
                                            x={labelX}
                                            y={labelY}
                                            textAnchor="middle"
                                            alignmentBaseline="middle"
                                            className="text-xs fill-foreground font-medium"
                                            initial={animate ? { opacity: 0 } : undefined}
                                            animate={animate ? { opacity: 1 } : undefined}
                                            transition={{ duration: 0.3, delay: i * 0.1 + 0.5 }}
                                        >
                                            {showPercentage ? `${slice.percentage}%` : slice.value}
                                        </motion.text>
                                    )}
                                </g>
                            );
                        })}
                    </g>

                    {/* Center text for donut chart */}
                    {donut && (
                        <g>
                            <text
                                x={centerX}
                                y={centerY}
                                textAnchor="middle"
                                alignmentBaseline="middle"
                                className="text-2xl fill-foreground font-bold"
                            >
                                {total}
                            </text>
                            <text
                                x={centerX}
                                y={centerY + 20}
                                textAnchor="middle"
                                alignmentBaseline="middle"
                                className="text-xs fill-muted-foreground"
                            >
                                Total
                            </text>
                        </g>
                    )}
                </svg>
                {showLegend && <Legend data={data} colors={colors} />}
            </div>
        );
    }
);

PieChart.displayName = 'PieChart';

// ======================
// AREA CHART
// ======================
/** Opções específicas do gráfico de área. */
export interface AreaChartProps extends BaseChartProps {
    /** Suaviza a curva. */
    smooth?: boolean;
    /** Espessura da borda da área em pixels. */
    strokeWidth?: number;
    /** Opacidade do preenchimento, de 0 a 1. */
    fillOpacity?: number;
}

export const AreaChart = React.forwardRef<HTMLDivElement, AreaChartProps>(
    (
        {
            className,
            variant,
            size,
            data,
            title,
            subtitle,
            showLegend = false,
            showGrid = true,
            showValues = false,
            animate = true,
            colors = defaultColors,
            smooth = true,
            strokeWidth = 2,
            fillOpacity = 0.3,
            ...props
        },
        ref
    ) => {
        return (
            <LineChart
                ref={ref}
                className={className}
                variant={variant}
                size={size}
                data={data}
                title={title}
                subtitle={subtitle}
                showLegend={showLegend}
                showGrid={showGrid}
                showValues={showValues}
                animate={animate}
                colors={colors}
                smooth={smooth}
                strokeWidth={strokeWidth}
                fillArea={true}
                showDots={false}
                {...props}
            />
        );
    }
);

AreaChart.displayName = 'AreaChart';

// ======================
// DONUT CHART
// ======================
export const DonutChart = React.forwardRef<HTMLDivElement, PieChartProps>(
    (props, ref) => {
        return <PieChart ref={ref} {...props} donut={true} />;
    }
);

DonutChart.displayName = 'DonutChart';

// ======================
// HELPER FUNCTIONS
// ======================

function generateLinearPath(points: Array<{ x: number; y: number }>): string {
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
}

function generateSmoothPath(points: Array<{ x: number; y: number }>): string {
    if (points.length < 2) return '';

    let path = `M ${points[0].x},${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
        const current = points[i];
        const next = points[i + 1];

        const controlX = (current.x + next.x) / 2;

        path += ` Q ${controlX},${current.y} ${controlX},${(current.y + next.y) / 2}`;
        path += ` Q ${controlX},${next.y} ${next.x},${next.y}`;
    }

    return path;
}

function createArcPath(
    centerX: number,
    centerY: number,
    radius: number,
    innerRadius: number,
    startAngle: number,
    endAngle: number
): string {
    // Quando o arco cobre 360° (item único), o SVG não renderiza porque
    // ponto inicial e final coincidem. Usamos dois semi-arcos para resolver.
    const angleDiff = endAngle - startAngle;
    if (angleDiff >= 359.99) {
        const midAngle = startAngle + 180;
        const path1 = createArcPath(centerX, centerY, radius, innerRadius, startAngle, midAngle);
        const path2 = createArcPath(centerX, centerY, radius, innerRadius, midAngle, endAngle - 0.01);
        return path1 + ' ' + path2;
    }

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArcFlag = angleDiff > 180 ? 1 : 0;

    if (innerRadius === 0) {
        // Pie chart
        return `M ${centerX},${centerY} L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2} Z`;
    } else {
        // Donut chart
        const x3 = centerX + innerRadius * Math.cos(endRad);
        const y3 = centerY + innerRadius * Math.sin(endRad);
        const x4 = centerX + innerRadius * Math.cos(startRad);
        const y4 = centerY + innerRadius * Math.sin(startRad);

        return `M ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2} L ${x3},${y3} A ${innerRadius},${innerRadius} 0 ${largeArcFlag},0 ${x4},${y4} Z`;
    }
}


