'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  { 
    quote: <>We plugged VCrancks into our pipeline and it <span className="text-[#E8B98A] font-semibold">saved us 4,000 hours</span> of manual catalog work this quarter alone. Game changer.</>, 
    name: 'Sarah Jenkins', 
    role: 'Creative Director',
    company: 'NeoBrand'
  },
  { 
    quote: <>The way it handles stray hair is honestly wild. <span className="text-[#E8B98A] font-semibold">Nothing else comes close</span> — and I've tried every single tool out there.</>, 
    name: 'Marcus Wei', 
    role: 'Lead Photographer',
    company: 'Vogue Studios'
  },
  { 
    quote: <>We ran <span className="text-[#E8B98A] font-semibold">40,000 product shots</span> through it in one afternoon. Sub-second per image at full 4K. Our old workflow could never.</>, 
    name: 'Priya Sharma', 
    role: 'Head of Operations',
    company: 'LuxeRetail'
  },
  { 
    quote: <>Glass bottles, smoke, transparent fabrics — things that break every other tool? VCrancks handles them with <span className="text-[#E8B98A] font-semibold">zero artifacts.</span></>, 
    name: 'Tomás Rivera', 
    role: 'Product Designer',
    company: 'Visionary Co'
  },
  { 
    quote: <>Finally, a tool that <span className="text-[#E8B98A] font-semibold">doesn't downscale my images.</span> What I upload is what I get back — just without the background. That's all I ever wanted.</>, 
    name: 'Ella Thornton', 
    role: 'Freelance Retoucher',
    company: 'Independent'
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

export function Testimonials() {
  return (
    <section id="testimonials" className="relative py-24 md:py-32 overflow-hidden bg-transparent z-10">
      
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-[-10%] -translate-y-1/2 w-[40vw] h-[50vh] bg-[#C4956A]/[0.04] rounded-full blur-[160px] pointer-events-none" />

      <div className="w-full max-w-[1400px] mx-auto px-6 md:px-16">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.3, ease }}
          className="mb-14 md:mb-18"
        >
          <span className="font-mono text-[11px] tracking-[0.4em] uppercase text-[#E8B98A]/80 mb-4 md:mb-5 block">
            Real people. Real results.
          </span>
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1]">
            Trusted by creatives <br className="hidden md:block"/>
            <span className="italic font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#C4956A] via-[#E8B98A] to-[#8B5E3C]">
              who refuse to compromise.
            </span>
          </h2>
        </motion.div>

        {/* Scrolling Testimonial Carousel */}
        <div className="relative overflow-hidden testimonial-container">
          <div className="testimonial-track gap-5">
            {[...testimonials, ...testimonials].map((t, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[360px] md:w-[420px]"
              >
                <div className="group relative h-full">
                  {/* Hover glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#C4956A]/0 to-[#C4956A]/8 rounded-[1.75rem] transition-all duration-700 blur-xl opacity-0 group-hover:opacity-100" />
                  
                  <div className="relative flex flex-col justify-between p-7 md:p-9 !rounded-[1.75rem] border border-[#8B5E3C]/12 glass3d bg-[#0A0604]/50 backdrop-blur-[48px] shadow-[0_16px_50px_rgba(0,0,0,0.5)] overflow-hidden h-full group-hover:border-[#8B5E3C]/25 transition-all duration-700">
                    
                    <Quote className="absolute top-6 right-6 w-12 h-12 text-[#C4956A]/[0.05] pointer-events-none" />

                    <p className="text-[15px] md:text-base font-body text-[#FFFFFF]/85 leading-[1.6] mb-7 relative z-10">
                      &ldquo;{t.quote}&rdquo;
                    </p>

                    <div className="flex items-center gap-3.5 relative z-10">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1F140D] to-[#0A0604] border border-[#8B5E3C]/30 flex items-center justify-center text-[#E8B98A] font-display font-bold text-sm shadow-[0_0_12px_rgba(200,150,100,0.1)]">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white/90">{t.name}</p>
                        <p className="text-[11px] font-mono text-[#C4956A]/60 mt-0.5">{t.role}, {t.company}</p>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
