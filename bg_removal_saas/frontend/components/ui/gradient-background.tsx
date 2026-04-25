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
    <div className={cn('w-full relative min-h-screen bg-[#080402]', className)}>
      
      {/* High-performance fixed fluid shader background */}
      {mounted && (
        <div className="fixed top-0 left-0 w-screen h-screen z-0 pointer-events-none overflow-hidden">
          <Canvas 
            camera={{ position: [0, 0, 3] }} 
            dpr={[1, 1.5]} 
            gl={{ antialias: false, powerPreference: "high-performance", alpha: true }}
          >
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

      {/* Content wrapper */}
      <div className="relative z-[1]">
        {children}
      </div>
    </div>
  );
}
