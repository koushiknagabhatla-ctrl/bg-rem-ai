'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { LiquidButton } from '@/components/ui/liquid-glass-button';

const ease = [0.16, 1, 0.3, 1] as const;

export function FinalCTA() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const cardY = useTransform(scrollYProgress, [0, 0.5], [80, 0]);
  const cardScale = useTransform(scrollYProgress, [0, 0.5], [0.85, 1]);
  const cardRotateX = useTransform(scrollYProgress, [0, 0.5], [12, 0]);
  const watermarkX = useTransform(scrollYProgress, [0, 1], ['5%', '-5%']);

  return (
    <section
      ref={sectionRef}
      id="final-cta"
      className="relative py-36 md:py-48 px-6 md:px-16 overflow-hidden [perspective:2000px] bg-[#0A0604] rounded-t-[60px] md:rounded-t-[80px] shadow-[0_-20px_60px_rgba(0,0,0,0.7)] border-t border-[#8B5E3C]/15 z-30"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[1200px] max-h-[1200px] bg-[radial-gradient(ellipse_at_center,_rgba(139,94,60,0.08)_0%,_transparent_60%)] pointer-events-none" />

      {/* Giant background text with horizontal drift */}
      <motion.div 
        style={{ x: watermarkX }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none opacity-[0.02] select-none mix-blend-screen"
      >
        <span className="font-display text-[20vw] font-extrabold whitespace-nowrap tracking-tighter text-[#C4956A]">VCRANCKS</span>
      </motion.div>

      <motion.div 
        style={{ y: cardY, scale: cardScale, rotateX: cardRotateX }}
        className="max-w-[900px] mx-auto text-center relative z-10 glass3d p-14 md:p-20 border border-[#8B5E3C]/10 backdrop-blur-3xl bg-black/40 transform-gpu"
      >
        <motion.div
          initial={{ opacity: 0, scale: 1.05, y: 30, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#8B5E3C]/30 text-[10px] font-mono tracking-[0.3em] uppercase text-[#C4956A] mb-10 bg-[#1A0E08]/80 drop-shadow-lg">
             Ready when you are
          </span>

          <h2 className="font-display text-[clamp(2.5rem,6vw,5.5rem)] font-extrabold text-white leading-[1.1] tracking-tight mb-8">
            <span className="block overflow-hidden py-2">
              <motion.span className="inline-block" initial={{ y: '120%', rotate: 2 }} whileInView={{ y: 0, rotate: 0 }} viewport={{ once: true }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}>Your Studio</motion.span>
            </span>
            <span className="block overflow-hidden py-2">
              <motion.span className="inline-block italic font-medium text-[#C4956A]" initial={{ y: '120%', rotate: 2 }} whileInView={{ y: 0, rotate: 0 }} viewport={{ once: true }} transition={{ duration: 1.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}>Awaits.</motion.span>
            </span>
          </h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-[#BFA899] font-light mb-12 max-w-lg mx-auto leading-relaxed drop-shadow-sm"
          >
            50 free high-resolution extractions. No credit card required. Start building in seconds.
          </motion.p>

          <Link href="/register">
            <LiquidButton size="xxl">Begin Free Trial</LiquidButton>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
