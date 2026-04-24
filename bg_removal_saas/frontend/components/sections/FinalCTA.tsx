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
      className="relative py-40 md:py-56 px-6 md:px-16 overflow-hidden [perspective:2000px] bg-[#0A0604] rounded-t-[80px] shadow-[0_-30px_80px_rgba(0,0,0,0.8)] border-t border-[#8B5E3C]/20 z-30"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[1200px] max-h-[1200px] bg-[radial-gradient(ellipse_at_center,_rgba(139,94,60,0.08)_0%,_transparent_60%)] pointer-events-none" />

      {/* Giant background text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none opacity-[0.02] select-none mix-blend-screen">
        <span className="font-display text-[20vw] font-extrabold whitespace-nowrap tracking-tighter text-[#C4956A]">VCRANKS</span>
      </div>

      <motion.div 
        style={{ y: cardY, scale: cardScale, rotateX: cardRotateX }}
        className="max-w-[900px] mx-auto text-center relative z-10 glass3d p-16 md:p-24 border border-[#8B5E3C]/10 backdrop-blur-3xl bg-black/40 transform-gpu"
      >
        <motion.div
          initial={{ opacity: 0, scale: 1.05, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#8B5E3C]/30 text-[10px] font-mono tracking-[0.3em] uppercase text-[#C4956A] mb-12 bg-[#1A0E08]/80 drop-shadow-lg">
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
            className="text-lg md:text-xl text-[#BFA899] font-light mb-14 max-w-lg mx-auto leading-relaxed drop-shadow-sm"
          >
            50 free high-resolution extractions. No credit card required. Start building in seconds.
          </motion.p>

          <Link
            href="/register"
            className="inline-flex items-center justify-center px-12 py-5 rounded-full bg-gradient-to-r from-[#8B5E3C] to-[#C4956A] text-white font-bold text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(139,94,60,0.3)] hover:shadow-[0_0_40px_rgba(196,149,106,0.5)] transition-all duration-700 hover:scale-105"
          >
            Begin Free Trial
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
