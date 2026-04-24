'use client';

import { useRef } from 'react';
import { Star, Quote } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  { quote: 'We integrated the VCranks API into our CMS upload pipeline. It completely eliminated thousands of hours of manual catalog processing.', name: 'Sarah Jenkins', role: 'Creative Director, NeoBrand', stars: 5, bg: 'bg-[#0A0705]' },
  { quote: 'The semantic isolation on stray hair and transparent fabrics is unmatched. Better than Adobe\'s native tools, and infinitely faster via the web.', name: 'Marcus Wei', role: 'Lead Photographer', stars: 5, bg: 'bg-[#120B08]' },
  { quote: 'Sub-second processing at full resolution? We ran 40,000 SKU images through the API in a single afternoon. Insane throughput.', name: 'Priya Sharma', role: 'Head of Ops, LuxeRetail', stars: 5, bg: 'bg-[#170E0A]' },
  { quote: 'The edge-case handling is what sold us. Glass bottles, mesh fabric, smoke — it just handles everything without artifacts.', name: 'Tomás Rivera', role: 'Product Designer', stars: 5, bg: 'bg-[#1C110C]' },
];

export function Testimonials() {
  const container = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    ScrollTrigger.create({
      trigger: container.current,
      start: "top top",
      end: "+=400%", // Scroll depth determined by 4 panels
      pin: true,
      animation: gsap.timeline()
        .to(cardsRef.current[0], { opacity: 0, scale: 0.95, duration: 1 }, 1) // Card 0 fades slightly backwards
        .fromTo(cardsRef.current[1], { y: '100vh' }, { y: '0vh', duration: 1, ease: 'power2.inOut' }, 1) // Card 1 strictly slides over filling screen
        
        .to(cardsRef.current[1], { opacity: 0, scale: 0.95, duration: 1 }, 2) 
        .fromTo(cardsRef.current[2], { y: '100vh' }, { y: '0vh', duration: 1, ease: 'power2.inOut' }, 2) 
        
        .to(cardsRef.current[2], { opacity: 0, scale: 0.95, duration: 1 }, 3) 
        .fromTo(cardsRef.current[3], { y: '100vh' }, { y: '0vh', duration: 1, ease: 'power2.inOut' }, 3), 
      scrub: 1,
    });
  }, { scope: container });

  return (
    <section ref={container} className="h-screen w-full relative overflow-hidden bg-transparent">
      
      {/* Intro Background Text */}
      <div className="absolute inset-0 flex flex-col justify-start pt-[10vh] items-center pointer-events-none z-[50] select-none mix-blend-screen mix-blend-difference">
        <span className="font-mono text-[12px] tracking-[0.5em] uppercase text-[#E8B98A] mb-4">
          Community
        </span>
      </div>

      <div className="relative w-full h-full">
        {testimonials.map((t, i) => (
          <div
            key={i}
            ref={(el) => { cardsRef.current[i] = el; }}
            // EACH Testimonial is an absolute gigantic full-screen box sliding over the other
            className={`absolute inset-0 w-full h-full flex justify-center items-center ${t.bg} ${i === 0 ? 'z-10' : 'z-20'}`}
            style={{ 
              transform: i === 0 ? 'translateY(0vh)' : 'translateY(100vh)' 
            }}
          >
            {/* Inner Content bounds */}
            <div className="w-full max-w-[1280px] px-6 md:px-16 flex items-center relative h-full">
              
              <div className="absolute top-[20%] right-[10%] opacity-[0.03] transform pointer-events-none">
                <Quote className="w-[600px] h-[600px] text-[#C4956A]" />
              </div>

              <div className="flex flex-col max-w-5xl">
                <div className="flex items-center gap-2 mb-10">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-6 h-6 text-[#E8B98A] fill-[#E8B98A]" />
                  ))}
                </div>

                <p className="text-4xl md:text-6xl lg:text-7xl font-display font-medium text-white leading-tight mb-16 drop-shadow-2xl">
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div className="flex items-center gap-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#8B5E3C] to-[#C4956A] flex items-center justify-center text-white font-display font-bold text-3xl shadow-[0_0_30px_rgba(139,94,60,0.4)]">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white tracking-wide">{t.name}</p>
                    <p className="text-lg font-mono text-[#E8B98A] mt-2">{t.role}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
