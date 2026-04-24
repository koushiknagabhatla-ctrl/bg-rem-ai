'use client';

import { useRef } from 'react';
import { Quote } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

// Note the <span> highlights inside the quotes
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
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const track = trackRef.current;
    if (!track || !container.current) return;

    // Cinematic Horizontal Scrolling identical to Oryzo.ai / Apple
    gsap.to(track, {
      x: () => -(track.scrollWidth - track.parentElement!.offsetWidth),
      ease: "none",
      scrollTrigger: {
        trigger: container.current,
        pin: true,
        scrub: 1,
        // Calculate dynamic scrolling distance based on absolute track width
        end: () => "+=" + (track.scrollWidth - track.parentElement!.offsetWidth),
        invalidateOnRefresh: true, // Allows native recalculation on window resize
      }
    });
  }, { scope: container });

  return (
    <section ref={container} className="py-24 md:py-32 w-full relative overflow-hidden bg-transparent z-10">
      
      <div className="relative w-full max-w-[1400px] mx-auto border border-[#8B5E3C]/20 bg-[#0C0806]/80 backdrop-blur-3xl rounded-[40px] py-16 shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Cinematic Bronze Glow Background constrained inside card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-[#C4956A]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative w-full">
          
          {/* Header remains pinned statically above the scrolling track */}
          <div className="mb-16 md:mb-20 text-center relative z-10 px-6 md:px-16">
            <span className="font-mono text-xs tracking-[0.4em] uppercase text-[#C4956A] mb-6 block">
              Customer Stories
            </span>
            <h2 className="font-display text-5xl md:text-7xl font-extrabold text-white leading-tight">
              Loved by the world's <br/>
              <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#E8B98A] to-[#8B5E3C]">
                best creatives.
              </span>
            </h2>
          </div>

          {/* GSAP Horizontal Track Container */}
          <div className="w-full overflow-hidden">
            <div ref={trackRef} className="flex gap-8 md:gap-12 w-[max-content] px-6 md:px-16 pb-8">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className="group relative w-[85vw] md:w-[500px] lg:w-[600px] flex-shrink-0"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#8B5E3C]/0 via-[#8B5E3C]/0 to-[#C4956A]/5 group-hover:to-[#C4956A]/15 rounded-3xl transition-all duration-700 blur-xl" />
                  
                  <div className="relative h-full flex flex-col justify-between p-8 md:p-12 lg:p-14 rounded-3xl border border-white/5 bg-[#0C0806]/90 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] group-hover:border-[#C4956A]/30 transition-all duration-500 overflow-hidden">
                    
                    <Quote className="absolute top-10 right-10 w-24 h-24 text-[#C4956A]/[0.05] transform group-hover:scale-110 transition-transform duration-700 pointer-events-none" />

                    <p className="text-xl md:text-2xl lg:text-[2rem] font-display font-medium text-[#EAD0B9]/90 leading-[1.4] mb-12 relative z-10">
                      "{t.quote}"
                    </p>

                    <div className="flex items-center gap-6 mt-auto pt-8 border-t border-[#8B5E3C]/20 relative z-10">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-[#1F140D] to-[#0A0604] border border-[#8B5E3C]/40 flex items-center justify-center text-[#E8B98A] font-display font-bold text-xl shadow-[0_0_15px_rgba(200,150,100,0.15)]">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-base md:text-lg font-bold text-white tracking-wide">{t.name}</p>
                        <p className="text-xs md:text-sm font-mono text-[#C4956A]/80 mt-1">{t.role}, {t.company}</p>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
