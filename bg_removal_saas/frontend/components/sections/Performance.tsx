'use client';

import React, { useRef, useEffect } from 'react';
import { motion, animate, useInView } from 'framer-motion';
import { Shield, Zap, Eye, Brain, CloudLightning, Sliders } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

function Counter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (inView && ref.current) {
      const ctrl = animate(0, target, {
        duration: 2.5,
        ease: 'easeOut',
        onUpdate(v) { if (ref.current) ref.current.textContent = prefix + (Number.isInteger(target) ? Math.floor(v).toString() : v.toFixed(1)) + suffix; },
      });
      return () => ctrl.stop();
    }
  }, [inView, target, suffix, prefix]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
}

const features = [
  { icon: <Brain />, title: 'U-Net Architecture', desc: 'Modified MobileNetV3-Small trained on P3M-10K for human-centric semantic understanding.' },
  { icon: <Zap />, title: 'INT8 Quantization', desc: 'Entire network runs via ONNX INT8 inference. Bare-metal speed without melting your device.' },
  { icon: <Shield />, title: 'Zero Storage', desc: 'Fully encrypted in-memory buffers. We store absolutely nothing. Strict data sovereignty.' },
  { icon: <Sliders />, title: 'Full Resolution', desc: 'Images are never downscaled. Alpha mask perfectly matches your original pixel dimensions.' },
  { icon: <CloudLightning />, title: 'Edge Network', desc: 'Distributed globally across Vercel Edge infrastructure for virtually zero latency.' },
  { icon: <Eye />, title: 'Perfect Edges', desc: 'Complex gradients, transparent glass, motion blur, and fine hair extracted flawlessly.' },
];

export function Performance() {
  const sectionRef = useRef(null);

  return (
    <section ref={sectionRef} className="py-32 md:py-48 px-6 md:px-16 bg-[#0C0806] relative overflow-hidden [perspective:2000px]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] max-w-[1500px] max-h-[1500px] bg-[radial-gradient(ellipse_at_center,_rgba(139,94,60,0.08)_0%,_transparent_60%)] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto relative z-10">
        
        {/* Header Block */}
        <motion.div
          initial={{ opacity: 0, y: 80, rotateX: 10, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease }}
          className="mb-24 text-center transform-gpu"
        >
          <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#E8B98A] mb-6 block drop-shadow-md">Architecture</span>
          <h2 className="font-display text-5xl md:text-7xl font-extrabold text-white leading-tight max-w-4xl mx-auto mb-8 drop-shadow-xl">
            Engineered <span className="italic font-medium text-[#8B5E3C]">without compromise.</span>
          </h2>
          <p className="text-xl md:text-2xl text-[#8B5E3C] font-light max-w-2xl mx-auto leading-relaxed">
            We bypassed third-party APIs and built a custom neural infrastructure aggressively optimized for edge computing.
          </p>
        </motion.div>

        {/* Floating Stats Panel */}
        <motion.div
          initial={{ opacity: 0, y: 100, rotateX: 15 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1.4, ease }}
          className="glass3d grid grid-cols-1 md:grid-cols-3 gap-8 mb-32 p-12 md:p-16 border border-[#8B5E3C]/30 shadow-[0_40px_100px_rgba(26,14,8,0.5)] transform-gpu"
        >
          <div className="text-center">
            <span className="text-6xl md:text-7xl font-display font-extrabold text-white block mb-4 drop-shadow-lg">
              <Counter target={0.3} suffix="s" />
            </span>
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#C4956A]">Avg. Processing</span>
          </div>
          <div className="text-center border-y md:border-y-0 md:border-x border-[#8B5E3C]/20 py-8 md:py-0">
            <span className="text-6xl md:text-7xl font-display font-extrabold text-[#E8B98A] block mb-4 drop-shadow-lg">
              <Counter target={100} suffix="%" />
            </span>
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#C4956A]">Resolution Preserved</span>
          </div>
          <div className="text-center">
            <span className="text-6xl md:text-7xl font-display font-extrabold text-white block mb-4 drop-shadow-lg">
              <Counter target={0} suffix="" />
            </span>
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#C4956A]">Data Stored</span>
          </div>
        </motion.div>

        {/* Feature Grid with staggering 3D reveals */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 60, rotateX: 10, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 1, delay: i * 0.1, ease }}
              className="glass3d p-10 hover:bg-[#1A0E08]/80 transition-colors duration-500 transform-gpu group border border-[#8B5E3C]/10"
            >
              <div className="w-14 h-14 rounded-2xl border border-[#8B5E3C]/30 bg-[#1A0E08] flex items-center justify-center text-[#D4A574] mb-8 group-hover:bg-[#8B5E3C] group-hover:text-white transition-all duration-500 shadow-xl group-hover:scale-110">
                {React.cloneElement(f.icon as React.ReactElement, { className: 'w-6 h-6' })}
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-4 tracking-tight">{f.title}</h3>
              <p className="text-sm text-[#BFA899] font-light leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
