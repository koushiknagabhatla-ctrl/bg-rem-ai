'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';

const ease = [0.16, 1, 0.3, 1] as const;

export function FinalCTA() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const cardY = useTransform(scrollYProgress, [0, 0.5], [80, 0]);
  const cardScale = useTransform(scrollYProgress, [0, 0.5], [0.9, 1]);
  const cardRotateX = useTransform(scrollYProgress, [0, 0.5], [10, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative py-40 md:py-56 px-6 md:px-16 overflow-hidden [perspective:2000px]"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[1200px] max-h-[1200px] bg-[radial-gradient(ellipse_at_center,_rgba(139,94,60,0.12)_0%,_transparent_60%)] pointer-events-none" />

      {/* Giant background text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none opacity-[0.02] select-none">
        <span className="font-display text-[20vw] font-extrabold whitespace-nowrap tracking-tighter text-[#C4956A]">VCRANKS</span>
      </div>

      <motion.div 
        style={{ y: cardY, scale: cardScale, rotateX: cardRotateX }}
        className="max-w-[900px] mx-auto text-center relative z-10 glass3d p-16 md:p-24 border border-[#8B5E3C]/20 transform-gpu"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.2, ease }}
        >
          <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#8B5E3C]/30 text-[10px] font-mono tracking-[0.3em] uppercase text-[#E8B98A] mb-12 bg-[#1A0E08]/50">
             Ready when you are
          </span>

          <h2 className="font-display text-[clamp(2.5rem,6vw,5.5rem)] font-extrabold text-white leading-[0.95] tracking-tight mb-8">
            Your Studio <br className="hidden md:block" />
            <span className="italic font-medium text-[#C4956A]">Awaits.</span>
          </h2>

          <p className="text-lg md:text-xl text-[#BFA899] font-light mb-14 max-w-lg mx-auto leading-relaxed">
            50 free high-resolution extractions. No credit card required. Start building in seconds.
          </p>

          <Link
            href="/register"
            className="inline-flex items-center justify-center px-12 py-5 rounded-full bg-gradient-to-r from-[#8B5E3C] to-[#C4956A] text-white font-bold text-sm tracking-widest uppercase hover:shadow-[0_0_40px_rgba(196,149,106,0.3)] transition-all duration-500 hover:scale-105"
            style={{ animation: 'pulse-warm 4s ease-in-out infinite' }}
          >
            Begin Free Trial
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
