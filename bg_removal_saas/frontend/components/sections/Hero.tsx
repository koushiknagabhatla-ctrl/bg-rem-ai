'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { LiquidButton } from '@/components/ui/liquid-glass-button';
import { Sparkles } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

function WordReveal({ text, delay = 0 }: { text: string; delay?: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  return (
    <span className="inline-flex flex-wrap justify-center">
      {text.split(' ').map((word, i) => (
        <span key={i} className="overflow-hidden inline-block mr-[0.3em]">
          <motion.span
            className="inline-block will-change-transform"
            initial={{ y: '130%', rotate: 3, filter: 'blur(10px)', opacity: 0 }}
            animate={mounted ? { y: 0, rotate: 0, filter: 'blur(0px)', opacity: 1 } : {}}
            transition={{ duration: 1.6, delay: delay + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
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

  const textScale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-8%']);
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <section ref={containerRef} id="hero" className="relative w-full min-h-screen flex flex-col justify-center px-6 md:px-16 pt-32 pb-24 overflow-hidden">
      
      {/* Orbiting ambient glow — multiple layers for depth */}
      <motion.div 
        style={{ y: bgY, scale: bgScale }}
        className="absolute inset-0 pointer-events-none z-0"
      >
        <div className="absolute top-[15%] left-[20%] w-[55vw] h-[35vw] bg-[#C4956A]/[0.07] rounded-full blur-[140px] animate-cinematic-float" />
        <div className="absolute bottom-[20%] right-[15%] w-[45vw] h-[30vw] bg-[#E8B98A]/[0.04] rounded-full blur-[120px] animate-cinematic-float" style={{ animationDelay: '-4s' }} />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[30vw] h-[20vw] bg-[#8B5E3C]/[0.06] rounded-full blur-[100px] animate-glow-pulse" />
      </motion.div>

      {/* Hero Text Content — parallax + scale on scroll */}
      <motion.div style={{ scale: textScale, opacity: textOpacity, y: textY }} className="relative z-10 w-full max-w-[1280px] mx-auto flex flex-col items-center text-center">
        
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
          animate={mounted ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 1.2, delay: 0.05, ease }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#8B5E3C]/20 bg-[#1A0E08]/60 backdrop-blur-md text-[10px] font-mono tracking-[0.3em] uppercase text-[#C4956A]">
            <Sparkles className="w-3 h-3" />
            AI-Powered Studio
          </span>
        </motion.div>

        {/* Main Headline */}
        <h1 className="font-display text-[clamp(2.5rem,7vw,7.5rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-white mb-10 max-w-5xl">
          <span className="block overflow-hidden py-1">
            <WordReveal text="Backgrounds" delay={0.15} />
          </span>
          <span className="block overflow-hidden py-1">
            <motion.span
              className="inline-block italic font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#C4956A] via-[#E8B98A] to-[#8B5E3C]"
              initial={{ y: '120%', filter: 'blur(14px)', opacity: 0 }}
              animate={mounted ? { y: 0, filter: 'blur(0px)', opacity: 1 } : {}}
              transition={{ duration: 1.4, delay: 0.35, ease }}
            >
              Removed.
            </motion.span>
          </span>
          <span className="block overflow-hidden py-1">
            <WordReveal text="Artistry Retained." delay={0.55} />
          </span>
        </h1>

        {/* Subheadline — warm, human, conversational */}
        <motion.p
          initial={{ opacity: 0, y: 25, filter: 'blur(6px)' }}
          animate={mounted ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 1.4, delay: 0.9, ease }}
          className="text-lg md:text-xl text-[#BFA899]/90 max-w-xl leading-relaxed mb-14 font-light"
        >
          Drop your photo. Watch the background vanish in milliseconds. 
          Every hair strand, every fine edge — preserved perfectly.
        </motion.p>

        {/* CTA Buttons with staggered cinematic entrance */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 35, filter: 'blur(10px)' }}
          animate={mounted ? { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 1.6, delay: 1.1, ease }} 
          className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto z-20"
        >
          <Link href="/register" className="w-full sm:w-auto">
            <LiquidButton size="xxl" className="w-full">
              Start for Free
            </LiquidButton>
          </Link>
          
          <a href="#demo" className="group px-9 py-4 rounded-full border border-[#8B5E3C]/20 text-[#D4A574] font-semibold text-xs tracking-[0.2em] uppercase hover:bg-[#8B5E3C]/8 hover:border-[#8B5E3C]/40 transition-all duration-700 w-full sm:w-auto text-center hover:scale-[1.03] active:scale-[0.98]">
            <span className="group-hover:tracking-[0.25em] transition-all duration-500">See It Work</span>
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
