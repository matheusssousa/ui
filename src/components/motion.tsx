'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps, type Transition, type Variants } from 'framer-motion';
import { cn } from '../utils.js';

export type MotionPreset = 'none' | 'fade' | 'fade-up' | 'fade-down' | 'scale' | 'slide-left' | 'slide-right' | 'pop';

export const fluidTransition: Transition = { duration: 0.24, ease: [0.22, 1, 0.36, 1] };
export const springTransition: Transition = { type: 'spring', stiffness: 420, damping: 30, mass: 0.8 };

export const motionPresets: Record<Exclude<MotionPreset, 'none'>, Variants> = {
  fade: { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } },
  'fade-up': { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 6 } },
  'fade-down': { hidden: { opacity: 0, y: -12 }, visible: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 } },
  scale: { hidden: { opacity: 0, scale: 0.96 }, visible: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.97 } },
  'slide-left': { hidden: { opacity: 0, x: 16 }, visible: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 8 } },
  'slide-right': { hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -8 } },
  pop: { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.92 } },
};

/** Contêiner com animação de entrada e interação opcionais. */
export interface MotionBoxProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  /** Animação pronta; `none` desativa a entrada. */
  preset?: MotionPreset;
  /** Atraso da animação em segundos. */
  delay?: number;
  /** Habilita movimentos sutis no hover e clique. */
  interactive?: boolean;
  /** Estados de animação personalizados, com prioridade sobre `preset`. */
  variants?: Variants;
}

export const MotionBox = React.forwardRef<HTMLDivElement, MotionBoxProps>(function MotionBox(
  { preset = 'fade-up', delay = 0, interactive = false, className, transition, variants, children, ...props },
  ref,
) {
  const selectedVariants = variants ?? (preset === 'none' ? undefined : motionPresets[preset]);

  return (
    <motion.div
      ref={ref}
      initial={selectedVariants ? 'hidden' : undefined}
      animate={selectedVariants ? 'visible' : undefined}
      exit={selectedVariants ? 'exit' : undefined}
      variants={selectedVariants}
      transition={transition ?? { ...fluidTransition, delay }}
      whileHover={interactive ? { y: -2, scale: 1.005 } : undefined}
      whileTap={interactive ? { scale: 0.99 } : undefined}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
});



