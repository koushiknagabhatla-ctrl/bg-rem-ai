'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

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
    <section className="relative w-full min-h-screen flex flex-col justify-center px-6 md:px-16 pt-32 pb-24 overflow-hidden gradient-hero">
      
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none opacity-50 transition-opacity duration-1000 ease-in-out" />

      <div className="relative z-10 w-full max-w-[1280px] mx-auto flex flex-col items-center text-center">
        {/* Top Floating Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={mounted ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.2, ease }}
          className="glass3d inline-flex items-center gap-3 px-5 py-2.5 mb-12 group cursor-default"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8B98A] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4A574]" />
          </span>
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#C4956A] group-hover:text-white transition-colors duration-300">V2.0 Neural Engine Active</span>
        </motion.div>

        {/* Main Headline */}
        <h1 className="font-display text-[clamp(3.5rem,9vw,9rem)] font-extrabold leading-[0.85] tracking-[-0.04em] text-white mb-10 max-w-6xl">
          <span className="block overflow-hidden pb-4">
            <WordReveal text="Backgrounds" delay={0.3} />
          </span>
          <span className="block overflow-hidden pb-4">
            <motion.span
              className="inline-block italic font-medium text-[#8B5E3C]"
              initial={{ y: '110%' }}
              animate={mounted ? { y: 0 } : {}}
              transition={{ duration: 1, delay: 0.5, ease }}
            >
              Removed.
            </motion.span>
          </span>
          <span className="block overflow-hidden pb-4">
            <motion.span
               className="inline-block"
               initial={{ y: '110%' }}
               animate={mounted ? { y: 0 } : {}}
               transition={{ duration: 1, delay: 0.6, ease }}
            >
              Artistry Retained.
            </motion.span>
          </span>
        </h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.9, ease }}
          className="text-lg md:text-xl text-[#BFA899] max-w-2xl leading-relaxed mb-14 font-light mix-blend-screen"
        >
          Zero masking. Zero pixelation. Enterprise-grade AI processing at your fingertips, powered by a custom neural architecture reflecting true cinematic quality.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 1.1, ease }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20 w-full sm:w-auto"
        >
          <Link href="/register" className="glass3d relative overflow-hidden group px-10 py-4 w-full sm:w-auto rounded-full text-white font-bold text-sm tracking-widest uppercase hover:bg-white/5 transition-all duration-500 text-center flex items-center justify-center before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#8B5E3C] before:to-[#C4956A] before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-20">
            <span className="relative z-10">Start for Free</span>
          </Link>
          <a href="#demo" className="px-10 py-4 rounded-full border border-[#8B5E3C]/30 text-[#D4A574] font-semibold text-sm tracking-widest uppercase hover:bg-[#8B5E3C]/10 hover:border-[#8B5E3C]/60 transition-all duration-500 w-full sm:w-auto text-center">
            See It Work
          </a>
        </motion.div>

      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={mounted ? { opacity: 1 } : {}}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        style={{ animation: 'scroll-indicator 2s ease-in-out infinite' }}
      >
        <div className="w-[1px] h-12 bg-gradient-to-b from-[#C4956A] to-transparent" />
        <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-[#A06B45]">Scroll</span>
      </motion.div>
    </section>
  );
}
