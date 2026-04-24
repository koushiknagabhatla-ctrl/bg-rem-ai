'use client';

import { motion, useInView, animate } from 'framer-motion';
import { useRef, useEffect } from 'react';
import { Shield, Zap, Eye, Brain, CloudLightning, Sliders } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

function Counter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (inView && ref.current) {
      const ctrl = animate(0, target, {
        duration: 2,
        ease: 'easeOut',
        onUpdate(v) { if (ref.current) ref.current.textContent = prefix + (Number.isInteger(target) ? Math.floor(v).toString() : v.toFixed(1)) + suffix; },
      });
      return () => ctrl.stop();
    }
  }, [inView, target, suffix, prefix]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
}

const features = [
  { icon: <Brain className="w-5 h-5" />, title: 'U-Net Architecture', desc: 'Modified MobileNetV3-Small trained on P3M-10K for human-centric semantic understanding.' },
  { icon: <Zap className="w-5 h-5" />, title: 'INT8 Quantization', desc: 'Entire network runs via ONNX INT8 inference. Bare-metal speed without melting your device.' },
  { icon: <Shield className="w-5 h-5" />, title: 'Zero Storage', desc: 'Fully encrypted in-memory buffers. We store absolutely nothing. Strict data sovereignty.' },
  { icon: <Sliders className="w-5 h-5" />, title: 'Full Resolution', desc: 'Images are never downscaled. Alpha mask perfectly matches your original pixel dimensions.' },
  { icon: <CloudLightning className="w-5 h-5" />, title: 'Edge Network', desc: 'Distributed globally across Vercel Edge infrastructure for virtually zero latency.' },
  { icon: <Eye className="w-5 h-5" />, title: 'Perfect Edges', desc: 'Complex gradients, transparent glass, motion blur, and fine hair extracted flawlessly.' },
];

export function Performance() {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: '-80px' });

  return (
    <section ref={sectionRef} className="py-28 md:py-40 px-6 md:px-16 bg-[#111118]">
      <div className="max-w-[1280px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease }}
          className="mb-20"
        >
          <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#00E5C3] mb-4 block">Performance</span>
          <h2 className="font-display text-4xl md:text-6xl font-extrabold text-white leading-tight max-w-4xl mb-6">
            Engineered <span className="italic font-medium text-white/30">without compromise.</span>
          </h2>
          <p className="text-lg text-[#8B8A97] max-w-2xl leading-relaxed">
            We bypassed third-party APIs and built a custom neural infrastructure aggressively optimized for edge computing.
          </p>
        </motion.div>

        {/* Stats Strip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.2, ease }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
        >
          <div className="text-center">
            <span className="text-4xl md:text-5xl font-display font-extrabold text-white block mb-2">
              <Counter target={0.3} suffix="s" />
            </span>
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#8B8A97]">Avg. Processing</span>
          </div>
          <div className="text-center border-x border-white/[0.04]">
            <span className="text-4xl md:text-5xl font-display font-extrabold text-white block mb-2">
              <Counter target={100} suffix="%" />
            </span>
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#8B8A97]">Resolution Preserved</span>
          </div>
          <div className="text-center">
            <span className="text-4xl md:text-5xl font-display font-extrabold text-white block mb-2">
              <Counter target={0} suffix="" />
            </span>
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#8B8A97]">Data Stored</span>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 + i * 0.08, ease }}
              className="card-surface p-8 group"
            >
              <div className="w-10 h-10 rounded-xl border border-white/[0.06] bg-white/[0.03] flex items-center justify-center text-[#6C63FF] mb-8 group-hover:bg-[#6C63FF]/10 transition-colors duration-500">
                {f.icon}
              </div>
              <h3 className="font-display text-lg font-bold text-white mb-3">{f.title}</h3>
              <p className="text-sm text-[#8B8A97] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
