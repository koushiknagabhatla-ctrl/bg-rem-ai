'use client';

import { motion } from 'framer-motion';
import { UploadCloud, Zap, Download, ArrowRight } from 'lucide-react';

const steps = [
  { icon: UploadCloud, title: 'Upload', desc: 'Drop your photo via studio or API. Fully encrypted.' },
  { icon: Zap, title: 'Extract', desc: 'AI isolates your subject at sub-pixel precision.' },
  { icon: Download, title: 'Download', desc: 'Get your transparent asset — uncompressed, perfect.' },
];

const ease = [0.16, 1, 0.3, 1] as const;

export function StatsRibbon() {
  return (
    <section className="relative py-24 md:py-32 px-6 md:px-16 overflow-hidden">
      
      {/* Section Header */}
      <motion.div 
        initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1, ease }}
        className="text-center mb-16 md:mb-20"
      >
        <span className="font-mono text-[12px] tracking-[0.5em] uppercase text-[#E8B98A] mb-4 block">
          The Flow
        </span>
        <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white leading-tight">
          Three steps. <span className="italic font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#C4956A] to-[#8B5E3C]">Zero friction.</span>
        </h2>
      </motion.div>

      {/* Steps Row */}
      <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 relative">
        
        {/* Connecting lines (desktop only) */}
        <div className="hidden md:block absolute top-1/2 left-[33%] right-[33%] h-px -translate-y-1/2 z-0">
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.6, ease }}
            className="h-px bg-gradient-to-r from-[#8B5E3C]/40 via-[#C4956A]/30 to-[#8B5E3C]/40 origin-left"
          />
        </div>

        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, delay: i * 0.2, ease }}
            className="relative flex flex-col items-center text-center z-10"
          >
            {/* Step Number */}
            <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#C4956A]/60 mb-4">
              0{i + 1}
            </span>

            {/* Icon Container */}
            <div className="w-20 h-20 rounded-2xl bg-[#1A0E08]/60 backdrop-blur-md border border-[#8B5E3C]/25 flex items-center justify-center shadow-[0_0_30px_rgba(232,185,138,0.08)] mb-6 hover:border-[#C4956A]/40 hover:shadow-[0_0_40px_rgba(232,185,138,0.15)] transition-all duration-700">
              <step.icon className="w-8 h-8 text-[#E8B98A]" strokeWidth={1.5} />
            </div>

            <h3 className="font-display text-xl md:text-2xl font-bold text-white mb-3">
              {step.title}
            </h3>
            <p className="text-sm md:text-base text-[#BFA899] font-light leading-relaxed max-w-[240px]">
              {step.desc}
            </p>

            {/* Arrow between steps (mobile) */}
            {i < steps.length - 1 && (
              <ArrowRight className="md:hidden w-4 h-4 text-[#C4956A]/40 mt-6 rotate-90" />
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
