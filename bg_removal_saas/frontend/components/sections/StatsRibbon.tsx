'use client';

import { motion } from 'framer-motion';
import { UploadCloud, Zap, Download, ChevronRight } from 'lucide-react';

const steps = [
  { icon: UploadCloud, title: 'Upload', desc: 'Drag and drop your photo — or paste from clipboard. We handle JPG, PNG, WebP, even RAW.' },
  { icon: Zap, title: 'AI Magic', desc: 'Our neural network analyzes depth, edges, and transparency in under 300 milliseconds.' },
  { icon: Download, title: 'Download', desc: 'Grab your transparent PNG — lossless, full resolution, ready for any project.' },
];

const ease = [0.16, 1, 0.3, 1] as const;

export function StatsRibbon() {
  return (
    <section className="relative py-20 md:py-28 px-6 md:px-16 overflow-hidden">
      
      {/* Section Header */}
      <motion.div 
        initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1.2, ease }}
        className="text-center mb-14 md:mb-18"
      >
        <span className="font-mono text-[11px] tracking-[0.5em] uppercase text-[#E8B98A]/80 mb-4 block">
          How it works
        </span>
        <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white leading-tight">
          Three steps. <span className="italic font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#C4956A] to-[#8B5E3C]">Zero friction.</span>
        </h2>
      </motion.div>

      {/* Steps Row */}
      <div className="max-w-[1100px] mx-auto relative">
        
        {/* Connecting line (desktop only) */}
        <div className="hidden md:block absolute top-[72px] left-[16.5%] right-[16.5%] z-0">
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.8, delay: 0.5, ease }}
            className="h-px bg-gradient-to-r from-[#8B5E3C]/30 via-[#C4956A]/25 to-[#8B5E3C]/30 origin-left"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 35, filter: 'blur(6px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.1, delay: i * 0.18, ease }}
              className="relative flex flex-col items-center text-center z-10 group"
            >
              {/* Step Number */}
              <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#C4956A]/50 mb-3">
                Step 0{i + 1}
              </span>

              {/* Icon Container with hover glow */}
              <div className="w-[72px] h-[72px] rounded-2xl bg-[#1A0E08]/70 backdrop-blur-md border border-[#8B5E3C]/20 flex items-center justify-center shadow-[0_0_20px_rgba(232,185,138,0.05)] mb-5 group-hover:border-[#C4956A]/35 group-hover:shadow-[0_0_35px_rgba(232,185,138,0.12)] transition-all duration-700">
                <step.icon className="w-7 h-7 text-[#E8B98A] group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
              </div>

              <h3 className="font-display text-lg md:text-xl font-bold text-white mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-[#BFA899]/80 font-light leading-relaxed max-w-[260px]">
                {step.desc}
              </p>

              {/* Arrow between steps (mobile only) */}
              {i < steps.length - 1 && (
                <ChevronRight className="md:hidden w-4 h-4 text-[#C4956A]/30 mt-5 rotate-90" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
