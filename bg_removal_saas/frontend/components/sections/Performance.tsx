'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Activity, Clock, Cpu, Zap } from 'lucide-react';

const stats = [
  { icon: Clock, value: 'Instant', label: 'Processing', desc: "Photos process so fast you won't even blink. Your flow state remains unbroken." },
  { icon: Zap, value: 'Pristine', label: 'Resolution', desc: 'Every pixel of your original is preserved perfectly without downscaling.' },
  { icon: Activity, value: 'Invisible', label: 'Edges', desc: 'Hair strands, fine mesh, smoke — our AI understands depth intuitively.' },
  { icon: Cpu, value: 'Infinite', label: 'Scale', desc: 'One photo or forty thousand — our engine handles it without breaking a sweat.' },
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
    }, 50);
    return () => clearInterval(interval);
  }, [value, inView]);

  return <span>{display || value}</span>;
}

export function Performance() {
  const container = useRef<HTMLDivElement>(null);
  const isInView = useInView(container, { once: true, amount: 0.3 });

  return (
    <section ref={container} className="relative py-32 md:py-40 px-6 md:px-16 overflow-hidden bg-transparent">
      
      {/* Section Header */}
      <motion.div 
        initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1.2, ease }}
        className="text-center mb-20 md:mb-28 relative z-10"
      >
        <span className="font-mono text-[12px] tracking-[0.5em] uppercase text-[#E8B98A] mb-6 block">
          Experience
        </span>
        <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight">
          Magic <span className="italic font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#C4956A] to-[#8B5E3C]">Disguised</span>
        </h2>
      </motion.div>

      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[40vw] bg-[#C4956A]/5 rounded-full blur-[120px] pointer-events-none animate-glow-pulse" />

      {/* Stats Grid */}
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 relative z-10">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 60, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, delay: i * 0.15, ease }}
            className="stat-card glass3d !rounded-[2rem] bg-[#0A0604]/50 backdrop-blur-[24px] p-8 md:p-12 border border-[#8B5E3C]/15 hover:border-[#8B5E3C]/30 transition-all duration-700 group"
          >
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[#1A0E08]/80 border border-[#8B5E3C]/20 flex items-center justify-center group-hover:border-[#C4956A]/40 group-hover:shadow-[0_0_30px_rgba(232,185,138,0.1)] transition-all duration-700">
                <stat.icon className="w-6 h-6 text-[#C4956A] group-hover:text-[#E8B98A] transition-colors duration-500" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <span className="font-display text-3xl md:text-4xl font-extrabold text-white block mb-1 tracking-tight">
                  <AnimatedValue value={stat.value} inView={isInView} />
                </span>
                <h3 className="text-xs font-bold text-[#E8B98A] tracking-[0.3em] uppercase mb-4">{stat.label}</h3>
                <p className="text-base md:text-lg text-[#BFA899] font-light leading-relaxed">
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
