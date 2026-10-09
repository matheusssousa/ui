'use client';

import { cn } from '../utils.js';
import { formatCurrency } from '../functions/formatCurrency.js';
import { Card } from './card.js';
import { Skeleton } from './skeleton.js';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic.js';

const TrendUpIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(m => m.TrendUpIcon), { ssr: false });
const TrendDownIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(m => m.TrendDownIcon), { ssr: false });

export interface KpiCardProps {
    title: string;
    value: number;
    change?: number;
    icon: React.ComponentType<any>;
    format?: 'currency' | 'number';
    loading?: boolean;
    showChange?: boolean;
    className?: string;
}

export function KpiCard({
    title,
    value,
    change = 0,
    icon: Icon,
    format: formatType = 'currency',
    loading = false,
    showChange = false,
    className,
}: KpiCardProps) {
    const isPositive = change >= 0;

    if (loading) {
        return (
            <Card variant="minimal" size="sm" className={cn("gap-3", className)}>
                <div className="flex items-center justify-between">
                    <Skeleton width="60%" height={14} />
                    <Skeleton width={32} height={32} rounded="lg" />
                </div>
                <Skeleton width="50%" height={28} />
                {showChange && <Skeleton width="40%" height={14} />}
            </Card>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card variant="minimal" size="sm" className={cn("gap-3 h-full", className)}>
                <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground font-medium truncate pr-2">{title}</span>
                    <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                        <Icon className="w-4 h-4 text-primary" weight="bold" />
                    </div>
                </div>

                <p className="text-lg sm:text-2xl font-bold text-foreground truncate">
                    {formatType === 'currency' ? formatCurrency(value) : value.toLocaleString('pt-BR')}
                </p>

                {showChange && (
                    <div className="flex items-center gap-1 flex-wrap">
                        {isPositive ? (
                            <TrendUpIcon className="w-3.5 h-3.5 text-success flex-shrink-0" />
                        ) : (
                            <TrendDownIcon className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                        )}
                        <span className={cn('text-xs font-medium', isPositive ? 'text-success' : 'text-destructive')}>
                            {isPositive ? '+' : ''}{change.toFixed(1)}%
                        </span>
                        <span className="text-xs text-muted-foreground hidden sm:inline">vs anterior</span>
                    </div>
                )}
            </Card>
        </motion.div>
    );
}

export default KpiCard;



