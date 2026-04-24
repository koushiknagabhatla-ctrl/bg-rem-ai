'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

type GradientBackgroundProps = React.ComponentProps<'div'> & {
  className?: string;
};

export function GradientBackground({
  children,
  className = '',
}: GradientBackgroundProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className={cn('w-full relative min-h-screen bg-[#0C0806] overflow-hidden', className)}>
      {/* 
        Fluid Motion Gradient layer behind all content.
        Uses blurry radial blobs that animate translation and scaling to create a cinematic liquid feel.
      */}
      {mounted && (
        <div className="fixed inset-0 z-0 pointer-events-none opacity-50 mix-blend-screen" style={{ filter: 'blur(100px)' }}>
          {/* Top Left Warm Glow */}
          <motion.div
            className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#8B5E3C]"
            animate={{
              x: ['0%', '20%', '-10%', '0%'],
              y: ['0%', '10%', '-20%', '0%'],
              scale: [1, 1.2, 0.9, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Bottom Right Deep Auburn */}
          <motion.div
            className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#3D2B1F]"
            animate={{
              x: ['0%', '-20%', '10%', '0%'],
              y: ['0%', '-10%', '15%', '0%'],
              scale: [1, 0.8, 1.1, 1]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Center Caramel Orb */}
          <motion.div
            className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] rounded-full bg-[#C4956A] opacity-40"
            animate={{
              x: ['0%', '30%', '-20%', '0%'],
              y: ['0%', '-30%', '20%', '0%'],
              scale: [0.8, 1.1, 0.9, 0.8]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      )}

      {/* Content flows naturally on top */}
      <div className="relative z-[1]">
        {children}
      </div>
    </div>
  );
}
