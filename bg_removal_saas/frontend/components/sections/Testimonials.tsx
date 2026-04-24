'use client';

import { useRef } from 'react';
import { Star, Quote } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  { quote: 'We integrated the VCranks API into our CMS upload pipeline. It completely eliminated thousands of hours of manual catalog processing.', name: 'Sarah Jenkins', role: 'Creative Director, NeoBrand', stars: 5 },
  { quote: 'The semantic isolation on stray hair and transparent fabrics is unmatched. Better than Adobe\'s native tools, and infinitely faster via the web.', name: 'Marcus Wei', role: 'Lead Photographer', stars: 5 },
  { quote: 'Sub-second processing at full resolution? We ran 40,000 SKU images through the API in a single afternoon. Insane throughput.', name: 'Priya Sharma', role: 'Head of Ops, LuxeRetail', stars: 5 },
  { quote: 'The edge-case handling is what sold us. Glass bottles, mesh fabric, smoke — it just handles everything without artifacts.', name: 'Tomás Rivera', role: 'Product Designer', stars: 5 },
];

export function Testimonials() {
  const container = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    // Pin the entire container covering the screen
    ScrollTrigger.create({
      trigger: container.current,
      start: "top top",
      end: "+=400%", // Scroll depth determined by 4 panels
      pin: true,
      animation: gsap.timeline() // Create staggered intro/outro GSAP timeline
        .to(cardsRef.current[0], { opacity: 0, scale: 0.9, y: -50, duration: 1 }, 1) // Phase 1: Card 0 leaves
        .fromTo(cardsRef.current[1], { y: '100vh', opacity: 0, scale: 1.1 }, { y: '0vh', opacity: 1, scale: 1, duration: 1 }, 1) // Phase 1: Card 1 enters
        .to(cardsRef.current[1], { opacity: 0, scale: 0.9, y: -50, duration: 1 }, 2) // Phase 2: Card 1 leaves
        .fromTo(cardsRef.current[2], { y: '100vh', opacity: 0, scale: 1.1 }, { y: '0vh', opacity: 1, scale: 1, duration: 1 }, 2) // Phase 2: Card 2 enters
        .to(cardsRef.current[2], { opacity: 0, scale: 0.9, y: -50, duration: 1 }, 3) // Phase 3: Card 2 leaves
        .fromTo(cardsRef.current[3], { y: '100vh', opacity: 0, scale: 1.1 }, { y: '0vh', opacity: 1, scale: 1, duration: 1 }, 3), // Phase 3: Card 3 enters
      scrub: 1, // Buttery smooth interpolation like Oryzo
    });
  }, { scope: container });

  return (
    <section ref={container} className="h-screen w-full overflow-hidden bg-transparent">
      
      {/* Intro Background Text — Stays behind the cards */}
      <div className="absolute inset-0 flex flex-col justify-start pt-[10vh] items-center pointer-events-none z-[1] select-none">
        <span className="font-mono text-[12px] tracking-[0.5em] uppercase text-[#E8B98A] mb-4">
          Community
        </span>
        <h2 className="font-display text-6xl md:text-[8rem] font-extrabold text-[#C4956A]/10 leading-none text-center">
          TRUSTED BY
        </h2>
      </div>

      <div className="relative w-full h-full max-w-[1280px] mx-auto px-6 md:px-16 flex items-center justify-center">
        {testimonials.map((t, i) => (
          <div
            key={i}
            ref={(el) => { cardsRef.current[i] = el; }}
            className={`absolute w-full px-6 flex justify-center items-center ${i === 0 ? 'z-10' : 'z-20'}`}
            style={{ 
              opacity: i === 0 ? 1 : 0, 
              transform: i === 0 ? 'translateY(0vh)' : 'translateY(100vh)' 
            }}
          >
            <div className="w-full max-w-4xl glass3d p-12 md:p-24 border border-[#8B5E3C]/15 relative overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] backdrop-blur-2xl bg-[#0C0806]/80">
              
              <div className="absolute top-0 right-0 opacity-[0.02] transform translate-x-1/4 -translate-y-1/4">
                <Quote className="w-[400px] h-[400px] text-[#C4956A]" />
              </div>

              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex gap-2">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-[#E8B98A] fill-[#E8B98A]" />
                  ))}
                </div>
                <Quote className="w-10 h-10 text-[#8B5E3C]/30" />
              </div>

              <p className="text-3xl md:text-5xl font-display font-medium text-white/95 leading-tight mb-16 flex-1 relative z-10 drop-shadow-lg">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-6 pt-8 border-t border-[#8B5E3C]/15 relative z-10">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8B5E3C] to-[#C4956A] flex items-center justify-center text-white font-display font-bold text-2xl shadow-lg">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xl font-bold text-white tracking-wide">{t.name}</p>
                  <p className="text-base font-mono text-[#E8B98A]/80 mt-1">{t.role}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
