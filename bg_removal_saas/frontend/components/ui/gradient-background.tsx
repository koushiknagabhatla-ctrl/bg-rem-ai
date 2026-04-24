'use client';
import type React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type GradientBackgroundProps = React.ComponentProps<'div'> & {
  gradients?: string[];
  animationDuration?: number;
  animationDelay?: number;
  overlay?: boolean;
  overlayOpacity?: number;
};

const Default_Gradients = [
  "linear-gradient(135deg, #0C0806 0%, #1A0E08 50%, #0C0806 100%)",
  "linear-gradient(135deg, #0C0806 0%, #2A1A0E 40%, #1A0E08 100%)",
  "linear-gradient(135deg, #1A0E08 0%, #3D2B1F 50%, #0C0806 100%)",
  "linear-gradient(135deg, #0C0806 0%, #1A0E08 30%, #2A1A0E 100%)",
  "linear-gradient(135deg, #0C0806 0%, #1A0E08 50%, #0C0806 100%)",
];

export function GradientBackground({
  children,
  className = '',
  gradients = Default_Gradients,
  animationDuration = 12,
  animationDelay = 0,
  overlay = true,
  overlayOpacity = 0.15,
}: GradientBackgroundProps) {
  return (
    <div className={cn('w-full relative min-h-screen overflow-hidden', className)}>
      <motion.div
        className="absolute inset-0"
        style={{ background: gradients[0] }}
        animate={{ background: gradients }}
        transition={{
          delay: animationDelay,
          duration: animationDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {overlay && (
        <div
          className="absolute inset-0 bg-black pointer-events-none"
          style={{ opacity: overlayOpacity }}
        />
      )}

      {children && (
        <div className={cn('relative z-10')}>
          {children}
        </div>
      )}
    </div>
  );
}
