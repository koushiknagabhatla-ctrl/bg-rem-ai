'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  { quote: 'We integrated the VCranks API into our CMS upload pipeline. It completely eliminated thousands of hours of manual catalog processing.', name: 'Sarah Jenkins', role: 'Creative Director, NeoBrand', stars: 5 },
  { quote: 'The semantic isolation on stray hair and transparent fabrics is unmatched. Better than Adobe\'s native tools, and infinitely faster via the web.', name: 'Marcus Wei', role: 'Lead Photographer', stars: 5 },
  { quote: 'Sub-second processing at full resolution? We ran 40,000 SKU images through the API in a single afternoon. Insane throughput.', name: 'Priya Sharma', role: 'Head of Ops, LuxeRetail', stars: 5 },
  { quote: 'The edge-case handling is what sold us. Glass bottles, mesh fabric, smoke — it just handles everything without artifacts.', name: 'Tomás Rivera', role: 'Product Designer', stars: 5 },
];

function ContinuousReviewCard({ t }: { t: typeof testimonials[0] }) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["0 1", "0.4 0.6"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [150, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [0, 1]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [30, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);

  return (
    <motion.div
      ref={cardRef}
      style={{ y, opacity, rotateX, scale }}
      className="glass3d p-10 md:p-12 flex flex-col justify-between h-full border border-[#8B5E3C]/15 transform-gpu group hover:border-[#8B5E3C]/30 transition-colors duration-500"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex gap-1.5">
          {Array.from({ length: t.stars }).map((_, j) => (
            <Star key={j} className="w-4 h-4 text-[#E8B98A] fill-[#E8B98A]" />
          ))}
        </div>
        <Quote className="w-8 h-8 text-[#8B5E3C]/20 group-hover:text-[#8B5E3C]/40 transition-colors duration-500" />
      </div>

      <p className="text-xl md:text-2xl font-display font-medium text-white/90 leading-snug mb-10 flex-1">
        &ldquo;{t.quote}&rdquo;
      </p>

      <div className="flex items-center gap-5 pt-6 border-t border-[#8B5E3C]/15">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8B5E3C] to-[#C4956A] flex items-center justify-center text-white font-display font-bold text-lg shadow-lg shadow-[#8B5E3C]/20">
          {t.name.charAt(0)}
        </div>
        <div>
          <p className="text-base font-semibold text-white tracking-wide">{t.name}</p>
          <p className="text-sm font-mono text-[#8B5E3C] mt-1">{t.role}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function Testimonials() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const headerY = useTransform(scrollYProgress, [0, 0.4], [100, 0]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);

  return (
    <section ref={sectionRef} className="py-32 md:py-48 px-6 md:px-16 relative overflow-hidden [perspective:2000px]">
      <div className="max-w-[1280px] mx-auto">
        <motion.div
          style={{ y: headerY, opacity: headerOpacity }}
          className="text-center mb-24 transform-gpu"
        >
          <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#E8B98A] mb-4 block">Testimonials</span>
          <h2 className="font-display text-5xl md:text-7xl font-extrabold text-white max-w-4xl mx-auto">
            Relied upon by demanding <span className="italic font-medium text-[#8B5E3C]">creative pipelines.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t, i) => (
            <ContinuousReviewCard key={i} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
