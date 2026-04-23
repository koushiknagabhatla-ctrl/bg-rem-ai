'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';
import { ArrowDown, Zap, Shield, Eye, Sliders, CloudLightning, Brain, Check, Sparkles, ArrowRight } from 'lucide-react';
import { InteractiveRobotSpline } from '@/components/ui/interactive-3d-robot';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { LiquidButton } from '@/components/ui/liquid-glass-button';

const ROBOT_SCENE_URL = "https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode";

export function LandingView() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <div className="w-full">

      {/* ═══════════════════════════════════════════════════════
          HERO SECTION — 3D Robot + Overlay Text
      ═══════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative w-full h-screen overflow-hidden">
        
        {/* 3D Robot Background */}
        <div className="absolute inset-0 z-0">
          <InteractiveRobotSpline
            scene={ROBOT_SCENE_URL}
            className="absolute inset-0 w-full h-full"
          />
        </div>

        {/* Gradient overlays for readability */}
        <div className="absolute inset-0 z-[1] pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-[#030014]/70 via-transparent to-[#030014]/90" />
          <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-[#030014] to-transparent" />
        </div>

        {/* Floating orbs */}
        <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
          <div className="absolute top-[15%] left-[10%] w-72 h-72 bg-violet-600/10 rounded-full blur-[120px] animate-orb-1" />
          <div className="absolute top-[40%] right-[15%] w-56 h-56 bg-cyan-500/8 rounded-full blur-[100px] animate-orb-2" />
          <div className="absolute bottom-[25%] left-[40%] w-64 h-64 bg-rose-500/5 rounded-full blur-[100px] animate-orb-1" style={{ animationDelay: '2s' }} />
        </div>

        {/* Hero content overlay */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none"
        >
          <div className="text-center px-6 max-w-5xl mx-auto pointer-events-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass-strong mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
              <span className="text-xs font-medium text-white/60">AI-Powered Background Removal</span>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="text-[clamp(2.5rem,9vw,7rem)] font-black tracking-[-0.04em] leading-[0.85] mb-6 font-display"
            >
              <span className="shimmer-text">VCRANKS</span>
              <br />
              <span className="gradient-text">AI</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-sm md:text-base text-white/40 max-w-lg mx-auto leading-relaxed mb-8 font-tech"
            >
              Remove backgrounds from any image with our custom neural network.
              <br className="hidden md:block" />
              Pixel-perfect results. Zero learning curve.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/register">
                <LiquidButton size="xl" className="text-white font-semibold">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get Started Free
                </LiquidButton>
              </Link>
              <Link href="/login"
                className="px-8 py-3.5 rounded-full border border-white/10 text-white/60 text-sm font-medium hover:text-white hover:border-white/20 hover:bg-white/[0.03] transition-all flex items-center gap-2">
                Sign In <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10"
        >
          <span className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-medium font-tech">Scroll to explore</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <ArrowDown className="w-4 h-4 text-white/20" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURES SECTION
      ═══════════════════════════════════════════════════════ */}
      <section id="features" className="relative py-32 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-[#030014] via-[#050518] to-[#030014] pointer-events-none" />
        {/* Decorative line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
        
        {/* Floating orbs */}
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[150px] pointer-events-none animate-orb-2" />
        <div className="absolute bottom-[10%] left-[5%] w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none animate-orb-1" />

        <div className="max-w-6xl mx-auto relative z-10">
          <ScrollReveal variant="fade-up" className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 font-display">
              Everything you need to
              <br />
              <span className="gradient-text">remove backgrounds</span>
            </h2>
            <p className="text-white/30 text-sm md:text-base max-w-xl mx-auto font-tech">
              Powered by a custom-trained MobileNetV3 U-Net, quantized to INT8 precision for blazing fast inference.
            </p>
          </ScrollReveal>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: <Brain className="w-5 h-5" />, title: "AI-Powered Extraction", desc: "Our neural network handles hair, fur, transparent objects, and complex edges with surgical precision.", color: "violet" },
              { icon: <Zap className="w-5 h-5" />, title: "Lightning Fast", desc: "Images process in under a second. INT8 quantized inference on dedicated GPU infrastructure running 24/7.", color: "cyan" },
              { icon: <Shield className="w-5 h-5" />, title: "Private by Default", desc: "Your images are never stored or used for training. HMAC-SHA256 signed requests ensure zero data leaks.", color: "emerald" },
              { icon: <Sliders className="w-5 h-5" />, title: "Full Resolution", desc: "No downscaling. Your image keeps every pixel. What you upload is what you get back — minus the background.", color: "rose" },
              { icon: <CloudLightning className="w-5 h-5" />, title: "One-Click Export", desc: "Download as transparent PNG, or with a white or black background. No watermarks, ever.", color: "amber" },
              { icon: <Eye className="w-5 h-5" />, title: "Before/After Preview", desc: "Interactive comparison slider lets you see the exact extraction quality before you download.", color: "blue" },
            ].map((feature, i) => (
              <ScrollReveal key={feature.title} variant="fade-up" delay={i * 0.1}>
                <div className="glass-card p-7 h-full group">
                  <div className="relative z-10">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br from-${feature.color}-500/20 to-${feature.color}-500/5 border border-${feature.color}-500/10 flex items-center justify-center mb-5 text-${feature.color}-400 group-hover:text-${feature.color}-300 transition-all`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-[15px] font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-white/30 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════════════════ */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-[#030014] via-[#03001a] to-[#030014] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <ScrollReveal variant="fade-up" className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 font-display">How it works</h2>
            <p className="text-white/30 text-sm max-w-lg mx-auto font-tech">Three steps. No design skills needed.</p>
          </ScrollReveal>

          <div className="space-y-0">
            {[
              { num: "01", title: "Upload your image", desc: "Drag and drop or click to select. We support JPG, PNG, and WEBP files up to 20MB. Your image stays in your browser until you hit generate." },
              { num: "02", title: "AI removes the background", desc: "Our custom MobileNetV3 U-Net processes your image in real-time. The neural network identifies the foreground with pixel-perfect accuracy." },
              { num: "03", title: "Download your result", desc: "Compare before and after with the interactive slider. Export as transparent PNG, or with a solid white or black background in one click." },
            ].map((step, i) => (
              <ScrollReveal key={step.num} variant={i % 2 === 0 ? 'fade-left' : 'fade-right'} delay={i * 0.15}>
                <div className="flex flex-col md:flex-row items-start gap-8 py-10 border-b border-white/[0.04] last:border-0">
                  <div className="shrink-0">
                    <div className="text-6xl font-black gradient-text font-display w-24">{step.num}</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3 font-display">{step.title}</h3>
                    <p className="text-white/30 leading-relaxed text-sm">{step.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PRICING SECTION
      ═══════════════════════════════════════════════════════ */}
      <section id="pricing" className="relative py-32 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-[#030014] via-[#080020] to-[#030014] pointer-events-none" />
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-3xl mx-auto relative z-10">
          <ScrollReveal variant="fade-up" className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 font-display">Simple pricing</h2>
            <p className="text-white/30 text-sm max-w-md mx-auto font-tech">Start free with 50 credits. No credit card required.</p>
          </ScrollReveal>

          <ScrollReveal variant="scale">
            <div className="glass-card p-10 text-center relative overflow-hidden">
              {/* Shimmer line */}
              <div className="absolute top-0 left-0 right-0 h-[1px] overflow-hidden">
                <div className="w-[200%] h-full bg-gradient-to-r from-transparent via-violet-500/50 to-transparent animate-glass-shimmer" />
              </div>
              
              <div className="relative z-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[11px] font-semibold uppercase tracking-wider mb-6">
                  <Sparkles className="w-3 h-3" /> Free Forever
                </div>
                
                <div className="text-5xl font-black mb-2 font-display">Free</div>
                <div className="text-white/25 text-sm mb-8 font-tech">50 credits • 5 per image • 10 free removals</div>
                
                <div className="grid grid-cols-2 gap-3 text-sm text-white/40 mb-10 max-w-md mx-auto">
                  {["Full resolution output", "Transparent PNG export", "White & black backgrounds", "Before/After slider", "No watermarks", "Privacy guaranteed"].map((f) => (
                    <div key={f} className="flex items-center gap-2.5">
                      <Check className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                      <span className="text-left">{f}</span>
                    </div>
                  ))}
                </div>
                
                <Link href="/register">
                  <LiquidButton size="xl" className="text-white font-semibold">
                    Get Started Free
                  </LiquidButton>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CTA SECTION
      ═══════════════════════════════════════════════════════ */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0 bg-gradient-to-t from-[#030014] to-[#050518] pointer-events-none" />
        <div className="absolute bottom-[30%] right-[20%] w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none animate-orb-1" />
        <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none animate-orb-2" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <ScrollReveal variant="scale">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 font-display">
              Ready to remove
              <br />
              <span className="gradient-text">backgrounds?</span>
            </h2>
            <p className="text-white/30 mb-10 max-w-md mx-auto text-sm font-tech">Join thousands of users already creating professional cutouts with VCranks AI.</p>
            <Link href="/register"
              className="inline-block px-10 py-4 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 text-white text-sm font-semibold hover:from-violet-500 hover:via-purple-500 hover:to-cyan-500 transition-all shadow-2xl shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] animate-gradient-shift"
              style={{ backgroundSize: '200% 200%' }}>
              Start for free →
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════ */}
      <footer className="relative border-t border-white/[0.04] py-12 px-6 bg-[#030014]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[1px] bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-white/50 font-display">VCranks AI</span>
          </div>
          <p className="text-xs text-white/15 font-tech">© 2026 VCranks AI. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/about" className="text-xs text-white/20 hover:text-white/50 transition-colors font-tech">About</Link>
            <Link href="/#pricing" className="text-xs text-white/20 hover:text-white/50 transition-colors font-tech">Pricing</Link>
            <Link href="/login" className="text-xs text-white/20 hover:text-white/50 transition-colors font-tech">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
