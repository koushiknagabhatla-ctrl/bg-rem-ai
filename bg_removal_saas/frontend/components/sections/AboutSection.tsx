'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const ease = [0.16, 1, 0.3, 1] as const;

const values = [
  { label: 'Neural Precision', value: 'Our custom U-Net architecture was trained exclusively on the P3M-10K dataset, producing sub-pixel alpha mattes that rival professional manual cutouts.' },
  { label: 'Zero Compromise', value: 'We never downscale your images. Every pixel of your original resolution is preserved through our INT8 ONNX inference pipeline.' },
  { label: 'Privacy First', value: 'All processing happens in encrypted memory buffers. Your images are never written to disk, never logged, never stored. Full data sovereignty.' },
  { label: 'Built to Scale', value: 'Distributed across Vercel Edge and Render infrastructure. Process 40,000+ images per day without breaking a sweat.' },
];

export function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const headerY = useTransform(scrollYProgress, [0, 0.3], [100, 0]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const leftY = useTransform(scrollYProgress, [0.1, 0.5], [60, 0]);
  const rightY = useTransform(scrollYProgress, [0.15, 0.55], [80, 0]);

  return (
    <section ref={sectionRef} id="about" className="py-32 md:py-48 px-6 md:px-16 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-[#8B5E3C]/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto relative z-10">
        {/* Section Header */}
        <motion.div style={{ y: headerY, opacity: headerOpacity }} className="mb-24 transform-gpu">
          <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#E8B98A] mb-6 block">About VCranks</span>
          <h2 className="font-display text-5xl md:text-7xl font-extrabold text-white leading-tight max-w-4xl mb-8">
            Not another <span className="italic font-medium text-[#8B5E3C]">remove.bg clone.</span>
          </h2>
          <p className="text-xl text-[#BFA899] font-light max-w-2xl leading-relaxed">
            We built a custom neural pipeline from the ground up. Every layer of this system — from the training data to the inference engine — was designed for one thing: absolute fidelity.
          </p>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: Mission Statement in glass */}
          <motion.div style={{ y: leftY }} className="transform-gpu">
            <div className="glass3d p-12 md:p-16 border border-[#8B5E3C]/20 relative overflow-hidden">
              {/* Background watermark */}
              <div className="absolute -top-8 -right-8 opacity-[0.03] pointer-events-none select-none">
                <span className="font-display text-[12rem] font-extrabold text-[#C4956A]">V</span>
              </div>
              
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#C4956A] mb-8 block">Our Philosophy</span>
              <h3 className="font-display text-3xl md:text-4xl font-bold text-white mb-8 leading-tight">
                Built by engineers who were <span className="italic text-[#C4956A]">tired of bad tools.</span>
              </h3>
              <p className="text-base text-[#BFA899] font-light leading-relaxed mb-8">
                Every background removal tool we tried failed on the edges. Literally. Hair strands vanished, glass reflections got eaten, and transparent fabrics became opaque blocks. So we built our own.
              </p>
              <p className="text-base text-[#BFA899] font-light leading-relaxed">
                VCranks AI is a culmination of hundreds of hours of training, optimization, and real-world testing on the hardest edge cases in professional photography.
              </p>
              
              <div className="mt-12 pt-8 border-t border-[#8B5E3C]/15 flex items-center gap-4">
                <span className="text-4xl font-display font-extrabold text-[#E8B98A]">98.7%</span>
                <span className="text-sm text-[#BFA899] font-light">IoU accuracy on<br/>P3M-10K validation set</span>
              </div>
            </div>
          </motion.div>

          {/* Right: Values Grid */}
          <motion.div style={{ y: rightY }} className="flex flex-col gap-6 transform-gpu">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 1, delay: i * 0.1, ease }}
                className="glass3d p-8 border border-[#8B5E3C]/10 group hover:border-[#8B5E3C]/30 transition-colors duration-500"
              >
                <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#E8B98A] mb-4 block group-hover:text-white transition-colors duration-300">{v.label}</span>
                <p className="text-base text-[#BFA899] font-light leading-relaxed">{v.value}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
