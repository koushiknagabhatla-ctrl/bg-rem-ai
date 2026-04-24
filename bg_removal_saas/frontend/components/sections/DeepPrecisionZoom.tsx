'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ScanLine } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function DeepPrecisionZoom() {
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomTargetRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Cinematic Zoom Sequence
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=3500", // Massive scroll distance to allow a very slow, majestic zoom
        pin: true,
        scrub: 1.5, // Fluid 1.5s scrub catchup
        anticipatePin: 1
      }
    });

    // 1. Zoom into the background
    tl.to(zoomTargetRef.current, { 
        scale: 15, 
        transformOrigin: "48% 62%", // Precise coordinate mapping to a "strand" region
        ease: "power2.inOut", 
        duration: 8 
      }, 0)
      
      // 2. Fade out the introductory glass card early in the zoom
      .to(textRef.current, { 
        opacity: 0, 
        scale: 1.2, 
        duration: 2 
      }, 1)
      
      // 3. Fade in the Macro Matrix UI exactly as we hit extreme zoom levels
      .fromTo(".macro-ui", 
        { opacity: 0, scale: 0.8 }, 
        { opacity: 1, scale: 1, duration: 2, ease: "power2.out" }, 
        6
      )
      
      // 4. Hold the massive zoom for a second, then gently fade the UI out before unpinning
      .to(".macro-ui", { opacity: 0, duration: 1 }, 8);

  }, { scope: containerRef });

  return (
    <section ref={containerRef} id="macro-zoom" className="h-screen w-full overflow-hidden bg-[#0C0806] relative z-20">
      
      {/* Background Target */}
      <div 
        ref={zoomTargetRef} 
        // We use a high-fidelity image simulating macro detail
        className="absolute inset-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=3000')] bg-cover bg-center will-change-transform"
      >
        {/* Dynamic vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0806] via-transparent to-[#0C0806]/50" />
        <div className="absolute inset-0 bg-black/30" /> 
      </div>

      {/* Main Philosophy Glass Card */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6">
        <div ref={textRef} className="text-center glass3d p-8 md:p-14 !rounded-[3rem] border border-[#8B5E3C]/30 bg-[#0A0604]/50 backdrop-blur-2xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] max-w-xl mx-auto will-change-transform">
          <ScanLine className="w-12 h-12 text-[#E8B98A] mx-auto mb-6 drop-shadow-md" />
          <h2 className="font-display text-4xl md:text-5xl font-extrabold text-white mb-6 drop-shadow-2xl tracking-tight">
            Microscopic <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C4956A] to-[#8B5E3C] italic">Isolation</span>
          </h2>
          <p className="text-[#BFA899] text-base md:text-lg font-light leading-relaxed">
            Standard AI models blur boundaries. Our neural engine physically analyzes your subject at the pixel-level, generating mathematical isolation logic mapped perfectly to organic shapes.
          </p>
        </div>
      </div>

      {/* Extreme Zoom Overlay (Macro Grid and Tracking UI) */}
      <div className="macro-ui opacity-0 absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
         
         {/* Cyber Grid */}
         <div className="absolute inset-0 opacity-[0.15]" 
              style={{ 
                backgroundImage: 'linear-gradient(rgba(196,149,106,1) 1px, transparent 1px), linear-gradient(90deg, rgba(196,149,106,1) 1px, transparent 1px)', 
                backgroundSize: '120px 120px',
                maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 80%)'
              }} 
         />
         
         {/* Targeting Ring */}
         <div className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] border-[0.5px] border-[#8B5E3C]/30 rounded-full flex flex-col items-center justify-center relative shadow-[0_0_80px_rgba(139,94,60,0.1)_inset]">
            <div className="absolute inset-0 border border-[#8B5E3C]/40 rounded-full animate-spin-slow border-dashed opacity-50" />
            
            <div className="w-4 h-4 rounded-full bg-[#E8B98A] shadow-[0_0_20px_#E8B98A] mb-8" />
            
            <div className="bg-[#C4956A]/10 backdrop-blur-md px-6 py-3 rounded-full border border-[#8B5E3C]/40 text-[10px] md:text-xs text-[#E8B98A] font-mono tracking-[0.3em] uppercase">
              Alpha Boundary: Confirmed
            </div>
         </div>

      </div>

    </section>
  );
}
