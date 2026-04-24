'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { MagneticWrapper } from '@/components/ui/MagneticWrapper';
import { Zap } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

export function FinalCTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <section
      ref={ref}
      onMouseMove={handleMouseMove}
      className="relative py-40 md:py-56 px-6 md:px-16 overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at ${mousePos.x}% ${mousePos.y}%, rgba(108,99,255,0.08) 0%, transparent 60%), #0A0A0F`,
      }}
    >
      {/* Giant background text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none opacity-[0.015] select-none">
        <span className="font-display text-[20vw] font-extrabold whitespace-nowrap tracking-tighter text-white">VCRANKS</span>
      </div>

      <div className="max-w-[900px] mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease }}
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/10 text-[10px] font-mono tracking-[0.3em] uppercase text-[#00E5C3] mb-10">
            <Zap className="w-3 h-3" /> Ready when you are
          </span>

          <h2 className="font-display text-[clamp(3rem,7vw,6rem)] font-extrabold text-white leading-[0.9] tracking-tight mb-8">
            Your Studio <span className="italic font-medium text-white/40 block md:inline">Awaits.</span>
          </h2>

          <p className="text-lg md:text-xl text-[#8B8A97] font-light mb-14 max-w-lg mx-auto leading-relaxed">
            50 free high-resolution extractions. No credit card required. Start building in seconds.
          </p>

          <MagneticWrapper strength={0.2}>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-12 py-5 rounded-full bg-[#6C63FF] text-white font-bold text-sm tracking-wide hover:shadow-[0_0_60px_rgba(108,99,255,0.4)] transition-all duration-500"
              style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}
            >
              Begin Free Trial
            </Link>
          </MagneticWrapper>
        </motion.div>
      </div>
    </section>
  );
}
