'use client';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Global3DAnchor } from './Global3DAnchor';

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
      
      {/* Living Ambient Backgrounds (Peachweb.io / Curated.media style) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Massive slow-moving copper blob */}
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[50vw] bg-[#C4956A]/10 rounded-full blur-[140px] animate-spin-slow mix-blend-screen" style={{ animationDuration: '40s' }} />
        
        {/* Deep amber blob moving counter-direction */}
        <div className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[60vw] bg-[#E8B98A]/5 rounded-full blur-[160px] animate-spin-slow [animation-direction:reverse] mix-blend-screen" style={{ animationDuration: '60s' }} />

        {/* Central static anchor glow to bridge backgrounds */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[30vw] bg-[#8B5E3C]/10 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <div className="relative z-[1]">
        {children}
      </div>
    </div>
  );
}
