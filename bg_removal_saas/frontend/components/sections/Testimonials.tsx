'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  { 
    quote: <>We integrated the API into our pipeline. It completely <span className="text-[#E8B98A] font-bold drop-shadow-[0_0_15px_rgba(232,185,138,0.6)]">eliminated 4,000 hours</span> of catalog processing.</>, 
    name: 'Sarah Jenkins', 
    role: 'Creative Director',
    company: 'NeoBrand'
  },
  { 
    quote: <>The semantic isolation on stray hair is unmatched. <span className="text-[#E8B98A] font-bold drop-shadow-[0_0_15px_rgba(232,185,138,0.6)]">Infinitely faster</span> than native desktop tools.</>, 
    name: 'Marcus Wei', 
    role: 'Lead Photographer',
    company: 'Vogue Studios'
  },
  { 
    quote: <>Sub-second processing at full 4K resolution. We ran <span className="text-[#E8B98A] font-bold drop-shadow-[0_0_15px_rgba(232,185,138,0.6)]">40,000 SKU images</span> in a single afternoon.</>, 
    name: 'Priya Sharma', 
    role: 'Head of Ops',
    company: 'LuxeRetail'
  },
  { 
    quote: <>The edge-case accuracy sold us. Glass bottles to smoke, it handles everything with <span className="text-[#E8B98A] font-bold drop-shadow-[0_0_15px_rgba(232,185,138,0.6)]">zero artifacts.</span></>, 
    name: 'Tomás Rivera', 
    role: 'Product Designer',
    company: 'Visionary Co'
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

export function Testimonials() {
  return (
    <section id="testimonials" className="relative py-28 md:py-36 overflow-hidden bg-transparent z-10">
      
      {/* Cinematic Bronze Background Glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[50vw] h-[60vh] bg-[#C4956A]/5 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />

      <div className="w-full max-w-[1400px] mx-auto px-6 md:px-16">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.2, ease }}
          className="mb-16 md:mb-20"
        >
          <span className="font-mono text-xs tracking-[0.4em] uppercase text-[#E8B98A] mb-4 md:mb-6 block drop-shadow-md">
            Customer Stories
          </span>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight drop-shadow-2xl">
            Loved by the <br className="hidden md:block"/>world's <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#C4956A] to-[#8B5E3C] whitespace-nowrap">
              best creatives.
            </span>
          </h2>
        </motion.div>

        {/* Scrolling Testimonial Carousel */}
        <div className="relative overflow-hidden testimonial-container">
          <div className="testimonial-track gap-6">
            {/* Double the testimonials for infinite scroll */}
            {[...testimonials, ...testimonials].map((t, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[380px] md:w-[440px]"
              >
                <div className="group relative h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#8B5E3C]/0 via-[#8B5E3C]/0 to-[#C4956A]/10 rounded-[2rem] transition-all duration-700 blur-xl opacity-0 group-hover:opacity-100" />
                  
                  <div className="relative flex flex-col justify-between p-8 md:p-10 !rounded-[2rem] border border-[#8B5E3C]/15 glass3d bg-[#0A0604]/40 backdrop-blur-[48px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden h-full hover:border-[#8B5E3C]/30 transition-all duration-700">
                    
                    <Quote className="absolute top-8 right-8 w-16 h-16 text-[#C4956A]/[0.06] pointer-events-none" />

                    <p className="text-base md:text-lg font-display font-medium text-[#FFFFFF]/90 leading-[1.5] mb-8 relative z-10">
                      "{t.quote}"
                    </p>

                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#1F140D] to-[#0A0604] border border-[#8B5E3C]/40 flex items-center justify-center text-[#E8B98A] font-display font-bold text-base shadow-[0_0_15px_rgba(200,150,100,0.15)]">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white tracking-wide">{t.name}</p>
                        <p className="text-xs font-mono text-[#C4956A]/70 mt-0.5">{t.role}, {t.company}</p>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
