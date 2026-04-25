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
        scrub: 2.5, // Ultra-smooth trailing coefficient
        anticipatePin: 1
      }
    });

    const proxy = { pos: 80 }; // Start slider at 80% 

    // Sequence 1: Frame locks in center and zooms slightly without overpowering screen
    tl.to(".slider-container", {
      scale: 1.15,
      ease: "power2.inOut",
      duration: 3
    })
    // Sequence 2: The before/after slider DRAGS ACROSS AUTOMATICALLY. (80% -> 0% -> 50%)
    .to(proxy, {
      pos: 0,
      duration: 3,
      ease: "power1.inOut",
      onUpdate: () => {
        if (sliderRef.current) sliderRef.current.setPosition(proxy.pos);
      }
    })
    .to(proxy, {
      pos: 50,
      duration: 2,
      ease: "power2.out",
      onUpdate: () => {
        if (sliderRef.current) sliderRef.current.setPosition(proxy.pos);
      }
    }, ">")
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
      <div className="w-full max-w-[1280px] mx-auto relative z-10 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
        
        {/* Header Phase */}
        <div className="header-content mb-8 lg:mb-0 text-center lg:text-left relative z-20 w-full lg:w-1/2 lg:pl-10">
          <span className="font-mono text-xs md:text-sm tracking-[0.4em] uppercase text-[#E8B98A] mb-4 md:mb-6 block drop-shadow-xl">
            Product Showcase
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-7xl font-extrabold text-white leading-tight max-w-4xl mx-auto mb-4 md:mb-6">
            Micro-level precision. <br />
            <span className="text-[#8B5E3C] italic font-medium drop-shadow-xl">Even on complex subjects.</span>
          </h2>
          <p className="text-base md:text-lg text-[#BFA899] font-light max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Stray hairs, transparent fabrics, complex edges — resolved at sub-pixel precision in under 300ms.
          </p>
        </div>

        {/* 
          Slider Engine Block: 
          Uses Aspect-[9/16] and tighter maximum bounds to prevent overpowering the screen 
        */}
        <div className="w-full lg:w-1/2 flex justify-center items-center h-[65vh] md:h-[75vh]">
          <div className="slider-container glass3d p-2 md:p-3 rounded-[2rem] border border-[#8B5E3C]/20 shadow-[0_30px_100px_rgba(0,0,0,0.8)] h-full max-h-[600px] aspect-[9/16] lg:mx-0 will-change-transform z-30 flex flex-col">
          
          {/* Strictly enforced aspect-[9/16] portrait container */}
          <div className="w-full flex-1 rounded-xl md:rounded-[1.25rem] overflow-hidden bg-[#0A0604] border border-white/5 relative">
              <ImageComparisonSlider
                ref={sliderRef}
                initialPosition={80}
                leftImage="/images/car_original.jpg"
                rightImage="/images/car_removed.png"
                altLeft="Original Photo"
                altRight="Background Removed"
              />
          </div>

          <div className="flex items-center justify-between mt-3 px-2 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="glass3d px-3 py-2 rounded-full border border-[#8B5E3C]/20 flex items-center gap-2">
                <svg className="w-3 md:w-3.5 h-3 md:h-3.5 text-[#E8B98A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span className="text-[9px] md:text-[10px] font-semibold tracking-widest uppercase text-[#BFA899]">Auto Scrub</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] md:text-[10px] font-mono tracking-widest uppercase text-[#6B5B50] hidden sm:block">4K</span>
              <span className="text-[9px] md:text-[10px] font-mono tracking-widest uppercase text-[#6B5B50] hidden sm:block">•</span>
              <span className="text-[9px] md:text-[10px] font-mono tracking-widest uppercase text-[#8B5E3C]">GSAP</span>
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
