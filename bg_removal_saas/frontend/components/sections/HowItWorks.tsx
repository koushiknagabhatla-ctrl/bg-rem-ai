'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { UploadCloud, Cpu, Download } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

const steps = [
  { num: '01', icon: <UploadCloud />, title: 'Drop Your Media', desc: 'Upload any image via our web interface or REST API. We support RAW, JPEG, PNG, and WebP natively.' },
  { num: '02', icon: <Cpu />, title: 'Neural Isolation', desc: 'Our U-Net array semantically dissects foreground layers with sub-pixel accuracy in under 300ms.' },
  { num: '03', icon: <Download />, title: 'Export Pristine', desc: 'Instantly retrieve your asset at full original resolution. Zero compression, zero quality loss.' },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const headerY = useTransform(scrollYProgress, [0, 0.4], [80, 0]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);
  const lineScale = useTransform(scrollYProgress, [0.15, 0.6], [0, 1]);

  return (
    <section ref={sectionRef} className="py-32 md:py-48 px-6 md:px-16 relative overflow-hidden [perspective:2000px]">
      <div className="max-w-[1280px] mx-auto z-10 relative">
        <motion.div
          style={{ y: headerY, opacity: headerOpacity }}
          className="text-center mb-32 transform-gpu"
        >
          <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#E8B98A] mb-4 block">The Mechanism</span>
          <h2 className="font-display text-5xl md:text-7xl font-extrabold text-white">
            Three steps to <span className="italic font-medium text-[#C4956A]">clarity.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
          {/* Connecting line (desktop only) */}
          <motion.div
            style={{ scaleX: lineScale }}
            className="hidden md:block absolute top-[5.5rem] left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-transparent via-[#8B5E3C]/40 to-transparent origin-left z-[1]"
          />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 80, rotateX: 15 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.2, delay: 0.1 + i * 0.15, ease }}
              className="flex flex-col items-center text-center group transform-gpu z-10"
            >
              {/* Number ABOVE the glass card - high z-index, sits on top */}
              <div className="relative z-30 mb-[-1.5rem]">
                <span className="font-mono text-[11px] font-bold text-[#1A0E08] bg-[#E8B98A] px-4 py-2 rounded-full shadow-lg shadow-[#E8B98A]/20 border border-[#D4A574]/50">
                  {step.num}
                </span>
              </div>

              {/* Glass Icon Card */}
              <div className="glass3d w-32 h-32 rounded-[2rem] flex items-center justify-center text-[#BFA899] group-hover:text-white group-hover:bg-[#8B5E3C]/10 border border-[#8B5E3C]/20 transition-all duration-500 shadow-xl shadow-black/30 mb-10 group-hover:-translate-y-2 relative z-10">
                {React.cloneElement(step.icon as React.ReactElement, { className: 'w-9 h-9' })}
              </div>

              <h3 className="font-display text-3xl font-bold text-white mb-4 tracking-tight">{step.title}</h3>
              <p className="text-base text-[#BFA899] font-light leading-relaxed max-w-xs">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
