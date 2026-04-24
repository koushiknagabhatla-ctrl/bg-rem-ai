'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Activity, Clock, Cpu, Zap } from 'lucide-react';

const stats = [
  { icon: Clock, value: '50ms', label: 'Inference Time', desc: 'Sub-second processing per frame via discrete edge caching.' },
  { icon: Cpu, value: 'INT8', label: 'Quantization', desc: 'Hardware-level optimization for maximum CPU throughput.' },
  { icon: Activity, value: '98.7%', label: 'IoU Accuracy', desc: 'Benchmark-leading precision on transparent edges.' },
  { icon: Zap, value: 'Zero', label: 'Data Loss', desc: 'Output resolution strictly matches input pixel density.' },
];

function RevealCard({ stat, index }: { stat: typeof stats[0], index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Each card listens to its own scroll progress so they naturally scrub in one by one as you scroll down
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["0 1", "0.5 0.8"] // start revealing when top of card hits bottom of viewport, fully reveal when middle of card hits 80% viewport height
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [25, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);

  return (
    <motion.div
      ref={cardRef}
      style={{ y, opacity, rotateX, scale }}
      className="glass3d p-10 border border-[#8B5E3C]/15 group hover:border-[#8B5E3C]/30 transition-colors duration-500 transform-gpu relative overflow-hidden"
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#8B5E3C]/5 rounded-full blur-[30px] group-hover:bg-[#C4956A]/10 transition-colors duration-700" />
      <stat.icon className="w-8 h-8 text-[#C4956A] mb-8" strokeWidth={1.5} />
      <span className="font-display text-4xl block font-extrabold text-white mb-2">{stat.value}</span>
      <h3 className="text-sm font-bold text-[#E8B98A] tracking-[0.2em] uppercase mb-4">{stat.label}</h3>
      <p className="text-sm text-[#BFA899] font-light leading-relaxed">{stat.desc}</p>
    </motion.div>
  );
}

export function Performance() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const headerY = useTransform(scrollYProgress, [0, 0.4], [100, 0]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);

  return (
    <section ref={sectionRef} className="py-32 md:py-48 px-6 md:px-16 overflow-hidden [perspective:2000px]">
      <div className="max-w-[1280px] mx-auto">
        
        {/* Header scrubbing */}
        <motion.div style={{ y: headerY, opacity: headerOpacity }} className="mb-20 md:mb-32 transform-gpu">
          <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#E8B98A] mb-6 block">Architecture</span>
          <h2 className="font-display text-5xl md:text-7xl font-extrabold text-white max-w-3xl leading-tight">
            Raw, unthrottled <span className="italic font-medium text-[#8B5E3C]">compute power.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <RevealCard key={i} stat={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
