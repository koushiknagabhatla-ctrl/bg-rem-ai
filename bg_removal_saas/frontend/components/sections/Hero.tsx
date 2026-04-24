'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';

const ease = [0.16, 1, 0.3, 1] as const;

function WordReveal({ text, delay = 0, yOffset }: { text: string; delay?: number; yOffset: any }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  return (
    <motion.span className="inline-flex flex-wrap" style={{ y: yOffset }}>
      {text.split(' ').map((word, i) => (
        <span key={i} className="overflow-hidden inline-block mr-[0.3em]">
          <motion.span
            className="inline-block"
            initial={{ y: '110%' }}
            animate={mounted ? { y: 0 } : {}}
            transition={{ duration: 1.2, delay: delay + i * 0.05, ease }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.span>
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

  // Parallax mappings
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const textScale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const blobY1 = useTransform(scrollYProgress, [0, 1], ['0%', '60%']);
  const blobY2 = useTransform(scrollYProgress, [0, 1], ['0%', '-40%']);

  return (
    <section ref={containerRef} className="relative w-full min-h-screen flex flex-col justify-center px-6 md:px-16 pt-32 pb-24 overflow-hidden">
      
      {/* Background radial glow tied to parallax */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 pointer-events-none opacity-50 z-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#8B5E3C]/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#E8B98A]/5 rounded-full blur-[120px]" />
      </motion.div>

      <motion.div style={{ scale: textScale, opacity: textOpacity }} className="relative z-10 w-full max-w-[1280px] mx-auto flex flex-col items-center text-center">
        {/* Top Floating Badge */}
        <motion.div
          style={{ y: blobY1 }}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={mounted ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.2, ease }}
          className="glass3d inline-flex items-center gap-3 px-5 py-2.5 mb-12 group cursor-default border border-[#8B5E3C]/20"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8B98A] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4A574]" />
          </span>
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#C4956A] group-hover:text-white transition-colors duration-300">V2.0 Neural Engine Active</span>
        </motion.div>

        {/* Main Headline */}
        <h1 className="font-display text-[clamp(3rem,8vw,9rem)] font-extrabold leading-[0.85] tracking-[-0.04em] text-white mb-10 max-w-6xl">
          <span className="block overflow-hidden pb-4">
            <WordReveal text="Backgrounds" delay={0.1} yOffset={0} />
          </span>
          <span className="block overflow-hidden pb-4">
            <motion.span
              className="inline-block italic font-medium text-[#8B5E3C]"
              initial={{ y: '110%' }}
              animate={mounted ? { y: 0 } : {}}
              transition={{ duration: 1.2, delay: 0.3, ease }}
            >
              Removed.
            </motion.span>
          </span>
          <span className="block overflow-hidden pb-4">
            <WordReveal text="Artistry Retained." delay={0.5} yOffset={0} />
          </span>
        </h1>

        {/* Subheadline */}
        <motion.p
          style={{ y: blobY2 }}
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, delay: 0.8, ease }}
          className="text-lg md:text-xl text-[#BFA899] max-w-2xl leading-relaxed mb-14 font-light mix-blend-screen"
        >
          Zero masking. Zero pixelation. Enterprise-grade AI processing at your fingertips, powered by a custom neural architecture reflecting true cinematic quality.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
           style={{ y: blobY1 }}
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 1, ease }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20 w-full sm:w-auto z-20"
        >
          <Link href="/register" className="glass3d relative overflow-hidden group px-10 py-5 w-full sm:w-auto rounded-full text-white font-bold text-xs tracking-[0.2em] uppercase transition-all duration-500 text-center flex items-center justify-center border border-[#8B5E3C]/40 shadow-[0_0_30px_rgba(139,94,60,0.15)] hover:shadow-[0_0_40px_rgba(232,185,138,0.25)] hover:scale-105">
            <span className="relative z-10">Start for Free</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#8B5E3C]/0 via-[#C4956A]/20 to-[#8B5E3C]/0 -translate-x-[100%] group-hover:animate-[marquee_2s_ease-in-out_infinite]" />
          </Link>
          <a href="#demo" className="px-10 py-5 rounded-full border border-[#8B5E3C]/20 text-[#D4A574] font-semibold text-xs tracking-[0.2em] uppercase hover:bg-[#8B5E3C]/5 hover:border-[#8B5E3C]/50 transition-all duration-500 w-full sm:w-auto text-center hover:scale-105">
            See It Work
          </a>
        </motion.div>

      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={mounted ? { opacity: 1 } : {}}
        transition={{ delay: 2, duration: 2 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-0"
      >
        <div className="w-[1px] h-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#8B5E3C] to-transparent opacity-20" />
          <motion.div 
            animate={{ y: ['-100%', '100%'] }} 
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-transparent via-[#E8B98A] to-transparent" 
          />
        </div>
        <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-[#A06B45]">Scroll</span>
      </motion.div>
    </section>
  );
}
