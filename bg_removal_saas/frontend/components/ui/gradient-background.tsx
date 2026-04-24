'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type GradientBackgroundProps = React.ComponentProps<'div'> & {
  gradients?: string[];
  animationDuration?: number;
};

const Default_Gradients = [
  "linear-gradient(135deg, #0C0806 0%, #1A0E08 50%, #0C0806 100%)",
  "linear-gradient(135deg, #0C0806 0%, #2A1A0E 40%, #1A0E08 100%)",
  "linear-gradient(135deg, #1A0E08 0%, #3D2B1F 40%, #0C0806 100%)",
  "linear-gradient(135deg, #0C0806 0%, #1A0E08 30%, #2A1A0E 100%)",
  "linear-gradient(135deg, #0C0806 0%, #1A0E08 50%, #0C0806 100%)",
];

export function GradientBackground({
  children,
  className = '',
  gradients = Default_Gradients,
  animationDuration = 12,
}: GradientBackgroundProps) {
  return (
    <div className={cn('w-full relative', className)}>
      {/* Fixed animated gradient layer */}
      <motion.div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: gradients[0] }}
        animate={{ background: gradients }}
        transition={{
          duration: animationDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Content flows naturally on top */}
      <div className="relative z-[1]">
        {children}
      </div>
    </div>
  );
}
