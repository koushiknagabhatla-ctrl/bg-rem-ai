'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';

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
            initial={{ y: '110%' }}
            animate={mounted ? { y: 0 } : {}}
            transition={{ duration: 1.2, delay: delay + i * 0.06, ease }}
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
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <section ref={containerRef} id="hero" className="relative w-full min-h-[160vh] flex flex-col justify-start pt-32 pb-24 overflow-hidden">
      
      {/* Hero Text Content — scales down on scroll */}
      <motion.div style={{ scale: textScale, opacity: textOpacity }} className="relative z-10 w-full max-w-[1280px] mx-auto flex flex-col items-center text-center px-6 md:px-16 sticky top-[15vh]">
        
        {/* Main Headline */}
        <h1 className="font-display text-[clamp(3rem,8vw,9rem)] font-extrabold leading-[0.85] tracking-[-0.04em] text-white mb-10 max-w-6xl">
          <span className="block overflow-hidden pb-4">
            <WordReveal text="Backgrounds" delay={0.1} />
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
            <WordReveal text="Artistry Retained." delay={0.5} />
          </span>
        </h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, delay: 0.8, ease }}
          className="text-lg md:text-xl text-[#BFA899] max-w-2xl leading-relaxed mb-14 font-light"
        >
          Zero masking. Zero pixelation. Enterprise-grade AI processing, powered by a custom neural architecture reflecting true cinematic quality.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 1, ease }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20 w-full sm:w-auto z-20"
        >
          <Link href="/register" className="glass3d relative overflow-hidden group px-10 py-5 w-full sm:w-auto rounded-full text-white font-bold text-xs tracking-[0.2em] uppercase transition-all duration-500 text-center flex items-center justify-center border border-[#8B5E3C]/40 shadow-[0_0_30px_rgba(139,94,60,0.15)] hover:shadow-[0_0_40px_rgba(232,185,138,0.25)] hover:scale-105">
            <span className="relative z-10">Start for Free</span>
          </Link>
          <a href="#demo" className="px-10 py-5 rounded-full border border-[#8B5E3C]/20 text-[#D4A574] font-semibold text-xs tracking-[0.2em] uppercase hover:bg-[#8B5E3C]/5 hover:border-[#8B5E3C]/50 transition-all duration-500 w-full sm:w-auto text-center hover:scale-105">
            See It Work
          </a>
        </motion.div>
      </motion.div>

      {/* Single Showcase Image — parallaxes up as you scroll, revealing itself */}
      <motion.div 
        style={{ y: imageY, scale: imageScale }}
        className="relative z-20 w-full max-w-5xl mx-auto px-6 md:px-16 mt-12"
      >
        <motion.div
          initial={{ opacity: 0, y: 100, rotateX: 8 }}
          animate={mounted ? { opacity: 1, y: 0, rotateX: 0 } : {}}
          transition={{ duration: 1.5, delay: 1.2, ease }}
          className="glass3d p-3 md:p-4 rounded-3xl border border-[#8B5E3C]/20 shadow-2xl shadow-black/50 transform-gpu [perspective:1200px] overflow-hidden"
        >
          <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-[#1A0E08]">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&q=80" 
              alt="AI Background Removal Demo" 
              className="w-full h-full object-cover"
            />
            {/* Glass overlay with slide instruction */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0C0806]/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
              <div className="glass3d px-5 py-2.5 rounded-full border border-[#8B5E3C]/30 flex items-center gap-3">
                <svg className="w-4 h-4 text-[#E8B98A] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span className="text-[10px] font-semibold tracking-widest uppercase text-[#BFA899]">Slide to compare</span>
              </div>
              <div className="glass3d px-5 py-2.5 rounded-full border border-[#8B5E3C]/30">
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#E8B98A]">AI Processed</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={mounted ? { opacity: 1 } : {}}
        transition={{ delay: 2.5, duration: 2 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-30"
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
