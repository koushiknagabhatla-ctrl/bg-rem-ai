'use client';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';
import { ArrowDown, Shield, Zap, Eye, Brain, CloudLightning, Sliders, ArrowUpRight } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { ImageComparisonSlider } from '@/components/ui/image-comparison-slider';

/* ─── Cinematic Section Counter ─── */
function SectionLabel({ num, label }: { num: string; label: string }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <span className="text-xs font-medium tracking-[0.25em] uppercase text-ink/30 tabular-nums">{num}</span>
      <div className="w-8 h-px bg-ink/10" />
      <span className="text-xs font-medium tracking-[0.25em] uppercase text-ink/30">{label}</span>
    </div>
  );
}

/* ─── Animated Line Reveal ─── */
function LineReveal({ children, delay = 0 }: { children: string; delay?: number }) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        className="block"
        initial={{ y: '120%', rotate: 2 }}
        whileInView={{ y: 0, rotate: 0 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1], delay }}
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
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <div className="w-full">

      {/* ═══════════════════════════════════════
          HERO — Cinematic text reveal, no images
      ═══════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
        <motion.div
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 max-w-4xl mx-auto text-center"
        >
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.3 }}
            className="mb-8">
            <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-ink/30">AI Background Removal</span>
          </motion.div>

          <h1 className="text-[clamp(3rem,8vw,7rem)] font-serif font-semibold leading-[0.92] tracking-[-0.03em] mb-10">
            <LineReveal delay={0.2}>Remove any</LineReveal>
            <span className="block overflow-hidden">
              <motion.span
                className="block italic text-ink/40"
                initial={{ y: '120%', rotate: 2 }}
                animate={{ y: 0, rotate: 0 }}
                transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1], delay: 0.35 }}
              >
                background
              </motion.span>
            </span>
            <LineReveal delay={0.5}>instantly.</LineReveal>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
            className="text-base md:text-lg text-ink/40 max-w-md mx-auto leading-relaxed mb-12"
          >
            Powered by a custom neural network. Pixel-perfect edges.
            Zero learning curve. Just upload and go.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/register" data-mascot="excited"
              className="group px-8 py-4 rounded-full bg-ink text-cream-light text-sm font-medium shadow-lg shadow-ink/10 hover:shadow-ink/20 hover:bg-ink/90 transition-all duration-300">
              Get Started Free
            </Link>
            <Link href="/login" data-mascot="excited"
              className="group px-8 py-4 rounded-full text-ink/40 text-sm font-medium hover:text-ink transition-colors duration-300 flex items-center gap-2">
              Sign In
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10"
        >
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
            <ArrowDown className="w-4 h-4 text-ink/20" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════ MARQUEE ═══════════ */}
      <section className="py-6 border-y border-ink/[0.04] overflow-hidden">
        <div className="marquee-track">
          {[...Array(2)].map((_, setIdx) => (
            <div key={setIdx} className="flex items-center gap-16 px-8">
              {['CUSTOM AI', 'PIXEL PERFECT', 'ZERO STORAGE', 'ONE CLICK', 'FULL RESOLUTION', 'SECURE', 'INT8 QUANTIZED', 'SUB-SECOND'].map((text) => (
                <span key={`${setIdx}-${text}`} className="text-[11px] font-medium tracking-[0.25em] text-ink/15 whitespace-nowrap">{text}</span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ S1 — What We Do + Comparison Slider ═══════════ */}
      <section className="py-32 md:py-44 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <ScrollReveal variant="fade-up">
                <SectionLabel num="01" label="What we do" />
              </ScrollReveal>
              <ScrollReveal variant="fade-up" delay={0.1}>
                <h2 className="text-3xl md:text-[3.2rem] font-serif font-semibold leading-[1.05] tracking-tight mb-8">
                  One image in,<br /><em className="text-ink/40">perfect cutout</em> out.
                </h2>
              </ScrollReveal>
              <ScrollReveal variant="fade-up" delay={0.2}>
                <p className="text-ink/40 leading-relaxed mb-8 max-w-md">
                  Hair strands. Transparent glass. Complex edges. Our MobileNetV3 U-Net handles what was impossible before — in under a second.
                </p>
              </ScrollReveal>
              <ScrollReveal variant="fade-up" delay={0.3}>
                <Link href="/register" data-mascot="excited"
                  className="inline-flex items-center gap-2 text-sm font-medium text-ink group">
                  Try it yourself
                  <ArrowUpRight className="w-3.5 h-3.5 text-ink/30 group-hover:text-ink group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                </Link>
              </ScrollReveal>
            </div>

            <ScrollReveal variant="scale" delay={0.2}>
              <div className="rounded-2xl overflow-hidden shadow-2xl shadow-ink/8 border border-ink/[0.04]">
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

      {/* ═══════════ S2 — How It Works ═══════════ */}
      <section className="py-32 md:py-44 px-6 section-cream">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal variant="fade-up">
            <SectionLabel num="02" label="How it works" />
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.1}>
            <h2 className="text-3xl md:text-[3.2rem] font-serif font-semibold leading-[1.05] tracking-tight mb-20">
              Three steps to a<br /><em className="text-ink/40">flawless</em> result.
            </h2>
          </ScrollReveal>

          <div className="space-y-0">
            {[
              { num: "01", title: "Upload your image", desc: "Drag and drop, or click to browse. JPG, PNG, WEBP up to 20MB. Your image stays private — processed in-memory, never stored." },
              { num: "02", title: "AI does the magic", desc: "Our neural network with CBAM attention modules isolates the foreground with pixel-level accuracy. INT8 quantized for speed." },
              { num: "03", title: "Compare & download", desc: "Interactive before/after slider to inspect quality. Export as transparent PNG, white or black background. No watermarks, ever." },
            ].map((step, i) => (
              <ScrollReveal key={step.num} variant="fade-up" delay={i * 0.12}>
                <div className="flex gap-8 md:gap-12 py-12 border-b border-ink/[0.05] last:border-0 group cursor-default">
                  <div className="text-4xl md:text-5xl font-serif font-semibold text-ink/[0.07] shrink-0 tabular-nums w-16 transition-colors duration-500 group-hover:text-ink/20">{step.num}</div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-serif font-semibold mb-3 transition-all duration-500 group-hover:italic group-hover:tracking-tight">{step.title}</h3>
                    <p className="text-ink/40 leading-relaxed max-w-lg">{step.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ S3 — Features ═══════════ */}
      <section className="py-32 md:py-44 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal variant="fade-up">
            <SectionLabel num="03" label="Built different" />
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.1}>
            <h2 className="text-3xl md:text-[3.2rem] font-serif font-semibold leading-[1.05] tracking-tight mb-20">
              Every pixel,<br /><em className="text-ink/40">every detail</em>.
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: <Brain className="w-5 h-5" />, title: "Custom Neural Network", desc: "MobileNetV3-Small U-Net with CBAM attention trained on millions of images." },
              { icon: <Zap className="w-5 h-5" />, title: "Sub-Second Speed", desc: "INT8 quantized inference. Your result is ready before you finish blinking." },
              { icon: <Shield className="w-5 h-5" />, title: "Zero Data Storage", desc: "HMAC-SHA256 signed requests. Images processed in-memory, never saved." },
              { icon: <Sliders className="w-5 h-5" />, title: "Full Resolution", desc: "No downscaling, no compression. What goes in comes out pixel-for-pixel." },
              { icon: <CloudLightning className="w-5 h-5" />, title: "Multiple Exports", desc: "Transparent PNG, white background, black background. One click each." },
              { icon: <Eye className="w-5 h-5" />, title: "Live Comparison", desc: "Interactive before/after slider shows exact quality before you download." },
            ].map((feature, i) => (
              <ScrollReveal key={feature.title} variant="fade-up" delay={i * 0.07}>
                <div className="liquid-glass-card p-7 h-full group cursor-default">
                  <div className="text-ink/25 group-hover:text-ink/60 transition-colors duration-500 mb-5">
                    {feature.icon}
                  </div>
                  <h3 className="text-[15px] font-semibold text-ink mb-2 transition-all duration-500 group-hover:italic">{feature.title}</h3>
                  <p className="text-sm text-ink/40 leading-relaxed">{feature.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ S4 — Technology ═══════════ */}
      <section className="py-32 md:py-44 px-6 section-cream">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal variant="fade-up">
            <SectionLabel num="04" label="Under the hood" />
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.1}>
            <h2 className="text-3xl md:text-[3.2rem] font-serif font-semibold leading-[1.05] tracking-tight mb-16">
              Engineered for<br /><em className="text-ink/40">perfection</em>.
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[
              { value: "10K+", label: "Images" },
              { value: "99.9%", label: "Uptime" },
              { value: "<1s", label: "Speed" },
              { value: "0", label: "Stored" },
            ].map((stat, i) => (
              <ScrollReveal key={stat.label} variant="fade-up" delay={i * 0.1}>
                <div className="text-center p-6 rounded-2xl bg-cream-light/80">
                  <div className="text-2xl md:text-3xl font-serif font-semibold text-ink mb-1">{stat.value}</div>
                  <div className="text-[10px] text-ink/25 uppercase tracking-[0.25em]">{stat.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal variant="fade-up" delay={0.15}>
            <div className="liquid-glass-card p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-10">
                <div>
                  <h3 className="text-lg font-serif font-semibold text-ink mb-3">Custom Architecture</h3>
                  <p className="text-ink/40 text-sm leading-relaxed mb-6">
                    MobileNetV3-Small U-Net with CBAM attention modules. Trained on P3M-10K dataset with progressive resolution training for edge-case mastery.
                  </p>
                  <h3 className="text-lg font-serif font-semibold text-ink mb-3">INT8 Quantization</h3>
                  <p className="text-ink/40 text-sm leading-relaxed">
                    4x faster inference, zero quality loss. ONNX optimized for both CPU and GPU deployment on dedicated infrastructure.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-serif font-semibold text-ink mb-3">Enterprise Security</h3>
                  <p className="text-ink/40 text-sm leading-relaxed mb-6">
                    HMAC-SHA256 cryptographic signatures on every request. Images processed strictly in-memory — never persisted to any disk.
                  </p>
                  <h3 className="text-lg font-serif font-semibold text-ink mb-3">Global Edge</h3>
                  <p className="text-ink/40 text-sm leading-relaxed">
                    Dedicated GPU servers with global CDN edge networks for sub-second response times worldwide.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════ S5 — CTA ═══════════ */}
      <section className="py-32 md:py-44 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal variant="scale" duration={1.2}>
            <p className="text-[10px] font-medium tracking-[0.3em] uppercase text-ink/25 mb-8">Get started</p>
            <h2 className="text-3xl md:text-[3.2rem] font-serif font-semibold leading-[1.05] tracking-tight mb-8">
              Ready to remove<br /><em className="text-ink/40">backgrounds?</em>
            </h2>
            <p className="text-ink/40 mb-12 max-w-sm mx-auto">
              50 free credits. No credit card. No watermarks.
            </p>
            <Link href="/register" data-mascot="excited"
              className="inline-block px-10 py-4 rounded-full bg-ink text-cream-light text-sm font-medium shadow-lg shadow-ink/10 hover:bg-ink/90 transition-all duration-300">
              Start for free →
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-ink/[0.04] py-10 px-6">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-sm font-serif text-ink/40">VCranks <em>AI</em></span>
          <p className="text-xs text-ink/20">© 2026 VCranks AI. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="/about" className="text-xs text-ink/20 hover:text-ink transition-colors duration-300">About</Link>
            <Link href="/login" className="text-xs text-ink/20 hover:text-ink transition-colors duration-300">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
