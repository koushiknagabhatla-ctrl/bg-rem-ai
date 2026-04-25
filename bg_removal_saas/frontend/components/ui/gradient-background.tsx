'use client';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { MeshGradient } from "@paper-design/shaders-react";

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
    <div className={cn('w-full relative min-h-screen bg-black overflow-hidden', className)}>
      
      {mounted && (
        <MeshGradient
          className="w-full h-full absolute inset-0 z-0 opacity-80"
          colors={["#000000", "#4A2E1B", "#A0A0A0", "#FFFFFF"]}
          speed={0.4}
        />
      )}
      
      {/* Cinematic Overlays to add depth */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden mix-blend-screen">
        {/* Massive slow-moving copper blob */}
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[50vw] bg-[#C4956A]/10 rounded-full blur-[140px] animate-spin-slow" style={{ animationDuration: '40s' }} />
        
        {/* Deep amber blob moving counter-direction */}
        <div className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[60vw] bg-[#E8B98A]/8 rounded-full blur-[160px] animate-spin-slow [animation-direction:reverse]" style={{ animationDuration: '60s' }} />
      </div>

      <div className="relative z-[1]">
        {children}
      </div>
    </div>
  );
}
