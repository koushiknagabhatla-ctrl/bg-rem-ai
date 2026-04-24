'use client';

import { useRef } from 'react';
import { UploadCloud, Zap, Download } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  { icon: UploadCloud, title: 'Upload Art', desc: 'Securely drop in your photography via our studio or direct API proxy. Fully encrypted, fully yours.' },
  { icon: Zap, title: 'Extract Essence', desc: 'Our engine detects the absolute micro-edges of the subject, isolating it with breathtaking precision.' },
  { icon: Download, title: 'Retrieve Magic', desc: 'Instantly download your uncompressed, perfectly transparent asset. Your art, unbound from its background.' },
];

export function HowItWorks() {
  const container = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    ScrollTrigger.create({
      trigger: container.current,
      start: "top top",
      end: "+=300%", // 3 steps
      pin: true,
      animation: gsap.timeline()
        .to(cardsRef.current[0], { opacity: 0, scale: 0.9, x: -100, duration: 1 }, 1)
        .fromTo(cardsRef.current[1], { x: '100vw', opacity: 0, scale: 0.8 }, { x: '0vw', opacity: 1, scale: 1, duration: 1 }, 1)
        .to(cardsRef.current[1], { opacity: 0, scale: 0.9, x: -100, duration: 1 }, 2)
        .fromTo(cardsRef.current[2], { x: '100vw', opacity: 0, scale: 0.8 }, { x: '0vw', opacity: 1, scale: 1, duration: 1 }, 2),
      scrub: 1, // Fluid cinematic scrub
    });
  }, { scope: container });

  return (
    <section ref={container} className="h-screen w-full overflow-hidden bg-transparent">
      
      {/* Background Title */}
      <div className="absolute inset-0 flex flex-col justify-start pt-[10vh] items-center pointer-events-none z-[1] select-none">
        <span className="font-mono text-[12px] tracking-[0.5em] uppercase text-[#E8B98A] mb-4">
          The Flow
        </span>
        <h2 className="font-display text-4xl md:text-[6rem] font-extrabold text-[#C4956A]/10 leading-none text-center">
          BEAUTIFULLY FLUID
        </h2>
      </div>

      <div className="relative w-full h-full flex items-center justify-center">
        {steps.map((step, i) => (
          <div
            key={i}
            ref={(el) => { cardsRef.current[i] = el; }}
            className={`absolute w-full px-6 flex justify-center items-center ${i === 0 ? 'z-10' : 'z-20'}`}
            style={{ 
              opacity: i === 0 ? 1 : 0, 
              transform: i === 0 ? 'translateX(0vw)' : 'translateX(100vw)' 
            }}
          >
            <div className="w-full max-w-5xl glass3d p-16 md:p-24 border border-[#8B5E3C]/15 backdrop-blur-2xl bg-[#0C0806]/80 flex flex-col items-center text-center shadow-[0_0_80px_rgba(0,0,0,0.8)] relative">
              
              <div className="absolute top-0 right-0 text-[18rem] md:text-[24rem] font-display font-extrabold text-[#C4956A] opacity-[0.05] select-none z-0 transform -translate-y-1/3 translate-x-1/4 leading-none">
                0{i + 1}
              </div>
              
              <div className="w-24 h-24 rounded-3xl bg-[#1A0E08] border border-[#8B5E3C]/30 flex items-center justify-center shadow-[0_0_40px_rgba(232,185,138,0.15)] mb-12 relative z-10">
                <step.icon className="w-12 h-12 text-[#E8B98A]" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-5xl md:text-7xl font-bold text-white mb-8 drop-shadow-md relative z-10">
                {step.title}
              </h3>
              <p className="text-2xl md:text-3xl text-[#BFA899] font-light leading-relaxed max-w-3xl relative z-10">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
