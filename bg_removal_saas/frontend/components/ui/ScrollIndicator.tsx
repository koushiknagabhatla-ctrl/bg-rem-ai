'use client';

import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowDown } from 'lucide-react';

export function ScrollIndicator() {
  const container = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  // Smart visibility: hide when user reaches FinalCTA/Footer area
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    // Observe the footer or last major section
    const checkForTarget = () => {
      const footer = document.querySelector('footer');
      const finalCTA = document.getElementById('final-cta');
      const target = finalCTA || footer;
      if (target) {
        observer.observe(target);
      } else {
        // Retry if elements aren't mounted yet
        setTimeout(checkForTarget, 1000);
      }
    };

    checkForTarget();

    return () => observer.disconnect();
  }, []);

  useGSAP(() => {
    // Bouncing arrow
    gsap.to(".scroll-arrow", {
      y: 6,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
      duration: 1.2
    });

    // Spinning dashed circle
    gsap.to(".dashed-circle", {
      rotation: 360,
      repeat: -1,
      ease: "none",
      duration: 12
    });
  }, { scope: container });

  return (
    <div 
      ref={container} 
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 mix-blend-screen pointer-events-none transition-opacity duration-700"
      style={{ opacity: isVisible ? 1 : 0 }}
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
