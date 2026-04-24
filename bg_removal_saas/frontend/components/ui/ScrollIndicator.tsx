'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function ScrollIndicator() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Oryzo.ai constant micro-bounce
    gsap.to(".scroll-dot", {
      y: 36, // Travel down the track
      repeat: -1,
      ease: "power2.inOut",
      duration: 2
    });

    gsap.fromTo(".scroll-dot", 
      { opacity: 1 },
      { opacity: 0, repeat: -1, duration: 2, ease: "power2.in", delay: 1 }
    );

    // Fade entire indicator before reaching footer to avoid collision
    gsap.to(container.current, {
      opacity: 0,
      scrollTrigger: {
        trigger: document.body,
        start: "bottom-=1200 bottom", 
        end: "bottom bottom",
        scrub: true
      }
    });

  }, { scope: container });

  return (
    <div 
      ref={container} 
      className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 mix-blend-screen pointer-events-none"
    >
      <span className="font-mono text-[9px] tracking-[0.4em] uppercase text-[#C4956A] opacity-70 drop-shadow-md">
        Scroll
      </span>
      <div className="w-[1px] h-12 bg-gradient-to-b from-[#8B5E3C]/40 to-transparent relative overflow-hidden rounded-full">
        <div className="scroll-dot absolute top-0 left-0 w-full h-3 bg-[#E8B98A] rounded-full shadow-[0_0_10px_#E8B98A]" />
      </div>
    </div>
  );
}
