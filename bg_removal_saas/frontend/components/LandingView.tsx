'use client';
import { motion, useScroll, useTransform, useAnimation, useInView } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowDown, Shield, Zap, Eye, Brain, CloudLightning, Sliders, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { ImageComparisonSlider } from '@/components/ui/image-comparison-slider';
import { CinematicIntro } from '@/components/ui/intro-sequence';

const premiumEase = [0.16, 1, 0.3, 1] as const;

/* ─── Cinematic Label ─── */
function SectionLabel({ num, label }: { num: string; label: string }) {
  return (
    <div className="flex items-center gap-6 mb-12">
      <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-ink/40 tabular-nums">{num}</span>
      <div className="w-16 h-[1px] bg-ink/10" />
      <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-ink/70">{label}</span>
    </div>
  );
}

/* ─── Horizontal Scroll Gallery (Coffee-Tech Inspired) ─── */
function HorizontalGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  // Map vertical scroll (0 to 1) into horizontal translation
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-66.66%"]);

  return (
    <section ref={containerRef} className="relative h-[300vh] bg-ink">
      <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden overflow-x-hidden">
        <motion.div style={{ x }} className="flex gap-12 px-12 md:px-32 h-[70vh]">
          {/* Gallery Card 1 */}
          <div className="w-[85vw] md:w-[60vw] h-full flex-shrink-0 flex flex-col md:flex-row gap-8 items-center bg-cream/5 rounded-[2rem] p-8 md:p-12 border border-cream/10">
            <div className="flex-1 w-full relative h-[40vh] md:h-full rounded-2xl overflow-hidden bg-black shadow-2xl">
              <ImageComparisonSlider
                leftImage="https://images.unsplash.com/photo-1512418490979-9ce98fdb4542?w=1000&q=80"
                rightImage="https://images.unsplash.com/photo-1512418490979-9ce98fdb4542?w=1000&q=80&monochrome=dddddd"
                altLeft="Subject" altRight="Extracted"
              />
            </div>
            <div className="w-full md:w-[35%] flex flex-col justify-center">
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-cream/40 mb-4 block">01 // Portrait</span>
              <h3 className="text-4xl md:text-5xl font-serif font-bold text-cream mb-6">Subject Isolation.</h3>
              <p className="text-cream/60 font-medium leading-relaxed">
                Aggressive neural modeling ensures zero detail loss on human subjects. From stray hairs to transparent fabrics, the AI semantically understands depth.
              </p>
            </div>
          </div>

          {/* Gallery Card 2 */}
          <div className="w-[85vw] md:w-[60vw] h-full flex-shrink-0 flex flex-col md:flex-row gap-8 items-center bg-cream/5 rounded-[2rem] p-8 md:p-12 border border-cream/10">
            <div className="flex-1 w-full relative h-[40vh] md:h-full rounded-2xl overflow-hidden bg-black shadow-2xl">
              <ImageComparisonSlider
                leftImage="https://images.unsplash.com/photo-1549416878-b9ca95e26903?w=1000&q=80"
                rightImage="https://images.unsplash.com/photo-1549416878-b9ca95e26903?w=1000&q=80&monochrome=dddddd"
                altLeft="Product" altRight="Extracted"
              />
            </div>
            <div className="w-full md:w-[35%] flex flex-col justify-center">
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-cream/40 mb-4 block">02 // Objects</span>
              <h3 className="text-4xl md:text-5xl font-serif font-bold text-cream mb-6">E-Commerce Ready.</h3>
              <p className="text-cream/60 font-medium leading-relaxed">
                Hard edges and metallic reflections are preserved perfectly. VCranks eliminates hours of manual pen-tool clipping for product listings.
              </p>
            </div>
          </div>

          {/* Gallery Card 3 */}
          <div className="w-[85vw] md:w-[60vw] h-full flex-shrink-0 flex flex-col md:flex-row gap-8 items-center bg-cream/5 rounded-[2rem] p-8 md:p-12 border border-cream/10">
            <div className="flex-1 w-full relative h-[40vh] md:h-full rounded-2xl overflow-hidden bg-black shadow-2xl">
              <ImageComparisonSlider
                leftImage="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&q=80"
                rightImage="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&q=80&monochrome=dddddd"
                altLeft="Complex" altRight="Extracted"
              />
            </div>
            <div className="w-full md:w-[35%] flex flex-col justify-center">
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-cream/40 mb-4 block">03 // Complex</span>
              <h3 className="text-4xl md:text-5xl font-serif font-bold text-cream mb-6">Foliage & Mesh.</h3>
              <p className="text-cream/60 font-medium leading-relaxed">
                Tackling the impossible. Our model processes sub-pixel transparencies and complex meshes like plant leaves and chainlink without ghosting artifacts.
              </p>
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}

