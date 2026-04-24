'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { UploadCloud, Zap, Download } from 'lucide-react';
import { HeadingReveal, TextReveal } from '@/components/ui/scroll-reveal'; // Text reveal animations

const steps = [
  { icon: UploadCloud, title: 'Upload Art', desc: 'Securely drop in your photography via our studio or direct API proxy. Fully encrypted, fully yours.' },
  { icon: Zap, title: 'Extract Essence', desc: 'Our engine detects the absolute micro-edges of the subject, isolating it with breathtaking precision.' },
  { icon: Download, title: 'Retrieve Magic', desc: 'Instantly download your uncompressed, perfectly transparent asset. Your art, unbound from its background.' },
];

function ContinuousStepCard({ step, index }: { step: typeof steps[0], index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: cardRef, offset: ["0 1", "0.6 0.8"] });

  const y = useTransform(scrollYProgress, [0, 1], [300, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [40, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.6, 1]);

  return (
    <motion.div ref={cardRef} style={{ y, opacity, rotateX, scale }} className="relative transform-gpu flex-1">
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
      <div className="relative z-10 pt-16" style={{ marginTop: index % 2 !== 0 ? '6rem' : '0' }}>
        <div className="absolute -top-10 left-8 text-[8rem] font-display font-extrabold text-[#C4956A] opacity-[0.07] select-none z-0 tracking-tighter drop-shadow-lg">
          0{index + 1}
        </div>
        
        <div className="glass3d p-12 h-full border border-[#8B5E3C]/15 group hover:border-[#8B5E3C]/40 hover:shadow-[0_0_60px_rgba(139,94,60,0.2)] transition-all duration-700 relative z-10 pt-16">
          <div className="w-20 h-20 rounded-2xl bg-[#1A0E08] border border-[#8B5E3C]/30 flex items-center justify-center shadow-[0_0_20px_rgba(232,185,138,0.15)] mb-10 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
            <step.icon className="w-10 h-10 text-[#E8B98A]" strokeWidth={1.5} />
          </div>
          <h3 className="font-display text-3xl font-bold text-white mb-6 drop-shadow-md">{step.title}</h3>
          <p className="text-lg text-[#BFA899] font-light leading-relaxed">
            {step.desc}
          </p>
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

  const headerY = useTransform(scrollYProgress, [0, 0.4], [150, 0]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);

  return (
    <section ref={sectionRef} className="py-32 md:py-56 px-6 md:px-16 overflow-hidden [perspective:2500px] bg-[#0C0806]/50">
      <div className="max-w-[1280px] mx-auto">
        <motion.div style={{ y: headerY, opacity: headerOpacity }} className="text-center mb-32 md:mb-48 transform-gpu">
          <span className="font-mono text-[11px] tracking-[0.5em] uppercase text-[#E8B98A] mb-6 block drop-shadow-[0_0_10px_rgba(232,185,138,0.5)]">
            The Flow
          </span>
          <h2 className="font-display text-5xl md:text-7xl lg:text-8xl font-extrabold text-white max-w-4xl mx-auto leading-tight drop-shadow-2xl">
            <HeadingReveal>Beautifully fluid.</HeadingReveal><br/>
            <span className="italic font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#C4956A] to-[#8B5E3C] drop-shadow-none">
              <HeadingReveal delay={0.25}>Brutally fast.</HeadingReveal>
            </span>
          </h2>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-16 lg:gap-8">
          {steps.map((step, i) => (
            <ContinuousStepCard key={i} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
