'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ImageComparisonSlider } from '@/components/ui/image-comparison-slider';

const ease = [0.16, 1, 0.3, 1] as const;

export function BeforeAfter() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["0 1", "0.5 0.7"]
  });

  const cardX = useTransform(scrollYProgress, [0, 1], ["-50vw", "0vw"]);
  const cardRotateX = useTransform(scrollYProgress, [0, 1], [15, 0]);
  const cardScale = useTransform(scrollYProgress, [0, 1], [0.7, 1]);
  const cardOpacity = useTransform(scrollYProgress, [0, 0.8], [0, 1]);
  
  const headerY = useTransform(scrollYProgress, [0, 0.5], [60, 0]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);

  return (
    <section ref={sectionRef} id="demo" className="relative py-32 md:py-48 px-6 md:px-16 overflow-hidden [perspective:1500px]">
      <div className="max-w-[1280px] mx-auto relative z-10">
        
        {/* Header */}
        <motion.div
          style={{ y: headerY, opacity: headerOpacity }}
          className="mb-20 text-center transform-gpu"
        >
          <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#E8B98A] mb-6 block">Product Showcase</span>
          <h2 className="font-display text-5xl md:text-7xl font-extrabold text-white leading-tight max-w-4xl mx-auto mb-6">
            Micro-level precision. <br />
            <span className="text-[#8B5E3C] italic font-medium">Even on complex subjects.</span>
          </h2>
          <p className="text-lg text-[#BFA899] font-light max-w-xl mx-auto leading-relaxed">
            Stray hairs, transparent fabrics, complex edges — resolved at sub-pixel precision in under 300ms.
          </p>
        </motion.div>

        {/* Single large comparison card with 3D reveal */}
        <motion.div
          style={{ x: cardX, rotateX: cardRotateX, scale: cardScale, opacity: cardOpacity }}
          className="glass3d p-4 md:p-6 rounded-3xl border border-[#8B5E3C]/20 shadow-2xl shadow-black/50 transform-gpu max-w-5xl mx-auto overflow-hidden"
        >
          <div className="w-full h-[50vh] md:h-[70vh] rounded-2xl overflow-hidden bg-[#1A0E08]">
              <ImageComparisonSlider
                leftImage="/images/car_original.jpg"
                rightImage="/images/car_removed.png"
                altLeft="Original Photo"
                altRight="Background Removed"
              />
          </div>

          {/* Bottom info strip */}
          <div className="flex items-center justify-between mt-4 px-2">
            <div className="flex items-center gap-3">
              <div className="glass3d px-4 py-2 rounded-full border border-[#8B5E3C]/20 flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-[#E8B98A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span className="text-[10px] font-semibold tracking-widest uppercase text-[#BFA899]">Drag to compare</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#6B5B50]">4K Resolution</span>
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#6B5B50]">•</span>
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#6B5B50]">0.3s Process</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
