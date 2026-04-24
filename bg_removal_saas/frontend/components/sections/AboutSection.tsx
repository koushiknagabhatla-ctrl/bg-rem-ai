'use client';

import { useRef } from 'react';
import { HeadingReveal, TextReveal } from '@/components/ui/scroll-reveal';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const values = [
  { label: 'Obsessive Detail', value: 'We don’t just erase backgrounds. We evaluate every single pixel to ensure your subject remains perfectly untouched, exactly as you captured it.' },
  { label: 'Uncompromised Quality', value: 'No arbitrary scaling. No muddy artifacts. When you upload a 4K image, you get a pristine 4K cutout in return. We preserve your art.' },
  { label: 'Absolute Privacy', value: 'Your imagery is your intellectual property. Operations happen entirely in volatile memory so nothing is ever saved to our drives. Truly yours.' },
  { label: 'Infinite Capacity', value: 'A one-time hobbyist or a massive e-comm studio uploading fifty-thousand shots tonight? It doesn’t matter. It all just works.' },
];

export function AboutSection() {
  const container = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    ScrollTrigger.create({
      trigger: container.current,
      start: "top top",
      end: "+=400%", // 4 items
      pin: true,
      animation: gsap.timeline()
        .to(cardsRef.current[0], { opacity: 0, scale: 0.9, x: 100, duration: 1 }, 1)
        .fromTo(cardsRef.current[1], { x: '100vw', opacity: 0, scale: 0.8 }, { x: '0vw', opacity: 1, scale: 1, duration: 1 }, 1)
        
        .to(cardsRef.current[1], { opacity: 0, scale: 0.9, x: 100, duration: 1 }, 2)
        .fromTo(cardsRef.current[2], { x: '100vw', opacity: 0, scale: 0.8 }, { x: '0vw', opacity: 1, scale: 1, duration: 1 }, 2)
        
        .to(cardsRef.current[2], { opacity: 0, scale: 0.9, x: 100, duration: 1 }, 3)
        .fromTo(cardsRef.current[3], { x: '100vw', opacity: 0, scale: 0.8 }, { x: '0vw', opacity: 1, scale: 1, duration: 1 }, 3),
      scrub: 1, // Fluid cinematic scrub
    });
  }, { scope: container });

  return (
    <section ref={container} id="about" className="h-screen w-full overflow-hidden bg-transparent">
      
      <div className="relative w-full h-full max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row items-center pt-24 md:pt-0 pb-12 md:pb-0">
        
        {/* Left Side: Fixed Philosophy Text */}
        <div className="w-full lg:w-[45%] flex-shrink-0 flex flex-col justify-center relative z-[5]">
          <div>
            <span className="font-mono text-[10px] md:text-[11px] tracking-[0.5em] uppercase text-[#E8B98A] mb-4 md:mb-6 block drop-shadow-[0_0_10px_rgba(232,185,138,0.5)]">
              Our Foundation
            </span>
            <h2 className="font-display text-4xl md:text-7xl font-extrabold text-white leading-tight mb-4 md:mb-8 drop-shadow-2xl">
              <HeadingReveal>Built different.</HeadingReveal><br className="hidden md:block" />
              <span className="italic font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#C4956A] to-[#8B5E3C]">
                <HeadingReveal delay={0.25}>On purpose.</HeadingReveal>
              </span>
            </h2>
            <div className="text-lg md:text-2xl text-[#BFA899] font-light leading-relaxed drop-shadow-sm mb-4 md:mb-8 max-w-sm md:max-w-none">
              <TextReveal delay={0.5}>
                We grew exhausted by tools that degraded our images. So we engineered a platform that treats every single pixel with obsessive respect.
              </TextReveal>
            </div>
          </div>
        </div>

        {/* Right Side: GSAP Scroll Pinned Cards */}
        <div className="w-full lg:w-[55%] relative flex-1 min-h-[40vh] md:h-full mt-4 md:mt-0">
          {values.map((v, i) => (
            <div
              key={i}
              ref={(el) => { cardsRef.current[i] = el; }}
              className={`absolute inset-0 w-full h-full flex flex-col justify-center lg:items-end lg:pr-16 ${i === 0 ? 'z-10' : 'z-20'}`}
              style={{ 
                opacity: i === 0 ? 1 : 0, 
                transform: i === 0 ? 'translateX(0vw)' : 'translateX(100vw)' 
              }}
            >
              <div className="w-full h-full flex flex-col justify-center relative">
                
                {/* Numbers deleted per design feedback */}
                
                <div className="glass3d !rounded-[3rem] bg-[#0A0604]/40 backdrop-blur-[24px] p-8 md:p-16 border border-[#8B5E3C]/20 relative z-10 w-full shadow-[0_30px_100px_rgba(0,0,0,0.6)]">
                  <span className="font-mono text-[10px] md:text-[11px] tracking-[0.4em] uppercase text-[#C4956A] mb-4 md:mb-8 block drop-shadow-md">{v.label}</span>
                  <p className="text-lg md:text-3xl text-[#BFA899] font-light leading-relaxed">
                    {v.value}
                  </p>
                </div>
                
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
