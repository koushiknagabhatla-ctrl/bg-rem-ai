'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { LiquidButton } from '@/components/ui/liquid-glass-button';

const ease = [0.16, 1, 0.3, 1] as const;

function WordReveal({ text, delay = 0 }: { text: string; delay?: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  return (
    <span className="inline-flex flex-wrap justify-center">
      {text.split(' ').map((word, i) => (
        <span key={i} className="overflow-hidden inline-block mr-[0.3em]">
          <motion.span
            className="inline-block"
            initial={{ y: '150%', rotate: 2 }}
            animate={mounted ? { y: 0, rotate: 0 } : {}}
            transition={{ duration: 1.5, delay: delay + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export function Hero() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const textScale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={containerRef} id="hero" className="relative w-full min-h-screen flex flex-col justify-center px-6 md:px-16 pt-32 pb-24 overflow-hidden">
      
      {/* Hero Text Content — scales down on scroll */}
      <motion.div style={{ scale: textScale, opacity: textOpacity }} className="relative z-10 w-full max-w-[1280px] mx-auto flex flex-col items-center text-center">
        
        {/* Main Headline */}
        <h1 className="font-display text-[clamp(2.5rem,7vw,8rem)] font-extrabold leading-[1.1] tracking-[-0.02em] text-white mb-10 max-w-6xl">
          <span className="block overflow-hidden py-2">
            <WordReveal text="Backgrounds" delay={0.1} />
          </span>
          <span className="block overflow-hidden py-2">
            <motion.span
              className="inline-block italic font-medium text-[#8B5E3C]"
              initial={{ y: '110%' }}
              animate={mounted ? { y: 0 } : {}}
              transition={{ duration: 1.2, delay: 0.3, ease }}
            >
              Removed.
            </motion.span>
          </span>
          <span className="block overflow-hidden py-2">
            <WordReveal text="Artistry Retained." delay={0.5} />
          </span>
        </h1>

        {/* Subheadline (Staggered Load) */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.5, delay: 0.8, ease: [0.16, 1, 0.3, 1] }} // Expo.out equivalent
          className="text-lg md:text-xl text-[#BFA899] max-w-2xl leading-relaxed mb-14 font-light"
        >
          Zero masking. Zero pixelation. Enterprise-grade AI processing, powered by a custom neural architecture reflecting true cinematic quality.
        </motion.p>

        {/* The 'Landing' CTA Effect */}
        <motion.div
          initial={{ opacity: 0, scale: 1.08, y: 40 }}
          animate={mounted ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ duration: 1.5, delay: 1, ease: [0.16, 1, 0.3, 1] }} 
          className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto z-20 mt-8"
        >
          <LiquidButton size="xxl" asChild>
            <Link href="/register">Start for Free</Link>
          </LiquidButton>
          
          <a href="#demo" className="px-10 py-5 rounded-full border border-[#8B5E3C]/20 text-[#D4A574] font-semibold text-xs tracking-[0.2em] uppercase hover:bg-[#8B5E3C]/5 hover:border-[#8B5E3C]/50 transition-all duration-700 w-full sm:w-auto text-center hover:scale-105">
            See It Work
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
