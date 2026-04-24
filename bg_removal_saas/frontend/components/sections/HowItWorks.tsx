'use client';

import { motion } from 'framer-motion';
import React from 'react';
import { UploadCloud, Cpu, Download } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

const steps = [
  { num: '01', icon: <UploadCloud />, title: 'Drop Your Media', desc: 'Upload any image via our web interface or REST API. We support RAW, JPEG, PNG, and WebP natively.' },
  { num: '02', icon: <Cpu />, title: 'Neural Isolation', desc: 'Our U-Net array semantically dissects foreground layers with sub-pixel accuracy in under 300ms.' },
  { num: '03', icon: <Download />, title: 'Export Pristine', desc: 'Instantly retrieve your asset at full original resolution. Zero compression, zero quality loss.' },
];

export function HowItWorks() {
  return (
    <section className="py-32 md:py-48 px-6 md:px-16 bg-[#120906] relative overflow-hidden [perspective:2000px]">
      <div className="max-w-[1280px] mx-auto z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 80, rotateX: 10 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease }}
          className="text-center mb-32 transform-gpu"
        >
          <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#E8B98A] mb-4 block drop-shadow-md">The Mechanism</span>
          <h2 className="font-display text-5xl md:text-7xl font-extrabold text-white drop-shadow-xl">
            Three steps to <span className="italic font-medium text-[#C4956A]">clarity.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting line (desktop only) */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.5, delay: 0.5, ease }}
            className="hidden md:block absolute top-[4.5rem] left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-transparent via-[#8B5E3C]/40 to-transparent origin-left z-0"
          />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 80, rotateX: 15, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 1.2, delay: 0.1 + i * 0.15, ease }}
              className="flex flex-col items-center text-center group transform-gpu z-10"
            >
              {/* Number Circle using glass3d visually */}
              <div className="relative mb-10 group-hover:-translate-y-2 transition-transform duration-500 ease-out">
                <div className="glass3d w-28 h-28 rounded-[2rem] flex items-center justify-center text-[#BFA899] group-hover:text-white group-hover:bg-[#8B5E3C]/20 border border-[#8B5E3C]/20 transition-all duration-500 shadow-xl shadow-[#0C0806]/50">
                  {React.cloneElement(step.icon as React.ReactElement, { className: 'w-8 h-8' })}
                </div>
                <span className="absolute -top-3 -right-3 font-mono text-xs font-bold text-[#1A0E08] bg-[#E8B98A] px-3 py-1.5 rounded-full shadow-lg border border-[#1A0E08]/20">{step.num}</span>
              </div>

              <h3 className="font-display text-3xl font-bold text-white mb-4 tracking-tight drop-shadow-md">{step.title}</h3>
              <p className="text-base text-[#BFA899] font-light leading-relaxed max-w-xs">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
