'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Activity, Clock, Cpu, Zap } from 'lucide-react';

const stats = [
  { icon: Clock, value: 'Instant', label: 'Processing', desc: "Your photo processes before you can take your next breath. No loading bars. No waiting. Pure flow." },
  { icon: Zap, value: 'Pristine', label: 'Resolution', desc: "We never downscale or compress. Your 4K masterpiece stays a 4K masterpiece. Every single pixel, untouched." },
  { icon: Activity, value: 'Invisible', label: 'Edges', desc: "Flyaway hair, gauze, smoke, glass — our AI sees depth the way your eyes do. Edges that look hand-cut." },
  { icon: Cpu, value: 'Infinite', label: 'Scale', desc: "One portrait or an entire product catalog of forty thousand SKUs — same speed, same quality, every time." },
];

const ease = [0.16, 1, 0.3, 1] as const;

function AnimatedValue({ value, inView }: { value: string; inView: boolean }) {
  const [display, setDisplay] = useState('');
  
  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const interval = setInterval(() => {
      setDisplay(
        value.split('').map((char, idx) => {
          if (idx < i) return char;
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('')
      );
      i++;
      if (i > value.length) clearInterval(interval);
    }, 60);
    return () => clearInterval(interval);
  }, [value, inView]);

  return <span>{display || value}</span>;
}

export function Performance() {
  const container = useRef<HTMLDivElement>(null);
  const isInView = useInView(container, { once: true, amount: 0.2 });

  return (
    <section ref={container} className="relative py-28 md:py-36 px-6 md:px-16 overflow-hidden bg-transparent">
      
      {/* Section Header */}
      <motion.div 
        initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1.4, ease }}
        className="text-center mb-16 md:mb-24 relative z-10"
      >
        <span className="font-mono text-[11px] tracking-[0.5em] uppercase text-[#E8B98A]/80 mb-5 block">
          What makes us different
        </span>
        <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1]">
          The details that <br className="hidden md:block" />
          <span className="italic font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#C4956A] via-[#E8B98A] to-[#8B5E3C]">matter most.</span>
        </h2>
      </motion.div>

      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[35vw] bg-[#C4956A]/[0.04] rounded-full blur-[140px] pointer-events-none animate-glow-pulse" />

      {/* Stats Grid — 2×2 with staggered reveal */}
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 relative z-10">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 50, scale: 0.96, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.2, delay: i * 0.12, ease }}
            className="stat-card glass3d !rounded-[2rem] bg-[#0A0604]/50 backdrop-blur-[24px] p-8 md:p-10 border border-[#8B5E3C]/12 hover:border-[#8B5E3C]/25 transition-all duration-700 group cursor-default"
          >
            <div className="flex items-start gap-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#1A0E08] to-[#0A0604] border border-[#8B5E3C]/20 flex items-center justify-center group-hover:border-[#C4956A]/35 group-hover:shadow-[0_0_25px_rgba(232,185,138,0.08)] transition-all duration-700">
                <stat.icon className="w-5 h-5 text-[#C4956A] group-hover:text-[#E8B98A] transition-colors duration-500" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-display text-2xl md:text-3xl font-extrabold text-white block mb-1 tracking-tight">
                  <AnimatedValue value={stat.value} inView={isInView} />
                </span>
                <h3 className="text-[10px] font-bold text-[#E8B98A]/80 tracking-[0.3em] uppercase mb-3">{stat.label}</h3>
                <p className="text-sm md:text-base text-[#BFA899]/80 font-light leading-relaxed">
                  {stat.desc}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
