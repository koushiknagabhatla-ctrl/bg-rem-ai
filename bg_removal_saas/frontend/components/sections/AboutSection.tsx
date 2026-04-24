'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { HeadingReveal, TextReveal } from '@/components/ui/scroll-reveal'; // Text reveal animations

const values = [
  { label: 'Obsessive Detail', value: 'We don’t just erase backgrounds. We evaluate every single pixel to ensure your subject remains perfectly untouched, exactly as you captured it.' },
  { label: 'Uncompromised Quality', value: 'No arbitrary scaling. No muddy artifacts. When you upload a 4K image, you get a pristine 4K cutout in return. We preserve your art.' },
  { label: 'Absolute Privacy', value: 'Your imagery is your intellectual property. Operations happen entirely in volatile memory so nothing is ever saved to our drives. Truly yours.' },
  { label: 'Infinite Capacity', value: 'A one-time hobbyist or a massive e-comm studio uploading fifty-thousand shots tonight? It doesn’t matter. It all just works.' },
];

function ContinuousValueCard({ v, index }: { v: typeof values[0], index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: cardRef, offset: ["0 1", "0.6 0.8"] });

  const y = useTransform(scrollYProgress, [0, 1], [150, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [30, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.75, 1]);

  return (
    <motion.div
      ref={cardRef}
      style={{ y, opacity, rotateX, scale }}
      className="glass3d p-10 border border-[#8B5E3C]/10 group hover:border-[#8B5E3C]/30 transition-colors duration-700 transform-gpu"
    >
      <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-[#C4956A] mb-5 block group-hover:text-white transition-colors duration-500">{v.label}</span>
      <p className="text-lg text-[#BFA899]/90 font-light leading-relaxed">
        {/* We use TextReveal locally for a slight stagger effect on the text itself */}
        <TextReveal delay={0.1}>{v.value}</TextReveal>
      </p>
    </motion.div>
  );
}

export function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const headerY = useTransform(scrollYProgress, [0, 0.4], [150, 0]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);
  const leftY = useTransform(scrollYProgress, [0.1, 0.6], [200, 0]);
  const leftRotate = useTransform(scrollYProgress, [0.1, 0.6], [-10, 0]);
  const leftScale = useTransform(scrollYProgress, [0.1, 0.6], [0.8, 1]);

  return (
    <section ref={sectionRef} id="about" className="py-32 md:py-56 px-6 md:px-16 relative overflow-hidden [perspective:2500px]">
      <div className="max-w-[1280px] mx-auto relative z-10">
        
        {/* Section Header */}
        <motion.div style={{ y: headerY, opacity: headerOpacity }} className="mb-32 transform-gpu">
          <span className="font-mono text-[11px] tracking-[0.5em] uppercase text-[#E8B98A] mb-6 block drop-shadow-[0_0_10px_rgba(232,185,138,0.5)]">
            Our Foundation
          </span>
          <h2 className="font-display text-5xl md:text-7xl lg:text-8xl font-extrabold text-white leading-tight max-w-4xl mb-8 drop-shadow-2xl">
            <HeadingReveal>Built different.</HeadingReveal><br/>
            <span className="italic font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#C4956A] to-[#8B5E3C] drop-shadow-none">
              <HeadingReveal delay={0.25}>On purpose.</HeadingReveal>
            </span>
          </h2>
          <div className="text-xl md:text-2xl text-[#BFA899] font-light max-w-2xl leading-relaxed drop-shadow-sm">
            <TextReveal delay={0.5}>
              We grew exhausted by tools that degraded our images. So we engineered a platform that treats every single pixel with obsessive respect.
            </TextReveal>
          </div>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          
          {/* Left: Mission Statement in massive glass card */}
          <motion.div style={{ y: leftY, rotateY: leftRotate, scale: leftScale }} className="transform-gpu sticky top-40">
            <div className="glass3d p-12 md:p-16 lg:p-20 border border-[#8B5E3C]/20 relative overflow-hidden shadow-[0_0_80px_rgba(139,94,60,0.15)] group hover:border-[#8B5E3C]/40 transition-colors duration-1000">
              
              <div className="absolute -top-16 -right-16 opacity-[0.02] pointer-events-none select-none group-hover:opacity-[0.04] transition-opacity duration-1000">
                <span className="font-display text-[16rem] font-extrabold text-[#C4956A]">V</span>
              </div>
              
              <span className="font-mono text-[11px] tracking-[0.4em] uppercase text-[#C4956A] mb-10 block">The Catalyst</span>
              <h3 className="font-display text-4xl md:text-5xl font-bold text-white mb-10 leading-tight">
                Created by creators who <br/> demanded <span className="italic text-[#C4956A]">perfection.</span>
              </h3>
              
              <p className="text-lg md:text-xl text-[#BFA899] font-light leading-relaxed mb-8">
                Every tool we used failed on the edges. Hair vanished, glass reflections were eaten alive, and transparent fabrics morphed into opaque blocks. It ruined the art.
              </p>
              <p className="text-lg md:text-xl text-[#BFA899] font-light leading-relaxed">
                VCranks AI is the cure. We abandoned shortcuts and spent thousands of hours refining a custom approach just to get the hardest, most complex edges correct.
              </p>
              
            </div>
          </motion.div>

          {/* Right: Values Grid with staggered physical margins for extreme one-by-one scale reveals */}
          <div className="flex flex-col gap-10 md:gap-16 pt-10">
            {values.map((v, i) => (
              <ContinuousValueCard key={i} v={v} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
