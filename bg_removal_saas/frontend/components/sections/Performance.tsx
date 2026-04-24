'use client';

import { useRef } from 'react';
import { Activity, Clock, Cpu, Zap } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { icon: Clock, value: 'Instant', label: 'Processing', desc: 'Photos process so fast you won’t even have time to blink. Your flow state remains unbroken.' },
  { icon: Zap, value: 'Pristine', label: 'Resolution', desc: 'We respect your art. Every single pixel of your original image is preserved perfectly without downscaling.' },
  { icon: Activity, value: 'Invisible', label: 'Edges', desc: 'Flyaway hair. Fine mesh. Smoke. Our AI understands depth intuitively, leaving edges flawlessly transparent.' },
  { icon: Cpu, value: 'Infinite', label: 'Scale', desc: 'Whether you upload one photo or forty thousand, our distributed engine handles it without breaking a sweat.' },
];

export function Performance() {
  const container = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    ScrollTrigger.create({
      trigger: container.current,
      start: "top top",
      end: "+=400%", // 4 cards
      pin: true,
      animation: gsap.timeline()
        .to(cardsRef.current[0], { opacity: 0, scale: 0.9, y: -100, duration: 1 }, 1)
        .fromTo(cardsRef.current[1], { y: '100vh', opacity: 0, scale: 0.8 }, { y: '0vh', opacity: 1, scale: 1, duration: 1 }, 1)
        
        .to(cardsRef.current[1], { opacity: 0, scale: 0.9, y: -100, duration: 1 }, 2)
        .fromTo(cardsRef.current[2], { y: '100vh', opacity: 0, scale: 0.8 }, { y: '0vh', opacity: 1, scale: 1, duration: 1 }, 2)
        
        .to(cardsRef.current[2], { opacity: 0, scale: 0.9, y: -100, duration: 1 }, 3)
        .fromTo(cardsRef.current[3], { y: '100vh', opacity: 0, scale: 0.8 }, { y: '0vh', opacity: 1, scale: 1, duration: 1 }, 3),
      scrub: 1, // Fluid cinematic scrub
    });
  }, { scope: container });

  return (
    <section ref={container} className="h-screen w-full overflow-hidden bg-transparent">
      
      {/* Background Title */}
      <div className="absolute inset-0 flex flex-col justify-start pt-[10vh] items-center pointer-events-none z-[1] select-none">
        <span className="font-mono text-[12px] tracking-[0.5em] uppercase text-[#E8B98A] mb-4">
          Experience
        </span>
        <h2 className="font-display text-4xl md:text-[6rem] font-extrabold text-[#C4956A]/10 leading-none text-center">
          MAGIC DISGUISED
        </h2>
      </div>

      <div className="relative w-full h-full flex items-center justify-center">
        {stats.map((stat, i) => (
          <div
            key={i}
            ref={(el) => { cardsRef.current[i] = el; }}
            className={`absolute w-full h-[100vh] mt-0 flex justify-center items-center ${i === 0 ? 'z-10' : 'z-20 rounded-t-[80px] shadow-[0_-30px_100px_rgba(0,0,0,0.8)] border-t border-[#8B5E3C]/30 glass3d !border-x-0 !border-b-0 !border-radius-[80px_80px_0_0]'}`}
            style={{ 
              opacity: i === 0 ? 1 : 0, 
              transform: i === 0 ? 'translateY(0vh)' : 'translateY(100vh)' 
            }}
          >
            <div className="w-full max-w-4xl px-6 md:px-20 relative overflow-hidden">
              
              <div className="absolute top-0 right-0 text-[18rem] md:text-[24rem] font-display font-extrabold text-[#C4956A] opacity-[0.02] select-none z-0 transform translate-x-1/4 -translate-y-1/2 leading-none pointer-events-none mix-blend-screen">
                P
              </div>
              
              <div className="flex flex-col md:flex-row items-start md:items-center gap-12 relative z-10">
                <div className="flex-shrink-0">
                  <stat.icon className="w-16 h-16 text-[#C4956A] mb-8 drop-shadow-md" strokeWidth={1.5} />
                  <span className="font-display text-5xl md:text-7xl block font-extrabold text-white mb-2 drop-shadow-sm">{stat.value}</span>
                  <h3 className="text-sm font-bold text-[#E8B98A] tracking-[0.3em] uppercase">{stat.label}</h3>
                </div>
                
                <div className="flex-1 border-tl md:border-l border-[#8B5E3C]/30 pt-8 md:pt-0 md:pl-12">
                  <p className="text-2xl md:text-3xl text-[#BFA899] font-light leading-relaxed drop-shadow-md">
                    {stat.desc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
