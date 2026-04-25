'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { LiquidButton } from '@/components/ui/liquid-glass-button';
import { ArrowRight } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

export function FinalCTA() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const cardY = useTransform(scrollYProgress, [0, 0.5], [60, 0]);
  const cardScale = useTransform(scrollYProgress, [0, 0.5], [0.88, 1]);
  const cardRotateX = useTransform(scrollYProgress, [0, 0.5], [10, 0]);
  const watermarkX = useTransform(scrollYProgress, [0, 1], ['3%', '-3%']);

  return (
    <section
      ref={sectionRef}
      id="final-cta"
      className="relative py-32 md:py-44 px-6 md:px-16 overflow-hidden [perspective:2000px] bg-[#0A0604] rounded-t-[50px] md:rounded-t-[80px] shadow-[0_-16px_50px_rgba(0,0,0,0.6)] border-t border-[#8B5E3C]/12 z-30"
    >
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[1000px] max-h-[1000px] bg-[radial-gradient(ellipse_at_center,_rgba(139,94,60,0.06)_0%,_transparent_60%)] pointer-events-none" />

      {/* Floating watermark */}
      <motion.div 
        style={{ x: watermarkX }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none opacity-[0.015] select-none mix-blend-screen"
      >
        <span className="font-display text-[18vw] font-extrabold whitespace-nowrap tracking-tighter text-[#C4956A]">VCRANCKS</span>
      </motion.div>

      <motion.div 
        style={{ y: cardY, scale: cardScale, rotateX: cardRotateX }}
        className="max-w-[860px] mx-auto text-center relative z-10 glass3d p-12 md:p-18 border border-[#8B5E3C]/10 backdrop-blur-3xl bg-black/40 transform-gpu !rounded-[2.5rem]"
      >
        <motion.div
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 1.5, ease }}
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#8B5E3C]/25 text-[10px] font-mono tracking-[0.3em] uppercase text-[#C4956A]/80 mb-8 bg-[#1A0E08]/70">
            Ready when you are
          </span>

          <h2 className="font-display text-[clamp(2rem,5vw,4.5rem)] font-extrabold text-white leading-[1.1] tracking-tight mb-6">
            <span className="block overflow-hidden py-1.5">
              <motion.span className="inline-block" initial={{ y: '110%' }} whileInView={{ y: 0 }} viewport={{ once: true }} transition={{ duration: 1.3, ease }}>Your studio</motion.span>
            </span>
            <span className="block overflow-hidden py-1.5">
              <motion.span className="inline-block italic font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#C4956A] to-[#E8B98A]" initial={{ y: '110%' }} whileInView={{ y: 0 }} viewport={{ once: true }} transition={{ duration: 1.3, delay: 0.1, ease }}>is waiting.</motion.span>
            </span>
          </h2>

          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.3, ease }}
            className="text-base md:text-lg text-[#BFA899]/80 font-light mb-10 max-w-md mx-auto leading-relaxed"
          >
            50 free high-res extractions. No credit card. No catches. 
            Just drag, drop, and download.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5, ease }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/register">
              <LiquidButton size="xxl">
                Start Free Trial
              </LiquidButton>
            </Link>
            <Link href="/login" className="group flex items-center gap-1.5 text-sm text-[#BFA899]/60 hover:text-[#E8B98A] transition-colors duration-300">
              Already have an account? 
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
