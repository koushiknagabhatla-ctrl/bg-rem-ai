'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Activity, Clock, Cpu, Zap } from 'lucide-react';
import { HeadingReveal, TextReveal } from '@/components/ui/scroll-reveal'; // Text reveal animations

const stats = [
  { icon: Clock, value: 'Instant', label: 'Processing', desc: 'Photos process so fast you won’t even have time to blink. Your flow state remains unbroken.' },
  { icon: Zap, value: 'Pristine', label: 'Resolution', desc: 'We respect your art. Every single pixel of your original image is preserved perfectly without downscaling.' },
  { icon: Activity, value: 'Invisible', label: 'Edges', desc: 'Flyaway hair. Fine mesh. Smoke. Our AI understands depth intuitively, leaving edges flawlessly transparent.' },
  { icon: Cpu, value: 'Infinite', label: 'Scale', desc: 'Whether you upload one photo or forty thousand, our distributed engine handles it without breaking a sweat.' },
];

function RevealCard({ stat, index }: { stat: typeof stats[0], index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: cardRef, offset: ["0 1", "0.6 0.8"] });

  const y = useTransform(scrollYProgress, [0, 1], [180, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [40, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.6, 1]);

  return (
    <motion.div
      ref={cardRef}
      style={{ y, opacity, rotateX, scale }}
      className="glass3d p-10 border border-[#8B5E3C]/15 group hover:border-[#8B5E3C]/40 transition-colors duration-700 transform-gpu relative overflow-hidden flex flex-col justify-between"
    >
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#8B5E3C]/5 rounded-full blur-[40px] group-hover:bg-[#C4956A]/15 transition-colors duration-1000" />
      
      <div>
        <stat.icon className="w-10 h-10 text-[#C4956A] mb-8 drop-shadow-md" strokeWidth={1.5} />
        <span className="font-display text-4xl block font-extrabold text-white mb-2 drop-shadow-sm">{stat.value}</span>
        <h3 className="text-sm font-bold text-[#E8B98A] tracking-[0.25em] uppercase mb-6">{stat.label}</h3>
      </div>
      
      <p className="text-sm text-[#BFA899] font-light leading-relaxed relative z-10">{stat.desc}</p>
    </motion.div>
  );
}

export function Performance() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const headerY = useTransform(scrollYProgress, [0, 0.4], [150, 0]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);

  return (
    <section ref={sectionRef} className="py-32 md:py-56 px-6 md:px-16 overflow-hidden [perspective:2500px]">
      <div className="max-w-[1280px] mx-auto">
        
        {/* Header with character scale reveal inside the scrub */}
        <motion.div style={{ y: headerY, opacity: headerOpacity }} className="mb-24 md:mb-40 transform-gpu flex flex-col items-start md:items-center md:text-center">
          <span className="font-mono text-[11px] tracking-[0.5em] uppercase text-[#E8B98A] mb-8 block drop-shadow-[0_0_10px_rgba(232,185,138,0.5)]">
            Experience
          </span>
          <h2 className="font-display text-5xl md:text-7xl lg:text-8xl font-extrabold text-white max-w-4xl leading-tight drop-shadow-2xl">
            <HeadingReveal>Magic disguised</HeadingReveal>
            <br />
            <span className="italic font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#C4956A] to-[#8B5E3C] drop-shadow-none">
              <HeadingReveal delay={0.25}>as technology.</HeadingReveal>
            </span>
          </h2>
        </motion.div>

        {/* Deep 3D Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 mt-10">
          {stats.map((s, i) => (
            <div key={i} className="h-full pt-0" style={{ marginTop: i % 2 !== 0 ? '4rem' : '0' }}>
              <RevealCard stat={s} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
