'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Star, Quote } from 'lucide-react';
import { HeadingReveal, TextReveal } from '@/components/ui/scroll-reveal'; // Using the text reveal utility

const testimonials = [
  { quote: 'It feels like having an invisible retoucher on staff. The precision on difficult edges like flyaway hair is simply breathtaking. We’ve stopped worrying about complex shoots.', name: 'Sarah Jenkins', role: 'Creative Director', stars: 5 },
  { quote: 'I used to dread shooting products on complex backgrounds. VCranks completely isolates the subject perfectly, preserving the soft natural lighting and transparent details without harsh cuts.', name: 'Marcus Wei', role: 'Lead Photographer', stars: 5 },
  { quote: 'The speed is what makes it magical. We process thousands of high-res images directly in the browser and the cutouts are flawless every single time. It changed our entire workflow.', name: 'Priya Sharma', role: 'Studio Manager', stars: 5 },
  { quote: 'Finally, a tool that actually understands depth and light. Glass bottles, mesh fabrics, smoke — it doesn’t matter. It isolates them beautifully, keeping every subtle reflection intact.', name: 'Tomás Rivera', role: 'Visual Artist', stars: 5 },
];

function CinematicTestimonialCard({ t, index, scrollYProgress }: { t: typeof testimonials[0], index: number, scrollYProgress: any }) {
  // We divide the overall section progress (0 to 1) into 4 distinct chunks, one for each card
  const start = index * 0.2;
  const end = start + 0.35; // Slight overlap for smooth cinematic flow

  const y = useTransform(scrollYProgress, [start, end], [300, 0]);
  const opacity = useTransform(scrollYProgress, [start, end - 0.1], [0, 1]);
  const rotateX = useTransform(scrollYProgress, [start, end], [45, 0]);
  // Incredible cinematic 3D perspective — pulling them from deep inside the screen to the front
  const scale = useTransform(scrollYProgress, [start, end], [0.4, 1]);
  const rotateY = useTransform(scrollYProgress, [start, end], [index % 2 === 0 ? -15 : 15, 0]);

  return (
    <motion.div
      style={{ y, opacity, rotateX, scale, rotateY }}
      className="glass3d p-10 md:p-12 flex flex-col justify-between h-full border border-[#8B5E3C]/15 transform-gpu group hover:border-[#8B5E3C]/40 transition-all duration-700 hover:shadow-[0_0_50px_rgba(196,149,106,0.15)] relative overflow-hidden"
    >
      <div className="absolute -inset-x-0 -top-40 h-[200%] bg-gradient-to-b from-transparent via-white/5 to-transparent -rotate-45 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-[1500ms] ease-in-out pointer-events-none" />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex gap-1.5">
          {Array.from({ length: t.stars }).map((_, j) => (
            <Star key={j} className="w-4 h-4 text-[#E8B98A] fill-[#E8B98A]" />
          ))}
        </div>
        <Quote className="w-8 h-8 text-[#8B5E3C]/20 group-hover:text-[#8B5E3C]/40 transition-colors duration-500" />
      </div>

      <p className="text-xl md:text-2xl font-display font-medium text-white/95 leading-relaxed mb-10 flex-1 relative z-10 drop-shadow-md">
        &ldquo;{t.quote}&rdquo;
      </p>

      <div className="flex items-center gap-5 pt-6 border-t border-[#8B5E3C]/15 relative z-10">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8B5E3C] to-[#C4956A] flex items-center justify-center text-white font-display font-bold text-lg shadow-[0_0_15px_rgba(196,149,106,0.4)]">
          {t.name.charAt(0)}
        </div>
        <div>
          <p className="text-base font-semibold text-white tracking-wide drop-shadow-sm">{t.name}</p>
          <p className="text-sm font-mono text-[#E8B98A]/70 mt-1">{t.role}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function Testimonials() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    // Extremely tall offset so the user has to scroll deep into the section to reveal all 4
    offset: ["0 1", "1 0.7"] 
  });

  const headerY = useTransform(scrollYProgress, [0, 0.2], [100, 0]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.15], [0, 1]);

  return (
    <section ref={sectionRef} className="py-40 md:py-64 px-6 md:px-16 relative overflow-hidden [perspective:2500px]">
      <div className="max-w-[1280px] mx-auto">
        <motion.div
          style={{ y: headerY, opacity: headerOpacity }}
          className="text-center mb-32 transform-gpu"
        >
          <span className="font-mono text-[11px] tracking-[0.5em] uppercase text-[#E8B98A] mb-6 block drop-shadow-[0_0_10px_rgba(232,185,138,0.5)]">
            Community
          </span>
          <h2 className="font-display text-5xl md:text-7xl lg:text-8xl font-extrabold text-white max-w-5xl mx-auto leading-tight drop-shadow-2xl">
            Adored by top-tier <br/>
            <span className="italic font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#C4956A] to-[#8B5E3C] drop-shadow-none">creative visionaries.</span>
          </h2>
        </motion.div>

        {/* Instead of a tight grid that shows them all at once, we use a staggered offset grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 pt-10">
          <div className="flex flex-col gap-10 md:gap-32">
            {/* Left column items */}
            {testimonials.filter((_, i) => i % 2 === 0).map((t, i) => (
              <CinematicTestimonialCard key={i * 2} t={t} index={i * 2} scrollYProgress={scrollYProgress} />
            ))}
          </div>
          <div className="flex flex-col gap-10 md:gap-32 md:mt-48">
            {/* Right column items - physically offset to allow true one-by-one staggering */}
            {testimonials.filter((_, i) => i % 2 !== 0).map((t, i) => (
              <CinematicTestimonialCard key={i * 2 + 1} t={t} index={i * 2 + 1} scrollYProgress={scrollYProgress} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
