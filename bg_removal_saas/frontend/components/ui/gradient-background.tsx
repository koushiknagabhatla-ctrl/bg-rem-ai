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
      {mounted && <Global3DAnchor />}

      {/* Content flows strictly on top of the pinned WebGL backdrop */}
      <div className="relative z-[1]">
        {children}
      </div>
    </div>
  );
}
