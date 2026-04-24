'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function ScrollIndicator() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Oryzo.ai Arrow Bounce
    gsap.to(".scroll-arrow", {
      y: 6,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
      duration: 1.2
    });

    // Oryzo.ai Infinite Dashed Spin
    gsap.to(".dashed-circle", {
      rotation: 360,
      repeat: -1,
      ease: "none",
      duration: 12
    });

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
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 mix-blend-screen pointer-events-none"
    >
      <div className="relative flex items-center justify-center w-12 h-12">
        {/* Spinning Dashed Circle */}
        <div className="dashed-circle absolute inset-0 rounded-full border border-dashed border-[#C4956A]/40" />
        {/* Glow behind the arrow */}
        <div className="absolute inset-2 rounded-full bg-[#E8B98A]/5 blur-sm" />
        {/* Bouncing Arrow */}
        <ArrowDown className="scroll-arrow w-4 h-4 text-[#E8B98A] drop-shadow-[0_0_8px_rgba(232,185,138,0.8)]" />
      </div>

      <span className="font-mono text-[9px] tracking-[0.4em] uppercase text-[#C4956A] opacity-70 drop-shadow-md">
        Scroll
      </span>
    </div>
  );
}
