'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';
import { ArrowDown, ArrowRight, Zap, Shield, Eye, Sliders, CloudLightning, Brain, Check, Sparkles, Upload, Download, Image } from 'lucide-react';
import { InteractiveRobotSpline } from '@/components/ui/interactive-3d-robot';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { ImageComparisonSlider } from '@/components/ui/image-comparison-slider';

const ROBOT_SCENE_URL = "https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode";

export function LandingView() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div className="w-full bg-white">

      {/* ═══════════ HERO — 3D Robot Behind, Text In Front ═══════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Soft gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 via-white to-white" />

        {/* 3D Robot — behind text (z-0) */}
        <div className="absolute inset-0 z-0 opacity-40">
          <InteractiveRobotSpline scene={ROBOT_SCENE_URL} className="absolute inset-0 w-full h-full" />
        </div>

        {/* Hero text — in front (z-10) */}
        <motion.div style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-xs font-medium text-indigo-600">AI-Powered Background Removal</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-[clamp(2.5rem,8vw,6rem)] font-black tracking-[-0.04em] leading-[0.9] mb-6 text-black">
            VCranks
            <br />
            <span className="gradient-text">AI</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-base md:text-lg text-gray-500 max-w-lg mx-auto leading-relaxed mb-10">
            Remove backgrounds from any image in seconds.
            <br className="hidden md:block" />
            Simple. Fast. Pixel-perfect results.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register"
              className="px-8 py-3.5 rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/10">
              Get Started Free
            </Link>
            <Link href="/login"
              className="px-8 py-3.5 rounded-full border border-gray-200 text-gray-600 text-sm font-medium hover:text-black hover:border-gray-300 transition-all flex items-center gap-2">
              Sign In <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10">
          <span className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-medium">Scroll</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <ArrowDown className="w-4 h-4 text-gray-300" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════ SECTION 1 — What We Do ═══════════ */}
      <section className="py-32 px-6 section-soft">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal variant="fade-up">
            <div className="text-center mb-20">
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-[0.2em] mb-4">What we do</p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-black mb-6">
                Remove any background<br />with one click
              </h2>
              <p className="text-gray-500 text-base max-w-xl mx-auto">
                Our custom-trained neural network handles complex edges — hair, fur, transparent objects — with surgical precision. No manual editing needed.
              </p>
            </div>
          </ScrollReveal>

          {/* Before/After Comparison */}
          <ScrollReveal variant="scale">
            <div className="max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-black/10 border border-gray-100">
              <div className="aspect-[16/9]">
                <ImageComparisonSlider
                  leftImage="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&q=80"
                  rightImage="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&q=80&monochrome=ffffff"
                  altLeft="Original photo with background"
                  altRight="Background removed result"
                />
              </div>
            </div>
            <p className="text-center text-sm text-gray-400 mt-4">Drag the slider to compare before and after</p>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════ SECTION 2 — How It Works (Step by Step) ═══════════ */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal variant="fade-up">
            <div className="text-center mb-20">
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-[0.2em] mb-4">How it works</p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-black">Three simple steps</h2>
            </div>
          </ScrollReveal>

          <div className="space-y-0">
            {[
              { num: "01", icon: <Upload className="w-6 h-6" />, title: "Upload your image", desc: "Drag and drop or click to select. We support JPG, PNG, and WEBP files up to 20MB. Your image stays private in your browser until you hit generate." },
              { num: "02", icon: <Sparkles className="w-6 h-6" />, title: "AI removes the background", desc: "Our custom MobileNetV3 U-Net processes your image in real-time. The neural network identifies the foreground with pixel-perfect accuracy — handles hair, fur, and complex edges." },
              { num: "03", icon: <Download className="w-6 h-6" />, title: "Download your result", desc: "Compare before and after with the interactive slider. Export as transparent PNG, or with a white or black background. No watermarks, ever." },
            ].map((step, i) => (
              <ScrollReveal key={step.num} variant={i % 2 === 0 ? 'fade-left' : 'fade-right'} delay={i * 0.1}>
                <div className="flex flex-col md:flex-row items-start gap-8 py-12 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-5 shrink-0">
                    <div className="text-5xl font-black text-gray-100 w-20 font-tech">{step.num}</div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                      {step.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-black mb-3">{step.title}</h3>
                    <p className="text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 3 — Features ═══════════ */}
      <section className="py-32 px-6 section-muted">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal variant="fade-up">
            <div className="text-center mb-20">
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-[0.2em] mb-4">Features</p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-black mb-6">
                Built for professionals
              </h2>
              <p className="text-gray-500 text-base max-w-xl mx-auto">
                Every detail is engineered for speed, quality, and privacy.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: <Brain className="w-5 h-5" />, title: "AI-Powered Extraction", desc: "Custom neural network trained on millions of images handles even the most complex edges." },
              { icon: <Zap className="w-5 h-5" />, title: "Lightning Fast", desc: "INT8 quantized inference processes images in under a second on dedicated infrastructure." },
              { icon: <Shield className="w-5 h-5" />, title: "Private by Default", desc: "Your images are never stored. HMAC-SHA256 signed requests ensure zero data leaks." },
              { icon: <Sliders className="w-5 h-5" />, title: "Full Resolution", desc: "No downscaling. Your image keeps every pixel — minus the background." },
              { icon: <CloudLightning className="w-5 h-5" />, title: "One-Click Export", desc: "Download as transparent PNG, or with white/black backgrounds. No watermarks." },
              { icon: <Eye className="w-5 h-5" />, title: "Before/After Preview", desc: "Interactive comparison slider lets you inspect quality before downloading." },
            ].map((feature, i) => (
              <ScrollReveal key={feature.title} variant="fade-up" delay={i * 0.08}>
                <div className="liquid-glass-card p-7 h-full">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-5 text-indigo-500">
                    {feature.icon}
                  </div>
                  <h3 className="text-[15px] font-semibold text-black mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 4 — The Technology ═══════════ */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal variant="fade-up">
            <div className="text-center mb-16">
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-[0.2em] mb-4">Technology</p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-black mb-6">
                Powered by cutting-edge AI
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              { value: "10K+", label: "Images Processed" },
              { value: "99.9%", label: "Uptime" },
              { value: "<1s", label: "Processing" },
              { value: "0", label: "Images Stored" },
            ].map((stat, i) => (
              <ScrollReveal key={stat.label} variant="fade-up" delay={i * 0.1}>
                <div className="text-center p-6 rounded-2xl bg-gray-50">
                  <div className="text-2xl md:text-3xl font-bold text-black mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal variant="fade-up">
            <div className="liquid-glass-card p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold text-black mb-3">Custom Neural Network</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">
                    Built on MobileNetV3-Small U-Net architecture with CBAM attention modules. Trained on the P3M-10K dataset with progressive resolution training.
                  </p>
                  <h3 className="text-lg font-bold text-black mb-3">INT8 Quantization</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Model quantized to INT8 ONNX format for 4x faster inference without quality loss. Optimized for CPU and GPU deployment.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black mb-3">Enterprise Security</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">
                    Every API request is cryptographically signed with HMAC-SHA256. Images are processed in-memory and never written to disk.
                  </p>
                  <h3 className="text-lg font-bold text-black mb-3">Edge Infrastructure</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Deployed on dedicated GPU servers with global edge networks for sub-second response times worldwide.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════ SECTION 5 — Pricing ═══════════ */}
      <section id="pricing" className="py-32 px-6 section-accent-soft">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal variant="fade-up">
            <div className="text-center mb-16">
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-[0.2em] mb-4">Pricing</p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-black mb-6">Start free, upgrade later</h2>
              <p className="text-gray-500 max-w-md mx-auto">50 credits to get started. No credit card required.</p>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="scale">
            <div className="liquid-glass-card p-10 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-semibold uppercase tracking-wider mb-6">
                <Sparkles className="w-3 h-3" /> Free Forever
              </div>
              <div className="text-5xl font-black text-black mb-2">$0</div>
              <div className="text-gray-400 text-sm mb-8">50 credits • 5 per image • 10 free removals</div>
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-500 mb-10 max-w-md mx-auto text-left">
                {["Full resolution output", "Transparent PNG export", "White & black backgrounds", "Before/After slider", "No watermarks", "Privacy guaranteed"].map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/register"
                className="inline-block px-10 py-3.5 rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-all shadow-lg shadow-black/10 hover:scale-[1.02] active:scale-[0.98]">
                Get Started Free
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════ SECTION 6 — CTA ═══════════ */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal variant="fade-up">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-black mb-6">
              Ready to remove<br /><span className="gradient-text">backgrounds?</span>
            </h2>
            <p className="text-gray-500 mb-10 max-w-md mx-auto">
              Join thousands of users creating professional cutouts with VCranks AI.
            </p>
            <Link href="/register"
              className="inline-block px-10 py-4 rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-all shadow-lg shadow-black/10 hover:scale-[1.02] active:scale-[0.98]">
              Start for free →
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-gray-100 py-12 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-500">VCranks AI</span>
          </div>
          <p className="text-xs text-gray-400">© 2026 VCranks AI. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/about" className="text-xs text-gray-400 hover:text-black transition-colors">About</Link>
            <Link href="/#pricing" className="text-xs text-gray-400 hover:text-black transition-colors">Pricing</Link>
            <Link href="/login" className="text-xs text-gray-400 hover:text-black transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
