'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ImageComparisonSlider } from '@/components/ui/image-comparison-slider';

const demos = [
  {
    label: '01 — Portrait',
    title: 'Subject Isolation',
    desc: 'Stray hairs, transparent fabrics, complex edges — resolved at sub-pixel precision.',
    left: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80',
    right: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80&monochrome=101010',
  },
  {
    label: '02 — Product',
    title: 'E-Commerce Ready',
    desc: 'Hard metallic edges, glass reflections, and shadows isolated without pen-tool labor.',
    left: 'https://images.unsplash.com/photo-1549416878-b9ca95e26903?w=800&q=80',
    right: 'https://images.unsplash.com/photo-1549416878-b9ca95e26903?w=800&q=80&monochrome=101010',
  },
  {
    label: '03 — Complex',
    title: 'Foliage & Mesh',
    desc: 'Plant leaves, chainlink, lace — sub-pixel transparencies without ghosting artifacts.',
    left: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
    right: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80&monochrome=101010',
  },
];

export function BeforeAfter() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  // Maps the scroll of the 300vh container to a horizontal translation
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-66.66%"]);

  return (
    <section ref={targetRef} className="relative h-[300vh] bg-[#0C0806]">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center bg-[radial-gradient(ellipse_at_top,_rgba(139,94,60,0.1)_0%,_#0C0806_70%)]">
        
        {/* Fixed Header in sticky container */}
        <div className="absolute top-24 left-6 md:left-16 z-20 pointer-events-none">
          <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#E8B98A] mb-4 block drop-shadow-md">Product Showcase</span>
          <h2 className="font-display text-4xl md:text-6xl font-extrabold text-white leading-tight drop-shadow-xl max-w-xl">
             Micro-level precision.
          </h2>
        </div>

        {/* Slide Hint */}
         <div className="absolute top-24 right-6 md:right-16 z-20 hidden md:flex items-center gap-3 px-6 py-3 rounded-full border border-[#8B5E3C]/30 glass3d">
             <div className="w-8 h-8 rounded-full bg-[#1A0E08] border border-[#8B5E3C]/40 flex items-center justify-center pointer-events-auto">
                <svg className="w-4 h-4 text-[#E8B98A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
             </div>
             <span className="text-xs font-semibold tracking-widest uppercase text-[#BFA899]">Slide cards</span>
         </div>

        {/* Scrolling Track */}
        <motion.div style={{ x }} className="flex h-full w-[300vw] items-center pt-24 px-6 md:px-16 pb-12">
          {demos.map((demo, i) => (
            <div key={i} className="w-screen flex items-center justify-center px-4 md:px-20">
              <div className="glass3d p-4 md:p-6 rounded-3xl border border-[#8B5E3C]/20 w-full max-w-5xl flex flex-col md:flex-row gap-8 items-center shadow-2xl shadow-[#1A0E08]/50 overflow-hidden">
                
                {/* Text Block */}
                <div className="w-full md:w-1/3 p-4 shrink-0">
                  <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#C4956A] mb-4 block">{demo.label}</span>
                  <h3 className="font-display text-3xl font-bold text-white mb-4">{demo.title}</h3>
                  <p className="text-sm md:text-base text-[#BFA899] leading-relaxed font-light">{demo.desc}</p>
                </div>

                {/* Slider */}
                <div className="w-full md:w-2/3 h-[50vh] md:h-[65vh] rounded-2xl overflow-hidden shrink-0 border border-[#8B5E3C]/10 bg-[#1A0E08]">
                  <ImageComparisonSlider
                    leftImage={demo.left}
                    rightImage={demo.right}
                    altLeft="Original"
                    altRight="Processed"
                  />
                </div>

              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
