'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import Link from 'next/link';
import { MagneticWrapper } from '@/components/ui/MagneticWrapper';
import { ChevronDown } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

function WordReveal({ text, delay = 0 }: { text: string; delay?: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  return (
    <span className="inline-flex flex-wrap">
      {text.split(' ').map((word, i) => (
        <span key={i} className="overflow-hidden inline-block mr-[0.3em]">
          <motion.span
            className="inline-block"
            initial={{ y: '110%' }}
            animate={mounted ? { y: 0 } : {}}
            transition={{ duration: 1, delay: delay + i * 0.06, ease }}
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
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center px-6 md:px-16 pt-28 pb-24 overflow-hidden gradient-mesh">
      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />

      <div className="relative z-10 w-full max-w-[1280px] mx-auto">
        {/* Tag */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.2, ease }}
          className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm mb-10"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E5C3] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E5C3]" />
          </span>
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#8B8A97]">V2.0 Neural Engine</span>
        </motion.div>

        {/* Headline */}
        <h1 className="font-display text-[clamp(3rem,8vw,7.5rem)] font-extrabold leading-[0.9] tracking-[-0.03em] text-white mb-10 max-w-5xl">
          <span className="block overflow-hidden pb-2">
            <WordReveal text="Flawless" delay={0.3} />
          </span>
          <span className="block overflow-hidden pb-2">
            <motion.span
              className="inline-block italic font-medium text-white/40"
              initial={{ y: '110%' }}
              animate={mounted ? { y: 0 } : {}}
              transition={{ duration: 1, delay: 0.5, ease }}
            >
              Background
            </motion.span>
          </span>
          <span className="block overflow-hidden pb-2">
            <motion.span
              className="inline-block bg-gradient-to-r from-white via-white to-[#6C63FF] bg-clip-text text-transparent"
              initial={{ y: '110%' }}
              animate={mounted ? { y: 0 } : {}}
              transition={{ duration: 1, delay: 0.6, ease }}
            >
              Removal.
            </motion.span>
          </span>
        </h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.9, ease }}
          className="text-lg md:text-xl text-[#8B8A97] max-w-xl leading-relaxed mb-12 font-light"
        >
          Zero masking. Zero pixelation. Enterprise-grade AI processing at your fingertips, powered by a custom neural architecture.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 1.1, ease }}
          className="flex flex-wrap items-center gap-4 mb-16"
        >
          <MagneticWrapper>
            <Link href="/register" className="px-8 py-4 rounded-full bg-[#6C63FF] text-white font-bold text-sm tracking-wide hover:shadow-[0_0_30px_rgba(108,99,255,0.4)] transition-all duration-500">
              Start for Free
            </Link>
          </MagneticWrapper>
          <MagneticWrapper>
            <a href="#demo" className="px-8 py-4 rounded-full border border-white/10 text-white/80 font-semibold text-sm tracking-wide hover:bg-white/5 transition-all duration-300">
              See It Work
            </a>
          </MagneticWrapper>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={mounted ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 1.4, ease }}
          className="flex flex-wrap items-center gap-6 text-[#4A4A57] text-xs font-mono tracking-wider uppercase"
        >
          <span>50 free extractions</span>
          <span className="w-1 h-1 rounded-full bg-[#4A4A57]" />
          <span>No credit card</span>
          <span className="w-1 h-1 rounded-full bg-[#4A4A57]" />
          <span>99.2% accuracy</span>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={mounted ? { opacity: 1 } : {}}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ animation: 'scroll-indicator 2s ease-in-out infinite' }}
      >
        <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#4A4A57]">Scroll</span>
        <ChevronDown className="w-4 h-4 text-[#4A4A57]" />
      </motion.div>
    </section>
  );
}
