'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ImageComparisonSlider } from '@/components/ui/image-comparison-slider';

const ease = [0.16, 1, 0.3, 1] as const;

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
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section id="demo" ref={sectionRef} className="py-28 md:py-40 px-6 md:px-16 bg-[#0A0A0F]">
      <div className="max-w-[1280px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease }}
          className="mb-20"
        >
          <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#6C63FF] mb-4 block">Product Showcase</span>
          <h2 className="font-display text-4xl md:text-6xl font-extrabold text-white leading-tight max-w-3xl">
            Micro-level precision. <br />
            <span className="text-white/30 italic font-medium">Even on complex subjects.</span>
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {demos.map((demo, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 60 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.15 * i, ease }}
              className="group"
            >
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/[0.06] bg-[#111118] shadow-xl mb-6">
                <ImageComparisonSlider
                  leftImage={demo.left}
                  rightImage={demo.right}
                  altLeft="Original"
                  altRight="Processed"
                />
              </div>
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#00E5C3] mb-2 block">{demo.label}</span>
              <h3 className="font-display text-xl font-bold text-white mb-2">{demo.title}</h3>
              <p className="text-sm text-[#8B8A97] leading-relaxed">{demo.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
