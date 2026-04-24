'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { ArrowDown, Shield, Zap, Eye, Brain, CloudLightning, Sliders } from 'lucide-react';
import { ScrollReveal, TextReveal, HeadingReveal } from '@/components/ui/scroll-reveal';
import { ImageComparisonSlider } from '@/components/ui/image-comparison-slider';

export function LandingView() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const [ctaHovered, setCtaHovered] = useState(false);

  return (
    <div className="w-full">

      {/* ═══════════════════════════════════════
          HERO — Clean text + Shinobu mascot
      ═══════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">

        {/* Hero content */}
        <motion.div style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-5xl mx-auto w-full flex flex-col lg:flex-row items-center justify-between gap-16">
          
          {/* Left — Text */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-6">
              <span className="text-xs font-medium tracking-[0.25em] uppercase text-ink-light">AI Background Removal</span>
            </motion.div>

            <h1 className="text-[clamp(2.5rem,7vw,5.5rem)] font-serif font-semibold leading-[0.95] tracking-[-0.02em] mb-8">
              <motion.span className="block overflow-hidden">
                <motion.span className="block" initial={{ y: '110%' }} animate={{ y: 0 }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}>
                  Remove any
                </motion.span>
              </motion.span>
              <motion.span className="block overflow-hidden">
                <motion.span className="block italic" initial={{ y: '110%' }} animate={{ y: 0 }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.45 }}>
                  background
                </motion.span>
              </motion.span>
              <motion.span className="block overflow-hidden">
                <motion.span className="block" initial={{ y: '110%' }} animate={{ y: 0 }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}>
                  instantly.
                </motion.span>
              </motion.span>
            </h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="text-base text-ink-light max-w-md mx-auto lg:mx-0 leading-relaxed mb-10">
              Custom-trained neural network. Pixel-perfect edges.
              <br />Zero learning curve. Just upload and go.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center lg:items-start gap-4">
              <Link href="/register"
                onMouseEnter={() => setCtaHovered(true)}
                onMouseLeave={() => setCtaHovered(false)}
                className="rolling-btn px-8 py-4 rounded-full bg-ink text-cream-light text-sm font-medium shadow-lg shadow-ink/10 hover:shadow-ink/20 transition-shadow">
                <span className="rolling-text">Get Started Free</span>
                <span className="rolling-text-clone">Get Started Free</span>
              </Link>
              <Link href="/login"
                className="px-8 py-4 rounded-full text-ink-light text-sm font-medium hover:text-ink transition-colors duration-300">
                Sign In →
              </Link>
            </motion.div>
          </div>

          {/* Right — Shinobu mascot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-[220px] h-[280px] lg:w-[280px] lg:h-[360px] flex-shrink-0"
          >
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="mascot-wrapper w-full h-full relative">
              <Image
                src={ctaHovered ? "/mascot/shinobu-happy.png" : "/mascot/shinobu-sad.png"}
                alt="Shinobu mascot"
                fill
                className="object-contain transition-opacity duration-500"
                priority
              />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-ink-muted whitespace-nowrap italic">
              {ctaHovered ? '✨ Yay! Let\'s remove backgrounds!' : 'Hover "Get Started" to cheer me up!'}
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <ArrowDown className="w-4 h-4 text-ink-muted" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════ MARQUEE SECTION ═══════════ */}
      <section className="py-8 border-y border-ink/[0.05] overflow-hidden">
        <div className="marquee-track">
          {[...Array(2)].map((_, setIdx) => (
            <div key={setIdx} className="flex items-center gap-12 px-6">
              {['CUSTOM AI', 'PIXEL PERFECT', 'ZERO STORAGE', 'ONE CLICK', 'FULL RESOLUTION', 'SECURE API', 'INT8 QUANTIZED', 'SUB-SECOND'].map((text) => (
                <span key={`${setIdx}-${text}`} className="text-sm font-medium tracking-[0.2em] text-ink-muted whitespace-nowrap">{text}</span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ WHAT WE DO — Before/After ═══════════ */}
      <section className="py-32 md:py-40 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <ScrollReveal variant="fade-up">
                <p className="text-xs font-medium tracking-[0.25em] uppercase text-ink-muted mb-6">01 — What we do</p>
              </ScrollReveal>
              <ScrollReveal variant="fade-up" delay={0.1}>
                <h2 className="text-3xl md:text-5xl font-serif font-semibold leading-[1.1] tracking-tight mb-6">
                  One image in,<br /><em>perfect cutout</em> out.
                </h2>
              </ScrollReveal>
              <ScrollReveal variant="fade-up" delay={0.2}>
                <p className="text-ink-light leading-relaxed mb-8">
                  Our custom MobileNetV3 U-Net handles the impossible — hair strands, transparent glass, complex edges. 
                  What used to take 30 minutes in Photoshop now takes less than a second.
                </p>
              </ScrollReveal>
              <ScrollReveal variant="fade-up" delay={0.3}>
                <Link href="/register" className="text-sm font-medium text-ink underline underline-offset-4 decoration-ink-muted hover:decoration-ink transition-all duration-300">
                  Try it yourself →
                </Link>
              </ScrollReveal>
            </div>
            
            <ScrollReveal variant="scale" delay={0.2}>
              <div className="rounded-2xl overflow-hidden shadow-2xl shadow-ink/10 border border-ink/[0.04]">
                <div className="aspect-[4/3]">
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

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="py-32 md:py-40 px-6 section-cream">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal variant="fade-up">
            <p className="text-xs font-medium tracking-[0.25em] uppercase text-ink-muted mb-6">02 — How it works</p>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.1}>
            <h2 className="text-3xl md:text-5xl font-serif font-semibold leading-[1.1] tracking-tight mb-20">
              Three steps to a<br /><em>flawless</em> result.
            </h2>
          </ScrollReveal>

          <div className="space-y-0">
            {[
              { num: "01", title: "Upload your image", desc: "Drag and drop, or click to browse. JPG, PNG, WEBP up to 20MB. Your image stays private — processed in-memory, never stored." },
              { num: "02", title: "AI does the magic", desc: "Our neural network runs INT8 quantized inference in real-time. CBAM attention modules isolate the foreground with pixel-level accuracy." },
              { num: "03", title: "Compare & download", desc: "Use the interactive before/after slider to inspect quality. Export as transparent PNG, or with white or black background. No watermarks." },
            ].map((step, i) => (
              <ScrollReveal key={step.num} variant="fade-up" delay={i * 0.15}>
                <div className="flex gap-8 py-12 border-b border-ink/[0.06] last:border-0 group">
                  <div className="text-4xl md:text-5xl font-serif font-semibold text-ink-muted/30 shrink-0 tabular-nums w-16">{step.num}</div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-serif font-semibold mb-3 group-hover:italic transition-all duration-300">{step.title}</h3>
                    <p className="text-ink-light leading-relaxed max-w-lg">{step.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="py-32 md:py-40 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal variant="fade-up">
            <p className="text-xs font-medium tracking-[0.25em] uppercase text-ink-muted mb-6">03 — Built different</p>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.1}>
            <h2 className="text-3xl md:text-5xl font-serif font-semibold leading-[1.1] tracking-tight mb-20">
              Every pixel,<br /><em>every detail</em>.
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: <Brain className="w-5 h-5" />, title: "Custom Neural Network", desc: "MobileNetV3-Small U-Net with CBAM attention trained on millions of images." },
              { icon: <Zap className="w-5 h-5" />, title: "Sub-Second Speed", desc: "INT8 quantized inference. Your result is ready before you finish blinking." },
              { icon: <Shield className="w-5 h-5" />, title: "Zero Data Storage", desc: "HMAC-SHA256 signed requests. Images processed in-memory, never saved." },
              { icon: <Sliders className="w-5 h-5" />, title: "Full Resolution", desc: "No downscaling, no compression. What goes in comes back pixel-for-pixel." },
              { icon: <CloudLightning className="w-5 h-5" />, title: "Multiple Formats", desc: "Transparent PNG, white background, black background. One click each." },
              { icon: <Eye className="w-5 h-5" />, title: "Live Preview", desc: "Interactive before/after slider shows exact quality before downloading." },
            ].map((feature, i) => (
              <ScrollReveal key={feature.title} variant="fade-up" delay={i * 0.08}>
                <div className="liquid-glass-card p-7 h-full group cursor-default">
                  <div className="text-ink-light group-hover:text-ink transition-colors duration-300 mb-5">
                    {feature.icon}
                  </div>
                  <h3 className="text-[15px] font-semibold text-ink mb-2 group-hover:italic transition-all duration-300">{feature.title}</h3>
                  <p className="text-sm text-ink-light leading-relaxed">{feature.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="py-32 md:py-40 px-6 section-cream">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal variant="scale">
            <p className="text-xs font-medium tracking-[0.25em] uppercase text-ink-muted mb-6">Get started</p>
            <h2 className="text-3xl md:text-5xl font-serif font-semibold leading-[1.1] tracking-tight mb-6">
              Ready to remove<br /><em>backgrounds?</em>
            </h2>
            <p className="text-ink-light mb-10 max-w-md mx-auto">
              50 free credits. No credit card. No watermarks.
            </p>
            <Link href="/register"
              className="rolling-btn px-10 py-4 rounded-full bg-ink text-cream-light text-sm font-medium shadow-lg shadow-ink/10">
              <span className="rolling-text">Start for free →</span>
              <span className="rolling-text-clone">Start for free →</span>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-ink/[0.05] py-10 px-6">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-sm font-serif text-ink-light">VCranks <em>AI</em></span>
          <p className="text-xs text-ink-muted">© 2026 VCranks AI. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="/about" className="text-xs text-ink-muted hover:text-ink transition-colors duration-300">About</Link>
            <Link href="/login" className="text-xs text-ink-muted hover:text-ink transition-colors duration-300">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
