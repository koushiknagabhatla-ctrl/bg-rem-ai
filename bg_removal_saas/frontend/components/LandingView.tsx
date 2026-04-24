'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRef, lazy, Suspense } from 'react';
import { ArrowDown, Shield, Zap, Eye, Brain, CloudLightning, Sliders, ArrowUpRight } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { ImageComparisonSlider } from '@/components/ui/image-comparison-slider';
import { CinematicIntro } from '@/components/ui/intro-sequence';

// Lazy load the global 3D anime companion
const Awwwards3DAssistant = lazy(() => import('@/components/ui/anime-companion-3d').then(m => ({ default: m.Awwwards3DAssistant })));

/* ─── Cinematic Label ─── */
function SectionLabel({ num, label }: { num: string; label: string }) {
  return (
    <div className="flex items-center gap-4 mb-10">
      <span className="text-xs font-bold tracking-[0.3em] uppercase text-ink/70 tabular-nums">{num}</span>
      <div className="w-12 h-px bg-ink/20" />
      <span className="text-xs font-bold tracking-[0.3em] uppercase text-ink/70">{label}</span>
    </div>
  );
}

/* ─── Animated Line Reveal ─── */
function LineReveal({ children, delay = 0 }: { children: string; delay?: number }) {
  return (
    <span className="block overflow-hidden pb-4">
      <motion.span
        className="block"
        initial={{ y: '130%' }}
        whileInView={{ y: 0 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1], delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export function LandingView() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <CinematicIntro>
      <div className="w-full bg-cream selection:bg-ink selection:text-cream">
        
        {/* Global floating 3D companion locked to bottom right */}
        <div className="hidden lg:block">
          <Suspense fallback={null}>
            <Awwwards3DAssistant />
          </Suspense>
        </div>

        {/* ═══════════════════════════════════════
            HERO — Bold, Clean, Minimalist
        ═══════════════════════════════════════ */}
        <section ref={heroRef} className="relative min-h-[95vh] flex items-center justify-center overflow-hidden px-8 pt-24">
          <motion.div
            style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
            className="relative z-10 w-full max-w-[1400px] mx-auto text-left lg:text-center flex flex-col lg:items-center"
          >
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 2.2 }}
              className="mb-8">
              <span className="px-5 py-2 rounded-full border border-ink/20 text-[10px] font-bold tracking-[0.4em] uppercase text-ink flex items-center gap-2 w-fit lg:mx-auto shadow-[0_4px_20px_rgba(0,0,0,0.03)] bg-cream">
                <span className="w-2 h-2 rounded-full bg-ink animate-pulse" />
                V2.0 AI Engine Live
              </span>
            </motion.div>

            <h1 className="text-[clamp(3.5rem,10vw,10.5rem)] font-serif font-bold leading-[0.88] tracking-[-0.04em] mb-12 text-ink">
              <LineReveal delay={1.8}>Remove any</LineReveal>
              <span className="block overflow-hidden relative pb-4">
                <motion.span
                  className="block italic text-ink pr-8"
                  initial={{ y: '130%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: 1.95 }}
                >
                  background
                </motion.span>
              </span>
              <LineReveal delay={2.1}>instantly.</LineReveal>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 2.5 }}
              className="text-lg md:text-2xl text-ink/80 max-w-2xl lg:mx-auto leading-relaxed mb-16 font-medium"
            >
              Powered by a custom neural network. Pixel-perfect edges.
              Zero learning curve. Just upload and go.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.7, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row items-start lg:items-center justify-center gap-6"
            >
              <Link href="/register"
                className="relative px-12 py-5 rounded-full bg-ink text-cream font-bold text-base shadow-2xl hover:shadow-[0_15px_40px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-500 overflow-hidden group flex items-center justify-center border border-ink">
                <span className="relative z-10">Get Started Free</span>
                <div className="absolute inset-0 h-full w-full bg-cream/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left ease-[0.76,0,0.24,1]" />
              </Link>

              <Link href="/login"
                className="px-8 py-5 rounded-full text-ink font-bold text-base hover:bg-ink/[0.03] transition-all duration-500 flex items-center gap-3 group border border-transparent hover:border-ink/10">
                Sign In
                <span className="w-8 h-8 rounded-full border border-ink/20 flex items-center justify-center group-hover:border-ink/50 group-hover:bg-ink/5 transition-colors duration-500">
                  <ArrowUpRight className="w-3.5 h-3.5 text-ink transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.5 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10"
          >
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
              <ArrowDown className="w-5 h-5 text-ink/40" />
            </motion.div>
          </motion.div>
        </section>

        {/* ═══════════ MARQUEE ═══════════ */}
        <section className="py-12 border-y border-ink/[0.08] overflow-hidden bg-ink/5 relative">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-cream to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-cream to-transparent z-10" />
          <div className="marquee-track">
            {[...Array(2)].map((_, setIdx) => (
              <div key={setIdx} className="flex items-center gap-24 px-12">
                {['NEXT GEN AI', 'PIXEL PERFECT', 'ZERO STORAGE', 'ONE CLICK', 'FULL RESOLUTION', 'SECURE', 'INT8 QUANTIZED', 'SUB-SECOND'].map((text) => (
                  <span key={`${setIdx}-${text}`} className="text-sm font-bold tracking-[0.3em] text-ink/70 whitespace-nowrap">{text}</span>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════ S1 — COMPARE ═══════════ */}
        <section className="py-32 md:py-48 px-10">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 lg:gap-32 items-center">
              <div>
                <ScrollReveal variant="fade-right"><SectionLabel num="01" label="The Quality" /></ScrollReveal>
                <ScrollReveal variant="fade-up" delay={0.1}>
                  <h2 className="text-5xl md:text-[5.5rem] font-serif font-bold leading-[0.95] tracking-tight mb-10 text-ink">
                    One image in,<br /><em className="text-ink">perfect cutout</em> out.
                  </h2>
                </ScrollReveal>
                <ScrollReveal variant="fade-up" delay={0.2}>
                  <p className="text-xl md:text-2xl text-ink/80 leading-relaxed mb-12 lg:max-w-xl font-medium">
                    Hair strands. Transparent glass. Complex edges. Our U-Net handles what was impossible before — in under a second.
                  </p>
                </ScrollReveal>
                <ScrollReveal variant="fade-up" delay={0.3}>
                  <Link href="/register"
                    className="inline-flex items-center gap-4 text-lg font-bold text-ink group border-b-2 border-ink/20 pb-3 hover:border-ink transition-all duration-500">
                    Try it yourself
                    <ArrowUpRight className="w-5 h-5 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </Link>
                </ScrollReveal>
              </div>

              <ScrollReveal variant="scale" delay={0.2} duration={1.2}>
                <div className="rounded-[3rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-ink/[0.08] relative group/slider">
                  <div className="aspect-[4/3] bg-ink/5">
                    <ImageComparisonSlider
                      leftImage="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&q=80"
                      rightImage="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&q=80&monochrome=ffffff"
                      altLeft="Original"
                      altRight="Background removed"
                    />
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ═══════════ S2 — HOW IT WORKS ═══════════ */}
        <section className="py-32 md:py-48 px-10 bg-ink/[0.02]">
          <div className="max-w-[1400px] mx-auto">
            <ScrollReveal variant="fade-up"><SectionLabel num="02" label="The Process" /></ScrollReveal>
            <ScrollReveal variant="fade-up" delay={0.1}>
              <h2 className="text-5xl md:text-[6rem] font-serif font-bold leading-[0.95] tracking-tight mb-32 text-ink">
                Three steps to a<br /><em className="text-ink">flawless</em> result.
              </h2>
            </ScrollReveal>

            <div className="space-y-0">
              {[
                { num: "01", title: "Upload your image", desc: "Drag and drop, or click to browse. JPG, PNG, WEBP up to 20MB. Your image stays private — processed in-memory, never stored." },
                { num: "02", title: "AI does the magic", desc: "Our neural network isolates the foreground with pixel-level accuracy. INT8 quantized for unmatched serverless speed." },
                { num: "03", title: "Compare & download", desc: "Interactive before/after slider to inspect quality. Export as transparent PNG, white or black background. No watermarks." },
              ].map((step, i) => (
                <ScrollReveal key={step.num} variant="fade-up" delay={i * 0.15}>
                  <div className="flex flex-col lg:flex-row gap-8 lg:gap-24 py-20 border-b border-ink/10 last:border-0 group cursor-default transition-colors duration-500 hover:bg-ink/[0.04] lg:px-12 rounded-[2.5rem]">
                    <div className="text-6xl md:text-8xl font-serif font-bold text-ink/10 shrink-0 tabular-nums transition-all duration-700 group-hover:text-ink">{step.num}</div>
                    <div className="mt-2">
                      <h3 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-ink transition-transform duration-700 origin-left group-hover:translate-x-4">{step.title}</h3>
                      <p className="text-xl text-ink/80 leading-relaxed max-w-2xl font-medium transition-transform duration-700 origin-left group-hover:translate-x-4">{step.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ S3 — FEATURES ═══════════ */}
        <section className="py-32 md:py-48 px-10">
          <div className="max-w-[1400px] mx-auto">
            <ScrollReveal variant="fade-up"><SectionLabel num="03" label="The details" /></ScrollReveal>
            <ScrollReveal variant="fade-up" delay={0.1}>
              <h2 className="text-5xl md:text-[6rem] font-serif font-bold leading-[0.95] tracking-tight mb-32 text-ink">
                Every pixel,<br /><em className="text-ink">every detail</em>.
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: <Brain className="w-6 h-6" />, title: "Custom Architecture", desc: "MobileNetV3 U-Net with CBAM trained on millions of images." },
                { icon: <Zap className="w-6 h-6" />, title: "Sub-Second Speed", desc: "INT8 quantized inference. Ready before you finish blinking." },
                { icon: <Shield className="w-6 h-6" />, title: "Zero Storage", desc: "HMAC-SHA256 signed requests. Processed in RAM, never saved." },
                { icon: <Sliders className="w-6 h-6" />, title: "Full Resolution", desc: "No downscaling, no compression. Pixel-for-pixel accuracy." },
                { icon: <CloudLightning className="w-6 h-6" />, title: "Multiple Exports", desc: "Transparent, white, or black background. One click each." },
                { icon: <Eye className="w-6 h-6" />, title: "Live Comparison", desc: "Interactive slider shows exact quality before downloading." },
              ].map((feature, i) => (
                <ScrollReveal key={feature.title} variant="fade-up" delay={i * 0.1}>
                  <div className="p-12 h-full border border-ink/[0.08] rounded-[2.5rem] bg-ink/[0.02] hover:bg-ink/[0.05] transition-all duration-700 group cursor-default hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-4">
                    <div className="w-16 h-16 rounded-full bg-ink/5 flex items-center justify-center text-ink mb-10 transition-transform duration-700 group-hover:scale-110 group-hover:bg-ink group-hover:text-cream">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-ink mb-4 transition-transform duration-700 group-hover:translate-x-2">{feature.title}</h3>
                    <p className="text-lg text-ink/80 leading-relaxed font-medium transition-transform duration-700 group-hover:translate-x-2">{feature.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ S4 — CTA ═══════════ */}
        <section className="py-32 md:py-48 px-10 bg-ink text-cream relative overflow-hidden rounded-t-[4rem]">
          {/* Subtle background element */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-cream/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="max-w-[1400px] mx-auto text-center relative z-10">
            <ScrollReveal variant="scale" duration={1.2}>
              <div className="inline-block px-6 py-2 rounded-full border border-cream/20 text-xs font-bold tracking-[0.4em] uppercase text-cream/70 bg-cream/5 mb-14">
                Get started today
              </div>
              <h2 className="text-5xl md:text-[7rem] font-serif font-bold leading-[0.9] tracking-tight mb-12">
                Ready to remove<br /><em className="text-cream/80">backgrounds?</em>
              </h2>
              <p className="text-xl md:text-2xl text-cream/60 mb-16 max-w-lg mx-auto font-medium">
                50 free credits. No credit card. No watermarks.
              </p>
              <Link href="/register"
                className="inline-flex items-center justify-center px-16 py-7 rounded-full bg-cream text-ink font-bold text-xl shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:scale-105 hover:shadow-[0_20px_60px_rgba(255,255,255,0.2)] transition-all duration-500">
                Start creating for free
              </Link>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════ FOOTER ═══════════ */}
        <footer className="bg-ink pb-12 px-10">
          <div className="border-t border-cream/10 pt-10 mt-0">
            <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
              <span className="text-xl font-serif font-bold text-cream">VCranks <em className="text-cream/50">AI</em></span>
              <p className="text-sm font-medium text-cream/50">© 2026 VCranks AI. All rights reserved.</p>
              <div className="flex gap-12">
                <Link href="/about" className="text-sm font-bold text-cream/70 hover:text-cream transition-colors duration-300 tracking-wider">ABOUT</Link>
                <Link href="/login" className="text-sm font-bold text-cream/70 hover:text-cream transition-colors duration-300 tracking-wider">SIGN IN</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </CinematicIntro>
  );
}