/* ─── Oryzo Tech Grid Card ─── */
function TechGridCard({ icon, title, desc, delay = 0 }: { icon: React.ReactNode, title: string, desc: string, delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8, delay: delay * 0.1, ease: premiumEase }}
      className="relative p-10 border border-ink/10 bg-cream/50 overflow-hidden group hover:scale-[1.02] transition-transform duration-500 rounded-3xl"
    >
      {/* Oryzo-style hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-ink/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-xl border border-ink/10 flex items-center justify-center text-ink mb-16 bg-cream shadow-sm">
          {icon}
        </div>
        <h3 className="text-2xl font-serif font-bold text-ink mb-4">{title}</h3>
        <p className="text-sm font-medium text-ink/60 leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

export function LandingView() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Delay setting mounted to ensure Framer Motion hydration strictly after layout
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <CinematicIntro>
      <main className="w-full bg-cream selection:bg-ink selection:text-cream font-sans overflow-hidden">
        
        {/* ═══════════════════════════════════════
            HERO — Minimalist, Typography-led
        ═══════════════════════════════════════ */}
        <section className="relative w-full min-h-screen flex flex-col justify-center px-6 md:px-12 pt-32 pb-20 overflow-hidden">
          
          {/* Subtle tech background lines (Oryzo derived) */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
            <div className="h-full w-px bg-ink absolute left-1/4" />
            <div className="h-full w-px bg-ink absolute left-[90%]" />
            <div className="w-full h-px bg-ink absolute top-1/4" />
          </div>

          <div className="w-full max-w-[1600px] mx-auto z-10">
            {/* Tagline */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={isMounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} 
              transition={{ duration: 1.2, delay: 0.2, ease: premiumEase }}
              className="mb-8 md:mb-12"
            >
              <span className="flex items-center gap-3 w-fit px-4 py-2 rounded-full border border-ink/10 bg-cream/50 backdrop-blur-sm text-[10px] font-bold tracking-[0.3em] uppercase text-ink/80 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ink opacity-40"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-ink"></span>
                </span>
                V2.0 Core Engine API Live
              </span>
            </motion.div>

            {/* Massive Awwwards-style Typography (Forced Animation) */}
            <h1 className="text-[clamp(4.5rem,13vw,16rem)] leading-[0.82] tracking-[-0.04em] font-serif font-bold text-ink mb-12 lg:mb-16">
              <span className="block overflow-hidden pb-4">
                <motion.span className="block" initial={{ y: '110%' }} animate={isMounted ? { y: 0 } : { y: '110%' }} transition={{ duration: 1.2, ease: premiumEase, delay: 0.3 }}>
                  Flawless
                </motion.span>
              </span>
              <span className="block overflow-hidden relative pb-4">
                <motion.span className="block italic font-light opacity-90 pr-8 text-ink/80" initial={{ y: '110%' }} animate={isMounted ? { y: 0 } : { y: '110%' }} transition={{ duration: 1.2, ease: premiumEase, delay: 0.4 }}>
                  background
                </motion.span>
              </span>
              <span className="block overflow-hidden pb-4">
                <motion.span className="block" initial={{ y: '110%' }} animate={isMounted ? { y: 0 } : { y: '110%' }} transition={{ duration: 1.2, ease: premiumEase, delay: 0.5 }}>
                  removal.
                </motion.span>
              </span>
            </h1>

            {/* Supporting Text & Buttons */}
            <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-12 w-full border-t border-ink/10 pt-12">
              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={isMounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 1.2, delay: 0.8, ease: premiumEase }}
                className="text-xl md:text-3xl text-ink/70 max-w-2xl font-medium leading-relaxed tracking-tight"
              >
                Zero manual masking. Zero pixelation. Enterprise-grade AI processing locally. Powering the next generation of creative pipelines.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={isMounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 1.2, delay: 1, ease: premiumEase }}
                className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
              >
                <Link href="/register"
                  className="w-full sm:w-auto px-10 py-5 rounded-full bg-ink text-cream font-bold text-sm tracking-wide shadow-2xl hover:scale-105 hover:bg-ink/90 transition-all duration-500 flex items-center justify-center">
                  Start for Free
                </Link>
                <Link href="/login"
                  className="w-full sm:w-auto px-8 py-5 rounded-full border border-ink/20 text-ink font-bold text-sm tracking-wide hover:bg-ink/5 transition-all duration-500 flex items-center justify-center">
                  Sign In
                </Link>
              </motion.div>
            </div>
            
          </div>
        </section>

        {/* ═══════════ S1 — COFFEE-TECH HORIZONTAL GALLERY ═══════════ */}
        <div className="w-full bg-ink flex flex-col items-center justify-center py-20 px-6">
           <SectionLabel num="01" label="The Quality" />
           <h2 className="text-3xl md:text-5xl text-cream font-serif text-center max-w-4xl leading-[1.2]">
            Our architecture achieves <span className="italic text-cream/70">semantic understanding</span> of the foreground. Stop fighting the magic wand tool. 
           </h2>
        </div>

        <HorizontalGallery />

        {/* ═══════════ S2 — ORYZO TECH GRID ═══════════ */}
        <section className="py-32 md:py-48 px-6 md:px-12 bg-cream">
          <div className="max-w-[1600px] mx-auto">
            <div className="mb-24 md:mb-32">
              <ScrollReveal variant="fade-up">
                <SectionLabel num="02" label="Performance" />
              </ScrollReveal>
              <ScrollReveal variant="fade-up" delay={0.1} className="max-w-4xl">
                <h2 className="text-4xl md:text-[5rem] font-serif font-bold leading-[0.95] tracking-tight text-ink mb-12">
                  Engineered entirely <span className="italic opacity-80">without compromise.</span>
                </h2>
                <p className="text-xl md:text-2xl text-ink/60 font-medium leading-relaxed max-w-2xl">
                  We bypassed third-party APIs and built a custom neural infrastructure aggressively optimized for edge computing and sub-second inference.
                </p>
              </ScrollReveal>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <TechGridCard delay={1} icon={<Brain />} title="U-Net Architecture" desc="A specifically modified MobileNetV3-Small U-Net model trained aggressively on the P3M-10K data for human-centric semantic understanding." />
              <TechGridCard delay={2} icon={<Zap />} title="INT8 Quantization" desc="The entire neural network runs via INT8 ONNX web inference. Bare-metal performance that doesn't melt your device." />
              <TechGridCard delay={3} icon={<Shield />} title="Zero Storage Pipeline" desc="Images are processed via fully encrypted, in-memory buffers. We store absolutely nothing. Strict data sovereignty." />
              <TechGridCard delay={4} icon={<Sliders />} title="Full Resolution Preservation" desc="Your images are never arbitrarily downscaled. The AI perfectly matches the extracted alpha mask to your original resolution." />
              <TechGridCard delay={5} icon={<CloudLightning />} title="Vercel Edge Network" desc="Distributed globally. Our backend pipelines execute directly on Edge infrastructure ensuring virtually zero latency." />
              <TechGridCard delay={6} icon={<Eye />} title="Perfect Edge Output" desc="Complex gradients, transparent glass, motion blur, and fine hair strands are extracted flawlessly without rigid pixel stepping." />
            </div>
          </div>
        </section>

        {/* ═══════════ S3 — SHADER.SE FOOTER CTA ═══════════ */}
        <section className="py-40 md:py-64 px-6 md:px-12 bg-ink text-cream relative overflow-hidden rounded-t-[3rem] md:rounded-t-[5rem]">
          {/* Giant Shader.se text in background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none opacity-[0.02]">
            <span className="text-[25vw] font-serif font-bold whitespace-nowrap tracking-tighter">VCRANKS</span>
          </div>

          <div className="max-w-[1200px] mx-auto text-center flex flex-col items-center relative z-10">
            <ScrollReveal variant="fade-up" duration={1}>
              <span className="px-6 py-2 rounded-full border border-cream/20 text-[10px] font-bold tracking-[0.4em] uppercase text-cream/70 mb-10 inline-block shadow-lg">
                Your Studio Awaits
              </span>
              <h2 className="text-[clamp(4rem,10vw,9rem)] font-serif font-bold leading-[0.85] tracking-tight mb-12">
                Experience the <span className="italic font-light opacity-80 block md:inline mt-4 md:mt-0">difference.</span>
              </h2>
              <p className="text-xl md:text-3xl text-cream/60 font-medium mb-20 max-w-3xl mx-auto leading-relaxed">
                No credit card required. Receive 50 free high-resolution extractions securely.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-16 py-6 border border-cream/20 rounded-full bg-cream text-ink font-bold text-lg tracking-wide hover:scale-[1.03] transition-all duration-500 shadow-[0_0_80px_rgba(255,255,255,0.1)]">
                  Begin Free Trial
                </Link>
                <Link href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-12 py-6 rounded-full border border-cream/20 bg-transparent text-cream font-bold text-lg tracking-wide hover:bg-cream/5 transition-all duration-500">
                  Client Sign In
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════ ACTUAL FOOTER ═══════════ */}
        <footer className="bg-[#050505] pb-12 px-6 md:px-12 pt-20">
          <div className="max-w-[1600px] mx-auto border-t border-white/5 pt-12 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-6">
            <span className="text-2xl font-serif font-bold text-white">VCranks <em className="text-white/50">AI</em></span>
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/30 text-center md:text-left">
              © 2026 VCranks AI. Developed by Koushik. <br className="md:hidden" /> All Rights Reserved.
            </p>
            <div className="flex items-center gap-8">
              <Link href="/about" className="text-[10px] font-bold text-white/50 hover:text-white transition-colors duration-300 tracking-[0.3em] uppercase">About Concept</Link>
              <Link href="/login" className="text-[10px] font-bold text-white/50 hover:text-white transition-colors duration-300 tracking-[0.3em] uppercase">Client Portal</Link>
            </div>
          </div>
        </footer>
      </main>
    </CinematicIntro>
  );
}
