'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { UploadCloud, Zap, Download } from 'lucide-react';

const steps = [
  { icon: UploadCloud, title: 'Upload Asset', desc: 'Securely upload via the UI or API. Files are encrypted in transit.' },
  { icon: Zap, title: 'Neural Compute', desc: 'Our U-Net architecture isolates the subject with sub-pixel edge fidelity.' },
  { icon: Download, title: 'Retrieve Source', desc: 'Download your high-resolution asset instantly. No downsampling.' },
];

function ContinuousStepCard({ step, index }: { step: typeof steps[0], index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: cardRef, offset: ["0 1", "0.5 0.7"] });

  const y = useTransform(scrollYProgress, [0, 1], [150, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [15, 0]);

  return (
    <motion.div ref={cardRef} style={{ y, opacity, rotateX }} className="relative transform-gpu flex-1">
      {/* Connecting Line between steps (hidden on mobile) */}
      {index !== steps.length - 1 && (
        <div className="hidden lg:block absolute top-[50%] left-[80%] w-[50%] h-[1px] -translate-y-1/2 z-0">
          <div className="absolute inset-0 bg-[#8B5E3C]/20 border-t border-dashed border-[#C4956A]/30" />
          <motion.div 
            animate={{ x: ['-100%', '100%'] }} 
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-[#E8B98A] to-transparent opacity-40" 
          />
        </div>
      )}

      {/* Card */}
      <div className="relative z-10">
        <div className="absolute -top-6 left-10 text-[6rem] font-display font-extrabold text-[#C4956A] opacity-10 select-none z-0">
          0{index + 1}
        </div>
        
        <div className="glass3d p-10 h-full border border-[#8B5E3C]/15 group hover:border-[#8B5E3C]/30 transition-colors duration-500 relative z-10 pt-16">
          <div className="w-16 h-16 rounded-2xl bg-[#1A0E08] border border-[#8B5E3C]/30 flex items-center justify-center shadow-lg shadow-[#8B5E3C]/10 mb-8 transform group-hover:scale-110 transition-transform duration-500">
            <step.icon className="w-8 h-8 text-[#E8B98A]" strokeWidth={1.5} />
          </div>
          <h3 className="font-display text-2xl font-bold text-white mb-4">{step.title}</h3>
          <p className="text-[#BFA899] font-light leading-relaxed">{step.desc}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function HowItWorks() {
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
        <motion.div style={{ y: headerY, opacity: headerOpacity }} className="text-center mb-24 md:mb-32 transform-gpu">
          <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#E8B98A] mb-4 block">Workflow</span>
          <h2 className="font-display text-5xl md:text-7xl font-extrabold text-white max-w-4xl mx-auto leading-tight">
            Seamless integration. <br className="hidden md:block" />
            <span className="italic font-medium text-[#8B5E3C]">Uncompromising speed.</span>
          </h2>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-8">
          {steps.map((step, i) => (
            <ContinuousStepCard key={i} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
