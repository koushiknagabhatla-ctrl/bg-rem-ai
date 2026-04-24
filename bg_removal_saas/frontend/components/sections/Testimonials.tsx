'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Star } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

const testimonials = [
  { quote: 'We integrated the VCranks API into our CMS upload pipeline. It completely eliminated thousands of hours of manual catalog processing.', name: 'Sarah Jenkins', role: 'Creative Director, NeoBrand', stars: 5 },
  { quote: 'The semantic isolation on stray hair and transparent fabrics is unmatched. Better than Adobe\'s native tools, and infinitely faster via the web.', name: 'Marcus Wei', role: 'Lead Photographer', stars: 5 },
  { quote: 'Sub-second processing at full resolution? We ran 40,000 SKU images through the API in a single afternoon. Insane throughput.', name: 'Priya Sharma', role: 'Head of Ops, LuxeRetail', stars: 5 },
  { quote: 'The edge-case handling is what sold us. Glass bottles, mesh fabric, smoke — it just handles everything without artifacts.', name: 'Tomás Rivera', role: 'Product Designer', stars: 5 },
];

export function Testimonials() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-28 md:py-40 px-6 md:px-16 bg-[#0C0806] gradient-warm">
      <div className="max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease }}
          className="text-center mb-24"
        >
          <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#C4956A] mb-4 block">Testimonials</span>
          <h2 className="font-display text-4xl md:text-5xl font-extrabold text-white max-w-3xl mx-auto">
            Relied upon by demanding <span className="italic font-medium text-[#8B5E3C]">creative pipelines.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease }}
              className="glass3d p-10 md:p-12 flex flex-col justify-between h-full"
            >
              {/* Stars */}
              <div className="flex gap-1.5 mb-8">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-[#E8B98A] fill-[#E8B98A]" />
                ))}
              </div>

              <p className="text-xl md:text-2xl font-display font-medium text-white/90 leading-snug mb-10 flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-5 pt-6 border-t border-[#8B5E3C]/20">
                <div className="w-12 h-12 rounded-full bg-[#1A0E08] border border-[#8B5E3C]/30 flex items-center justify-center text-[#D4A574] font-display font-bold text-lg">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-base font-semibold text-white tracking-wide">{t.name}</p>
                  <p className="text-sm font-mono text-[#8B5E3C] mt-1">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
