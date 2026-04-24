'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';
import { ArrowDown, Shield, Zap, Eye, Brain, CloudLightning, Sliders, ArrowUpRight } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { ImageComparisonSlider } from '@/components/ui/image-comparison-slider';
import { CinematicIntro } from '@/components/ui/intro-sequence';

/* ─── Premium Easing & Variants ─── */
const premiumEase = [0.16, 1, 0.3, 1] as const; // Very snappy, elegant curve typical of Awwwards sites

const revealVariant = {
  hidden: { y: '100%', opacity: 0 },
  visible: (custom: number) => ({
    y: 0,
    opacity: 1,
    transition: { delay: custom * 0.1 + 1.5, duration: 1.2, ease: premiumEase }
  })
};

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

/* ─── Animated Text Reveal ─── */
function TextReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <span className="block overflow-hidden pb-4">
      <motion.span
        className="block"
        custom={delay}
        variants={revealVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.8 }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export function LandingView() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  
  // Parallax effects for the Hero section
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);

  return (
    <CinematicIntro>
      <main className="w-full bg-cream selection:bg-ink selection:text-cream font-sans">
        
        {/* ═══════════════════════════════════════
            HERO — Minimalist, Typography-led
        ═══════════════════════════════════════ */}
        <section ref={heroRef} className="relative w-full min-h-screen flex flex-col justify-center px-6 md:px-12 pt-32 pb-20">
          <motion.div 
            style={{ y: heroY, opacity: heroOpacity }}
            className="w-full max-w-[1600px] mx-auto z-10"
          >
            {/* Tagline */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1.8, ease: premiumEase }}
              className="mb-8 md:mb-12"
            >
              <span className="flex items-center gap-3 w-fit px-4 py-2 rounded-full border border-ink/10 bg-cream/50 backdrop-blur-sm text-[10px] font-bold tracking-[0.3em] uppercase text-ink/80">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ink opacity-40"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-ink"></span>
                </span>
                V2.0 Core Engine API Live
              </span>
            </motion.div>

            {/* Massive Awwwards-style Typography */}
            <h1 className="text-[clamp(4rem,12vw,14rem)] leading-[0.85] tracking-[-0.04em] font-serif font-bold text-ink mb-12 lg:mb-16">
              <TextReveal delay={0}>Flawless</TextReveal>
              <div className="flex items-center gap-4 md:gap-12 flex-wrap">
                <TextReveal delay={1}>
                  <span className="italic font-light opacity-90 pr-4">background</span>
                </TextReveal>
              </div>
              <TextReveal delay={2}>removal.</TextReveal>
            </h1>

            {/* Supporting Text & Buttons */}
            <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-12 w-full border-t border-ink/10 pt-10">
              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 2.3, ease: premiumEase }}
                className="text-lg md:text-2xl text-ink/70 max-w-2xl font-medium leading-relaxed"
              >
                Zero manual masking. Zero pixelation. Upload your image and let our neural network deliver perfect, crisp edges instantly.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 2.5, ease: premiumEase }}
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
            
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.2 }}
            className="absolute bottom-8 left-12 hidden md:flex items-center gap-4 text-[10px] font-bold tracking-[0.3em] uppercase text-ink/40"
          >
            <div className="w-[1px] h-12 bg-ink/20 overflow-hidden relative">
              <motion.div animate={{ top: ["-100%", "100%"] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute left-0 w-full h-1/2 bg-ink" />
            </div>
            Scroll to explore
          </motion.div>
        </section>

        {/* ═══════════ S1 — COMPARE SECTION ═══════════ */}
        <section className="py-32 md:py-48 px-6 md:px-12 bg-ink text-cream relative">
          <div className="max-w-[1600px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              
              {/* Text Side */}
              <div className="order-2 lg:order-1">
                <ScrollReveal variant="fade-up">
                  <div className="flex items-center gap-6 mb-12">
                    <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-cream/40 tabular-nums">01</span>
                    <div className="w-16 h-[1px] bg-cream/10" />
                    <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-cream/70">The Quality</span>
                  </div>
                </ScrollReveal>

                <ScrollReveal variant="fade-up" delay={0.1}>
                  <h2 className="text-[clamp(3rem,6vw,5.5rem)] font-serif font-bold leading-[0.9] tracking-tight mb-8">
                    Hair strands.<br />
                    <span className="italic font-light text-cream/70">Glass edges.</span><br />
                    No problem.
                  </h2>
                </ScrollReveal>

                <ScrollReveal variant="fade-up" delay={0.2}>
                  <p className="text-xl md:text-2xl text-cream/60 leading-relaxed mb-12 font-medium max-w-xl">
                    Our architecture achieves semantic understanding of the foreground. Stop fighting the magic wand tool. Process intricate details in sub-seconds.
                  </p>
                </ScrollReveal>

                <ScrollReveal variant="fade-up" delay={0.3}>
                  <Link href="/register"
                    className="inline-flex items-center gap-4 text-base font-bold text-cream tracking-wide group border-b border-cream/20 pb-2 hover:border-cream transition-colors duration-500">
                    Test the model
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </Link>
                </ScrollReveal>
              </div>

              {/* Slider Side */}
              <ScrollReveal variant="fade-up" delay={0.2} className="order-1 lg:order-2 w-full h-full">
                <div className="rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-cream/10 bg-black aspect-[4/3] relative group">
                  <ImageComparisonSlider
                    leftImage="https://images.unsplash.com/photo-1549416878-b9ca95e26903?w=1000&q=80"
                    rightImage="https://images.unsplash.com/photo-1549416878-b9ca95e26903?w=1000&q=80&monochrome=000000"
                    altLeft="Original Output"
                    altRight="Background Extracted"
                  />
                </div>
              </ScrollReveal>

            </div>
          </div>
        </section>

        {/* ═══════════ S2 — THE PROCESS ═══════════ */}
        <section className="py-32 md:py-48 px-6 md:px-12 bg-cream">
          <div className="max-w-[1600px] mx-auto">
            <ScrollReveal variant="fade-up">
              <SectionLabel num="02" label="Workflow" />
            </ScrollReveal>
            
            <ScrollReveal variant="fade-up" delay={0.1}>
              <h2 className="text-[clamp(3.5rem,8vw,7rem)] font-serif font-bold leading-[0.9] tracking-tight mb-24 md:mb-40 text-ink">
                Built for <span className="italic font-light opacity-80">velocity.</span>
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
              {[
                { step: "01", title: "Upload", desc: "Drag and drop any image up to 20MB. Fully encrypted, entirely in-memory processing. We store absolutely nothing." },
                { step: "02", title: "Analyze", desc: "The neural network runs inference via INT8 quantization, guaranteeing a semantic map of your image almost instantly." },
                { step: "03", title: "Export", desc: "Direct download the high-resolution PNG with perfect alpha transparency, or quickly generate a solid backdrop context." }
              ].map((item, i) => (
                <ScrollReveal key={item.step} variant="fade-up" delay={i * 0.15}>
                  <div className="flex flex-col border-t border-ink/10 pt-8 group cursor-default">
                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-ink/40 mb-8 tabular-nums group-hover:text-ink transition-colors duration-500">{item.step}</span>
                    <h3 className="text-3xl font-serif font-bold text-ink mb-6">{item.title}</h3>
                    <p className="text-lg text-ink/70 font-medium leading-relaxed pr-4">{item.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ S3 — GRID FEATURES ═══════════ */}
        <section className="py-32 md:py-48 px-6 md:px-12 bg-ink/5">
          <div className="max-w-[1600px] mx-auto">
            <div className="mb-24 md:mb-32">
               <ScrollReveal variant="fade-up">
                <SectionLabel num="03" label="Performance" />
              </ScrollReveal>
              <ScrollReveal variant="fade-up" delay={0.1} className="max-w-4xl">
                <h2 className="text-4xl md:text-6xl font-serif font-bold leading-[1.1] tracking-tight text-ink">
                  A professional toolset engineered entirely without compromise.
                </h2>
              </ScrollReveal>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: <Brain />, title: "U-Net Architecture", desc: "Trained aggressively on P3M-10K data." },
                { icon: <Zap />, title: "INT8 Quantized", desc: "Bare-metal performance. Lightning fast." },
                { icon: <Shield />, title: "Zero Cache", desc: "Crypto-signed URLs. RAM only." },
                { icon: <Sliders />, title: "Full Resolution", desc: "Never downscaled. Pixel matching." },
                { icon: <CloudLightning />, title: "Vercel Edge", desc: "Distributed globally. Zero latency." },
                { icon: <Eye />, title: "Perfect Cut", desc: "Flawless hair, glass & motion." },
              ].map((feature, i) => (
                <ScrollReveal key={feature.title} variant="fade-up" delay={i * 0.1}>
                  <div className="p-10 border border-ink/10 bg-cream group hover:bg-ink transition-colors duration-500 rounded-2xl h-full flex flex-col justify-between">
                    <div className="w-12 h-12 rounded-full border border-ink/10 flex items-center justify-center text-ink mb-12 group-hover:bg-cream group-hover:text-ink transition-colors duration-500">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-ink mb-3 group-hover:text-cream transition-colors duration-500">{feature.title}</h3>
                      <p className="text-sm font-medium text-ink/60 group-hover:text-cream/70 transition-colors duration-500">{feature.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ S4 — CTA CTA ═══════════ */}
        <section className="py-40 md:py-64 px-6 md:px-12 bg-ink text-cream rounded-t-[3rem] md:rounded-t-[5rem] overflow-hidden">
          <div className="max-w-[1200px] mx-auto text-center flex flex-col items-center">
            <ScrollReveal variant="fade-up" duration={1}>
              <span className="px-6 py-2 rounded-full border border-cream/20 text-[10px] font-bold tracking-[0.4em] uppercase text-cream/70 mb-10 inline-block">
                Start Now
              </span>
              <h2 className="text-[clamp(3.5rem,8vw,8rem)] font-serif font-bold leading-[0.9] tracking-tight mb-12">
                Experience the <span className="italic font-light opacity-80">difference.</span>
              </h2>
              <p className="text-xl md:text-2xl text-cream/60 font-medium mb-16 max-w-2xl mx-auto">
                No credit card required. Receive 50 free high-resolution extractions securely.
              </p>
              <Link href="/register"
                className="inline-flex items-center justify-center px-16 py-6 rounded-full bg-cream text-ink font-bold text-lg tracking-wide hover:scale-105 transition-transform duration-500 shadow-2xl">
                Begin Free Trial
              </Link>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════ FOOTER ═══════════ */}
        <footer className="bg-ink pb-8 px-6 md:px-12 pt-20">
          <div className="max-w-[1600px] mx-auto border-t border-cream/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <span className="text-xl font-serif font-bold text-cream">VCranks <em className="text-cream/50">AI</em></span>
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-cream/40">© 2026 VCranks AI. Developed by Koushik.</p>
            <div className="flex items-center gap-8">
              <Link href="/about" className="text-[11px] font-bold text-cream/60 hover:text-cream transition-colors duration-300 tracking-[0.2em] uppercase">About</Link>
              <Link href="/login" className="text-[11px] font-bold text-cream/60 hover:text-cream transition-colors duration-300 tracking-[0.2em] uppercase">Client Login</Link>
            </div>
          </div>
        </footer>
      </main>
    </CinematicIntro>
  );
}
