'use client';

import { useRef } from 'react';
import { HeadingReveal, TextReveal } from '@/components/ui/scroll-reveal';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const values = [
  { label: 'Pixel Obsessed', value: "We don't just remove backgrounds — we study every edge, every gradient, every strand. Your subject comes out exactly as you shot it. Not \"close enough.\" Exactly." },
  { label: 'Your Quality, Untouched', value: "Upload 4K? Get 4K back. We never downscale, never compress, never add artifacts. Your art deserves better than \"good enough,\" and so do you." },
  { label: 'Nothing Stored. Ever.', value: "Your photos never touch a hard drive. Everything runs in volatile memory and vanishes the instant processing completes. Your work stays yours. Period." },
  { label: 'Built for Any Scale', value: "Whether you're editing a single headshot tonight or your team needs to process a 50,000-image product catalog — it just works. Same speed. Same quality." },
];

export function AboutSection() {
  const container = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    ScrollTrigger.create({
      trigger: container.current,
      start: "top top",
      end: "+=120%",
      pin: true,
      animation: gsap.timeline()
        .to(cardsRef.current[0], { opacity: 0, scale: 0.92, x: 80, filter: 'blur(4px)', duration: 1, ease: "power2.inOut" }, 1)
        .fromTo(cardsRef.current[1], { x: '100vw', opacity: 0, scale: 0.85, filter: 'blur(6px)' }, { x: '0vw', opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1, ease: "power2.out" }, 1)
        
        .to(cardsRef.current[1], { opacity: 0, scale: 0.92, x: 80, filter: 'blur(4px)', duration: 1, ease: "power2.inOut" }, 2)
        .fromTo(cardsRef.current[2], { x: '100vw', opacity: 0, scale: 0.85, filter: 'blur(6px)' }, { x: '0vw', opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1, ease: "power2.out" }, 2)
        
        .to(cardsRef.current[2], { opacity: 0, scale: 0.92, x: 80, filter: 'blur(4px)', duration: 1, ease: "power2.inOut" }, 3)
        .fromTo(cardsRef.current[3], { x: '100vw', opacity: 0, scale: 0.85, filter: 'blur(6px)' }, { x: '0vw', opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1, ease: "power2.out" }, 3),
      scrub: 1.5,
    });
  }, { scope: container });

  return (
    <section ref={container} id="about" className="h-screen w-full overflow-hidden bg-transparent">
      
      <div className="relative w-full h-full max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row items-center pt-24 md:pt-0 pb-12 md:pb-0">
        
        {/* Left Side: Philosophy */}
        <div className="w-full lg:w-[45%] flex-shrink-0 flex flex-col justify-center relative z-[5]">
          <div>
            <span className="font-mono text-[10px] md:text-[11px] tracking-[0.5em] uppercase text-[#E8B98A]/80 mb-4 md:mb-6 block">
              Our Philosophy
            </span>
            <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] mb-4 md:mb-8 drop-shadow-2xl">
              <HeadingReveal>Built different.</HeadingReveal><br className="hidden md:block" />
              <span className="italic font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#DCA251] via-[#FFF3D6] to-[#AB7B23]">
                <HeadingReveal delay={0.25}>On purpose.</HeadingReveal>
              </span>
            </h2>
            <div className="text-base md:text-xl text-[#BFA899]/85 font-light leading-relaxed mb-4 md:mb-8 max-w-sm md:max-w-none">
              <TextReveal delay={0.5}>
                We got tired of tools that degraded our images. So we built one that actually respects them. Every pixel, every edge, every time.
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
              className={`absolute inset-0 w-full h-full flex flex-col justify-center lg:items-end lg:pr-12 will-change-transform ${i === 0 ? 'z-10' : 'z-20'}`}
              style={{ 
                opacity: i === 0 ? 1 : 0, 
                transform: i === 0 ? 'translateX(0vw)' : 'translateX(100vw)' 
              }}
            >
              <div className="w-full h-full flex flex-col justify-center relative">
                
                <div className="glass3d !rounded-[2rem] bg-[#0A0604]/50 backdrop-blur-[28px] p-7 md:p-12 border border-[#8B5E3C]/12 relative z-10 w-full shadow-[0_25px_70px_rgba(0,0,0,0.45)]">
                  <span className="font-mono text-[10px] md:text-[11px] tracking-[0.4em] uppercase text-[#C4956A]/80 mb-4 md:mb-6 block">{v.label}</span>
                  <p className="text-base md:text-xl text-[#BFA899]/90 font-light leading-[1.7]">
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
