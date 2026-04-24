'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { UploadCloud, Cpu, Download } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

const steps = [
  { num: '01', icon: <UploadCloud className="w-6 h-6" />, title: 'Drop Your Media', desc: 'Upload any image via our web interface or REST API. We support RAW, JPEG, PNG, and WebP natively.' },
  { num: '02', icon: <Cpu className="w-6 h-6" />, title: 'Neural Isolation', desc: 'Our U-Net array semantically dissects foreground layers with sub-pixel accuracy in under 300ms.' },
  { num: '03', icon: <Download className="w-6 h-6" />, title: 'Export Pristine', desc: 'Instantly retrieve your asset at full original resolution. Zero compression, zero quality loss.' },
];

export function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-28 md:py-40 px-6 md:px-16 bg-[#0A0A0F] relative overflow-hidden">
      <div className="max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease }}
          className="text-center mb-20"
        >
          <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#FF6B35] mb-4 block">The Mechanism</span>
          <h2 className="font-display text-4xl md:text-6xl font-extrabold text-white">
            Three steps to <span className="italic font-medium text-[#00E5C3]">clarity.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting line (desktop only) */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.5, delay: 0.5, ease }}
            className="hidden md:block absolute top-[3.25rem] left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent origin-left"
          />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.3 + i * 0.15, ease }}
              className="flex flex-col items-center text-center group"
            >
              {/* Number Circle */}
              <div className="relative mb-8">
                <div className="w-16 h-16 rounded-full border border-white/10 bg-[#111118] flex items-center justify-center text-white/30 group-hover:border-[#6C63FF]/50 group-hover:text-[#6C63FF] transition-all duration-500">
                  {step.icon}
                </div>
                <span className="absolute -top-2 -right-2 font-mono text-[10px] font-bold text-[#6C63FF] bg-[#0A0A0F] px-1.5 py-0.5 rounded-full border border-white/[0.06]">{step.num}</span>
              </div>

              <h3 className="font-display text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-sm text-[#8B8A97] leading-relaxed max-w-xs">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
