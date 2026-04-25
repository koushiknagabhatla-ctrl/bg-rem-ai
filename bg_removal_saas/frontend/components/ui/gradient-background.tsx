'use client';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Canvas } from "@react-three/fiber";
import { ShaderPlane, EnergyRing } from "./background-paper-shaders";

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
      
      {/* High-performance custom fluid shader background */}
      {mounted && (
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 3] }} gl={{ alpha: true, antialias: true }}>
            <ShaderPlane 
              position={[0, 0, -1]}
              color1="#080402"   /* Deepest black/brown */
              color2="#3D1C04"   /* Mid brown */
              color3="#EAA752"   /* Brilliant gold highlight */
            />
            <EnergyRing radius={1.5} position={[0, 0, -0.5]} />
          </Canvas>
        </div>
      )}
      
      {/* Cinematic Overlays to add depth (floating ambient lights) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden mix-blend-screen opacity-50">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[50vw] bg-[#C4956A]/10 rounded-full blur-[140px] animate-spin-slow" style={{ animationDuration: '30s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[60vw] bg-[#E8B98A]/8 rounded-full blur-[160px] animate-spin-slow [animation-direction:reverse]" style={{ animationDuration: '45s' }} />
      </div>

      <div className="relative z-[1]">
        {children}
      </div>
    </div>
  );
}
