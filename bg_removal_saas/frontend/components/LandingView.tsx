'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRef, lazy, Suspense } from 'react';
import { ArrowDown, Shield, Zap, Eye, Brain, CloudLightning, Sliders, ArrowUpRight } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { ImageComparisonSlider } from '@/components/ui/image-comparison-slider';
import { CinematicIntro } from '@/components/ui/intro-sequence';

// Lazy load 3D to keep initial page load fast
const Interactive3DShinobu = lazy(() => import('@/components/ui/interactive-3d-shinobu').then(m => ({ default: m.Interactive3DShinobu })));

/* ─── Cinematic Label ─── */
function SectionLabel({ num, label }: { num: string; label: string }) {
  return (
    <div className="flex items-center gap-4 mb-10">
      <span className="text-xs font-semibold tracking-[0.25em] uppercase text-ink/70 tabular-nums">{num}</span>
      <div className="w-10 h-px bg-ink/20" />
      <span className="text-xs font-semibold tracking-[0.25em] uppercase text-ink/70">{label}</span>
    </div>
  );
}

/* ─── Animated Line Reveal ─── */
function LineReveal({ children, delay = 0 }: { children: string; delay?: number }) {
  return (
    <span className="block overflow-hidden pb-2">
      <motion.span
        className="block"
        initial={{ y: '130%', rotate: 3 }}
        whileInView={{ y: 0, rotate: 0 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1], delay }}
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
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.92]);

  return (
    <CinematicIntro>
      <div className="w-full bg-cream selection:bg-ink selection:text-cream">
        
        {/* ═══════════════════════════════════════
            HERO — Bold, High Contrast, 3D
        ═══════════════════════════════════════ */}
        <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 pt-20">
          <motion.div
            style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
            className="relative z-10 w-full max-w-[1200px] mx-auto text-center flex flex-col items-center"
          >
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 2.5 }}
              className="mb-8">
              <span className="px-4 py-1.5 rounded-full border border-ink/20 text-[10px] font-bold tracking-[0.3em] uppercase text-ink/80 bg-ink/5">
                Next-Gen AI Platform
              </span>
            </motion.div>

            <h1 className="text-[clamp(3.5rem,10vw,9rem)] font-serif font-bold leading-[0.9] tracking-[-0.04em] mb-12 text-ink">
              <LineReveal delay={1.8}>Remove any</LineReveal>
              <span className="block overflow-hidden relative">
                <motion.span
                  className="block italic text-ink"
                  initial={{ y: '130%', rotate: 3 }}
                  animate={{ y: 0, rotate: 0 }}
                  transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1], delay: 1.95 }}
                >
                  background
                </motion.span>
                {/* Visual accent behind italic text */}
                <motion.div 
                  initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 2.1, duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
                  className="absolute bottom-2 left-0 w-full h-[0.1em] bg-ink/10 -z-10 origin-left rounded-full" 
                />
              </span>
              <LineReveal delay={2.1}>instantly.</LineReveal>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 2.4 }}
              className="text-lg md:text-xl text-ink/80 max-w-2xl mx-auto leading-relaxed mb-16 font-medium"
            >
              Powered by a custom neural network. Pixel-perfect edges.
              Zero learning curve. Just upload and go.
            </motion.p>

            {/* CTA + 3D Mascot Cluster */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex flex-col md:flex-row items-center justify-center gap-6"
            >
              <div className="relative group/cta">
                {/* The 3D Model sitting on top of the button */}
                <div className="absolute -top-[160px] left-1/2 -translate-x-1/2 w-[240px] h-[240px] pointer-events-auto z-20 transition-transform duration-500 group-hover/cta:-translate-y-2">
                  <Suspense fallback={null}>
                    <Interactive3DShinobu className="w-full h-full" />
                  </Suspense>
                </div>
                
                {/* The Button */}
                <Link href="/register"
                  className="relative z-10 px-10 py-5 rounded-full bg-ink text-cream font-bold text-base shadow-2xl shadow-ink/20 hover:shadow-ink/40 hover:bg-[#2b1b3d] transition-all duration-500 overflow-hidden group flex items-center justify-center">
                  <span className="relative z-10">Get Started Free</span>
                  <div className="absolute inset-0 h-full w-full bg-cream/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left ease-[0.76,0,0.24,1]" />
                </Link>
              </div>

              <Link href="/login"
                className="px-8 py-5 rounded-full text-ink font-bold text-base hover:bg-ink/5 transition-all duration-500 flex items-center gap-2 group border border-transparent hover:border-ink/10">
                Sign In
                <ArrowUpRight className="w-4 h-4 text-ink/50 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-ink transition-all duration-300" />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.2 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10"
          >
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
              <ArrowDown className="w-5 h-5 text-ink/40" />
            </motion.div>
          </motion.div>
        </section>

        {/* ═══════════ MARQUEE ═══════════ */}
        <section className="py-8 border-y-2 border-ink/[0.08] overflow-hidden bg-ink/5">
          <div className="marquee-track">
            {[...Array(2)].map((_, setIdx) => (
              <div key={setIdx} className="flex items-center gap-20 px-10">
                {['AWARD WINNING AI', 'PIXEL PERFECT', 'ZERO STORAGE', 'ONE CLICK', 'FULL RESOLUTION', 'SECURE', 'INT8 QUANTIZED', 'SUB-SECOND'].map((text) => (
                  <span key={`${setIdx}-${text}`} className="text-sm font-bold tracking-[0.25em] text-ink/80 whitespace-nowrap">{text}</span>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════ S1 — COMPARE ═══════════ */}
        <section className="py-32 md:py-48 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div>
                <ScrollReveal variant="fade-right"><SectionLabel num="01" label="The Quality" /></ScrollReveal>
                <ScrollReveal variant="fade-up" delay={0.1}>
                  <h2 className="text-4xl md:text-[4rem] font-serif font-bold leading-[1.05] tracking-tight mb-8 text-ink">
                    One image in,<br /><em className="text-ink">perfect cutout</em> out.
                  </h2>
                </ScrollReveal>
                <ScrollReveal variant="fade-up" delay={0.2}>
                  <p className="text-xl text-ink/80 leading-relaxed mb-10 max-w-lg font-medium">
                    Hair strands. Transparent glass. Complex edges. Our U-Net handles what was impossible before — in under a second.
                  </p>
                </ScrollReveal>
                <ScrollReveal variant="fade-up" delay={0.3}>
                  <Link href="/register"
                    className="inline-flex items-center gap-3 text-base font-bold text-ink group border-b-2 border-ink/20 pb-2 hover:border-ink transition-all duration-500">
                    Try it yourself
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </Link>
                </ScrollReveal>
              </div>

              <ScrollReveal variant="scale" delay={0.2} duration={1}>
                <div className="rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-ink/[0.08] relative group/slider">
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
        <section className="py-32 md:py-48 px-6 bg-ink/[0.03]">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal variant="fade-up"><SectionLabel num="02" label="The Process" /></ScrollReveal>
            <ScrollReveal variant="fade-up" delay={0.1}>
              <h2 className="text-4xl md:text-[4.5rem] font-serif font-bold leading-[1.05] tracking-tight mb-24 text-ink">
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
                  <div className="flex flex-col md:flex-row gap-6 md:gap-16 py-16 border-b border-ink/10 last:border-0 group cursor-default transition-colors duration-500 hover:bg-ink/5 md:px-8 rounded-3xl">
                    <div className="text-5xl md:text-6xl font-serif font-bold text-ink/20 shrink-0 tabular-nums transition-colors duration-500 group-hover:text-ink">{step.num}</div>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-serif font-bold mb-4 text-ink transition-transform duration-500 origin-left group-hover:scale-105">{step.title}</h3>
                      <p className="text-lg text-ink/80 leading-relaxed max-w-xl font-medium">{step.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ S3 — FEATURES ═══════════ */}
        <section className="py-32 md:py-48 px-6">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal variant="fade-up"><SectionLabel num="03" label="The details" /></ScrollReveal>
            <ScrollReveal variant="fade-up" delay={0.1}>
              <h2 className="text-4xl md:text-[4.5rem] font-serif font-bold leading-[1.05] tracking-tight mb-24 text-ink">
                Every pixel,<br /><em className="text-ink">every detail</em>.
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: <Brain />, title: "Custom Architecture", desc: "MobileNetV3 U-Net with CBAM trained on millions of images." },
                { icon: <Zap />, title: "Sub-Second Speed", desc: "INT8 quantized inference. Ready before you finish blinking." },
                { icon: <Shield />, title: "Zero Storage", desc: "HMAC-SHA256 signed requests. Processed in RAM, never saved." },
                { icon: <Sliders />, title: "Full Resolution", desc: "No downscaling, no compression. Pixel-for-pixel accuracy." },
                { icon: <CloudLightning />, title: "Multiple Exports", desc: "Transparent, white, or black background. One click each." },
                { icon: <Eye />, title: "Live Comparison", desc: "Interactive slider shows exact quality before downloading." },
              ].map((feature, i) => (
                <ScrollReveal key={feature.title} variant="fade-up" delay={i * 0.08}>
                  <div className="p-10 h-full border border-ink/10 rounded-[2rem] bg-ink/[0.02] hover:bg-ink/[0.04] transition-all duration-500 group cursor-default hover:shadow-2xl hover:shadow-ink/5 hover:-translate-y-2">
                    <div className="w-14 h-14 rounded-full bg-ink/5 flex items-center justify-center text-ink mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:bg-ink group-hover:text-cream">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-ink mb-3 transition-transform duration-500 group-hover:translate-x-2">{feature.title}</h3>
                    <p className="text-base text-ink/80 leading-relaxed font-medium transition-transform duration-500 group-hover:translate-x-2">{feature.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ S4 — CTA ═══════════ */}
        <section className="py-32 md:py-48 px-6 bg-ink text-cream relative overflow-hidden">
          {/* Subtle background element */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cream/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <ScrollReveal variant="scale" duration={1.2}>
              <div className="inline-block px-4 py-1.5 rounded-full border border-cream/20 text-[10px] font-bold tracking-[0.3em] uppercase text-cream/70 bg-cream/5 mb-10">
                Get started today
              </div>
              <h2 className="text-4xl md:text-[5rem] font-serif font-bold leading-[1.05] tracking-tight mb-8">
                Ready to remove<br /><em className="text-cream/80">backgrounds?</em>
              </h2>
              <p className="text-xl text-cream/60 mb-14 max-w-md mx-auto font-medium">
                50 free credits. No credit card. No watermarks.
              </p>
              <Link href="/register"
                className="inline-flex items-center justify-center px-12 py-6 rounded-full bg-cream text-ink font-bold text-lg shadow-2xl hover:scale-105 transition-all duration-500">
                Start creating for free
              </Link>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════ FOOTER ═══════════ */}
        <footer className="border-t-2 border-ink/10 py-12 px-10">
          <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <span className="text-lg font-serif font-bold text-ink">VCranks <em className="text-ink/50">AI</em></span>
            <p className="text-sm font-medium text-ink/50">© 2026 VCranks AI. All rights reserved.</p>
            <div className="flex gap-10">
              <Link href="/about" className="text-sm font-bold text-ink/70 hover:text-ink transition-colors duration-300">About</Link>
              <Link href="/login" className="text-sm font-bold text-ink/70 hover:text-ink transition-colors duration-300">Sign In</Link>
            </div>
          </div>
        </footer>
      </div>
    </CinematicIntro>
  );
}
