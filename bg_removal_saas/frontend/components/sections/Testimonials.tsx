'use client';

import { useRef } from 'react';
import { Quote } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

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

export function Testimonials() {
  const container = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    // 3D Spatial Stacking Animation
    ScrollTrigger.create({
      trigger: container.current,
      start: "top top",
      end: "+=200%", // Rapid scroll velocity
      pin: true,
      animation: gsap.timeline()
        .to(cardsRef.current[0], { opacity: 0, scale: 0.9, y: -100, rotateX: 10, duration: 1, ease: "power2.inOut" }, 1)
        .fromTo(cardsRef.current[1], { y: '100vh', opacity: 0, scale: 0.8, rotateX: -15 }, { y: '0vh', opacity: 1, scale: 1, rotateX: 0, duration: 1, ease: "power2.out" }, 1)
        
        .to(cardsRef.current[1], { opacity: 0, scale: 0.9, y: -100, rotateX: 10, duration: 1, ease: "power2.inOut" }, 2)
        .fromTo(cardsRef.current[2], { y: '100vh', opacity: 0, scale: 0.8, rotateX: -15 }, { y: '0vh', opacity: 1, scale: 1, rotateX: 0, duration: 1, ease: "power2.out" }, 2)
        
        .to(cardsRef.current[2], { opacity: 0, scale: 0.9, y: -100, rotateX: 10, duration: 1, ease: "power2.inOut" }, 3)
        .fromTo(cardsRef.current[3], { y: '100vh', opacity: 0, scale: 0.8, rotateX: -15 }, { y: '0vh', opacity: 1, scale: 1, rotateX: 0, duration: 1, ease: "power2.out" }, 3),
      scrub: 2.5, // Buttery trailing physics
    });
  }, { scope: container });

  return (
    <section ref={container} id="testimonials" className="h-screen w-full relative overflow-hidden bg-transparent z-10" style={{ perspective: 1500 }}>
      <div className="relative w-full h-full max-w-[1400px] mx-auto flex flex-col md:flex-row items-center">
        
        {/* Cinematic Bronze Background Glow */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[50vw] h-[80vh] bg-[#C4956A]/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />

        {/* Left Side: Pinned Typography */}
        <div className="w-full lg:w-[45%] flex flex-col justify-center px-6 md:px-0 md:pl-16 relative z-10 text-center md:text-left mt-24 md:mt-0">
            <span className="font-mono text-xs tracking-[0.4em] uppercase text-[#E8B98A] mb-4 md:mb-6 block drop-shadow-md">
              Customer Stories
            </span>
            <h2 className="font-display text-4xl md:text-6xl lg:text-[5.5rem] font-extrabold text-white leading-tight drop-shadow-2xl">
              Loved by the <br className="hidden md:block"/>world's <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#C4956A] to-[#8B5E3C] whitespace-nowrap">
                best creatives.
              </span>
            </h2>
        </div>

        {/* Right Side: 3D Stacking Cards */}
        <div className="w-full lg:w-[55%] relative flex-1 h-full flex items-center justify-center pt-8 md:pt-0 pb-16 md:pb-0">
          {testimonials.map((t, i) => (
            <div
              key={i}
              ref={(el) => { cardsRef.current[i] = el; }}
              className={`absolute inset-0 w-full h-full flex flex-col justify-center px-6 md:pr-16 lg:pl-12 will-change-transform transform-style-3d ${i === 0 ? 'z-10' : 'z-20'}`}
              style={{ 
                opacity: i === 0 ? 1 : 0, 
                transform: i === 0 ? 'translateY(0vh) rotateX(0deg)' : 'translateY(100vh) rotateX(-15deg)'
              }}
            >
                <div className="group relative w-full lg:max-w-[600px] flex-shrink-0 mx-auto lg:ml-auto lg:mr-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#8B5E3C]/0 via-[#8B5E3C]/0 to-[#C4956A]/15 rounded-[3rem] transition-all duration-700 blur-xl" />
                  
                  <div className="relative flex flex-col justify-between p-8 md:p-12 lg:p-14 !rounded-[3rem] border border-[#8B5E3C]/20 glass3d bg-[#0A0604]/40 backdrop-blur-[48px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden">
                    
                    <Quote className="absolute top-10 right-10 w-24 h-24 text-[#C4956A]/[0.08] pointer-events-none" />

                    <p className="text-xl md:text-2xl lg:text-[2rem] font-display font-medium text-[#FFFFFF] leading-[1.4] mb-12 relative z-10 drop-shadow-xl">
                      "{t.quote}"
                    </p>

                    <div className="flex items-center gap-6 relative z-10">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1F140D] to-[#0A0604] border border-[#8B5E3C]/40 flex items-center justify-center text-[#E8B98A] font-display font-bold text-xl shadow-[0_0_20px_rgba(200,150,100,0.2)]">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white tracking-wide">{t.name}</p>
                        <p className="text-sm font-mono text-[#C4956A]/80 mt-1">{t.role}, {t.company}</p>
                      </div>
                    </div>

                  </div>
                </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
