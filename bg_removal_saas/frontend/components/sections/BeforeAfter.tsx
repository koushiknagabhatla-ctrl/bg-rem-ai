'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ImageComparisonSlider, ImageComparisonSliderRef } from '@/components/ui/image-comparison-slider';

gsap.registerPlugin(ScrollTrigger);

export function BeforeAfter() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<ImageComparisonSliderRef>(null);

  useGSAP(() => {
    // Master Sequence: Lock the entire viewport, zoom, scrub the UI, and zoom out.
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "center center", 
        end: "+=3000", // The user has 3000px of scroll distance to observe the physics
        pin: true,
        scrub: 1.5,
        anticipatePin: 1
      }
    });

    const proxy = { pos: 80 }; // Start slider at 80% 

    // Sequence 1: Frame locks in center and zooms in massively
    tl.to(".slider-container", {
      scale: 1.4,
      ease: "power2.inOut",
      duration: 3
    })
    // Sequence 2: The before/after slider DRAGS ACROSS AUTOMATICALLY. (80% -> 0%)
    .to(proxy, {
      pos: 0,
      duration: 5,
      ease: "power1.inOut",
      onUpdate: () => {
        if (sliderRef.current) sliderRef.current.setPosition(proxy.pos);
      }
    })
    // Sequence 3: Zoom back out seamlessly before unpinning allows scroll continuation
    .to(".slider-container", {
      scale: 1,
      ease: "power2.inOut",
      duration: 3
    });

    // Independent reveal for the text headers
    gsap.fromTo(".header-content",
      { y: 80, opacity: 0 },
      { 
        y: 0, opacity: 1, duration: 1.5, ease: "power3.out",
        scrollTrigger: { 
          trigger: sectionRef.current, 
          start: "top 75%", 
          toggleActions: "play none none reverse" 
        }
      }
    );

  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} id="demo" className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-transparent z-10 px-4 md:px-16">
      <div className="w-full max-w-[1280px] mx-auto relative z-10">
        
        {/* Header Phase */}
        <div className="header-content mb-12 md:mb-20 text-center relative z-20">
          <span className="font-mono text-xs md:text-sm tracking-[0.4em] uppercase text-[#E8B98A] mb-4 md:mb-6 block drop-shadow-xl">
            Product Showcase
          </span>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight max-w-4xl mx-auto mb-4 md:mb-6">
            Micro-level precision. <br className="hidden md:block" />
            <span className="text-[#8B5E3C] italic font-medium drop-shadow-xl">Even on complex subjects.</span>
          </h2>
          <p className="text-base md:text-lg text-[#BFA899] font-light max-w-2xl mx-auto leading-relaxed">
            Stray hairs, transparent fabrics, complex edges — resolved at sub-pixel precision in under 300ms.
          </p>
        </div>

        {/* 
          Slider Engine Block: 
          Uses Aspect-[9/16] and max-w-[400px] constraint to ensure the vertical portrait layout is perfect! 
        */}
        <div className="slider-container glass3d p-2 md:p-4 rounded-3xl md:rounded-[40px] border border-[#8B5E3C]/20 shadow-[0_30px_100px_rgba(0,0,0,0.8)] max-w-[400px] mx-auto will-change-transform z-30">
          
          {/* Strictly enforced aspect-[9/16] portrait container */}
          <div className="w-full aspect-[9/16] rounded-2xl md:rounded-[30px] overflow-hidden bg-[#0A0604] border border-white/5 relative">
              <ImageComparisonSlider
                ref={sliderRef}
                initialPosition={80}
                leftImage="/images/car_original.jpg"
                rightImage="/images/car_removed.png"
                altLeft="Original Photo"
                altRight="Background Removed"
              />
          </div>

          <div className="flex items-center justify-between mt-4 px-2">
            <div className="flex items-center gap-3">
              <div className="glass3d px-4 py-2 rounded-full border border-[#8B5E3C]/20 flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-[#E8B98A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span className="text-[10px] font-semibold tracking-widest uppercase text-[#BFA899]">Auto Scrub</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#6B5B50] hidden sm:block">4K Resolution</span>
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#6B5B50] hidden sm:block">•</span>
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#8B5E3C]">GSAP Timeline</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
