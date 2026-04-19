'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRef, useEffect, useState } from 'react';
import { ArrowDown, Zap, Shield, Eye, Sliders, CloudLightning, Brain } from 'lucide-react';

export function LandingView() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  return (
    <div className="w-full">

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        
        {/* Aurora / Rainbow beam background */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Base dark radial */}
          <div className="absolute inset-0 bg-gradient-to-b from-black via-[#030014] to-black" />
          
          {/* Aurora beam 1 - rainbow sweep */}
          <motion.div
            className="absolute w-[1200px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute inset-0 bg-gradient-conic from-transparent via-violet-500/20 via-30% via-blue-500/15 via-50% via-emerald-500/10 via-70% via-pink-500/15 to-transparent rounded-full blur-[80px]" 
              style={{ background: 'conic-gradient(from 0deg, transparent 0%, rgba(139,92,246,0.15) 15%, rgba(59,130,246,0.12) 30%, rgba(16,185,129,0.08) 45%, rgba(236,72,153,0.12) 60%, rgba(249,115,22,0.08) 75%, transparent 100%)' }}
            />
          </motion.div>

          {/* Aurora beam 2 - counter-rotate */}
          <motion.div
            className="absolute w-[800px] h-[800px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            animate={{ rotate: [360, 0] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute inset-0 rounded-full blur-[120px]"
              style={{ background: 'conic-gradient(from 180deg, transparent 0%, rgba(167,139,250,0.1) 20%, rgba(96,165,250,0.08) 40%, transparent 60%, rgba(251,146,60,0.06) 80%, transparent 100%)' }}
            />
          </motion.div>

          {/* Curved rainbow light streak - key visual element */}
          <div className="absolute bottom-[15%] left-0 right-0 h-[300px] overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2 }}
              className="absolute inset-0"
            >
              <div className="absolute bottom-0 left-[-10%] w-[120%] h-[250px] rounded-t-[50%] opacity-60"
                style={{
                  background: 'linear-gradient(90deg, rgba(236,72,153,0.4) 0%, rgba(239,68,68,0.35) 15%, rgba(249,115,22,0.35) 30%, rgba(234,179,8,0.3) 40%, rgba(34,197,94,0.3) 55%, rgba(59,130,246,0.35) 70%, rgba(139,92,246,0.4) 85%, rgba(236,72,153,0.3) 100%)',
                  filter: 'blur(15px)'
                }}
              />
              <div className="absolute bottom-[-20px] left-[-10%] w-[120%] h-[150px] rounded-t-[50%] opacity-30"
                style={{
                  background: 'linear-gradient(90deg, rgba(236,72,153,0.5) 0%, rgba(249,115,22,0.4) 25%, rgba(34,197,94,0.4) 50%, rgba(59,130,246,0.5) 75%, rgba(139,92,246,0.5) 100%)',
                  filter: 'blur(40px)'
                }}
              />
            </motion.div>
          </div>

          {/* Glow spots */}
          <div className="absolute top-[20%] left-[15%] w-64 h-64 bg-violet-600/10 rounded-full blur-[100px]" />
          <div className="absolute top-[30%] right-[20%] w-48 h-48 bg-blue-600/8 rounded-full blur-[80px]" />
        </div>

        {/* Hero content */}
        <motion.div style={{ y: heroY, opacity: heroOpacity, scale: heroScale }} className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-[clamp(3rem,10vw,7rem)] font-black tracking-[-0.05em] leading-[0.9] mb-8"
          >
            <span className="shimmer-text">VCRANKS</span>
            <br />
            <span className="shimmer-text" style={{ animationDelay: '0.5s' }}>AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-base md:text-lg text-white/40 max-w-xl mx-auto leading-relaxed mb-4"
          >
            Remove backgrounds from any image with AI.
            <br />Simple tools, professional results, no learning curve.
          </motion.p>

          {/* Online status */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-2 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
            <span className="text-emerald-400 text-sm font-medium">Online</span>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/register"
              className="px-8 py-3.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all shadow-2xl shadow-white/10 hover:shadow-white/20 hover:scale-[1.02] active:scale-[0.98]">
              Get Started Free
            </Link>
            <Link href="/login"
              className="px-8 py-3.5 rounded-full border border-white/15 text-white/70 text-sm font-medium hover:text-white hover:border-white/25 hover:bg-white/[0.03] transition-all">
              Sign In
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10"
        >
          <span className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-medium">Scroll to explore</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <ArrowDown className="w-4 h-4 text-white/20" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════ FEATURES ═══════════════════ */}
      <section id="features" className="relative py-32 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#050518] to-black pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Everything you need to
              <br />
              <span className="gradient-text">remove backgrounds</span>
            </h2>
            <p className="text-white/35 text-base md:text-lg max-w-xl mx-auto">
              Powered by a custom-trained MobileNetV3 U-Net, quantized to INT8 precision for blazing fast inference.
            </p>
          </motion.div>

          {/* Feature cards with glowing borders */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: <Brain className="w-5 h-5" />, title: "AI-Powered Extraction", desc: "Our neural network handles hair, fur, transparent objects, and complex edges with surgical precision." },
              { icon: <Zap className="w-5 h-5" />, title: "Lightning Fast", desc: "Images process in under a second. INT8 quantized inference on dedicated GPU infrastructure running 24/7." },
              { icon: <Shield className="w-5 h-5" />, title: "Private by Default", desc: "Your images are never stored or used for training. HMAC-SHA256 signed requests ensure zero data leaks." },
              { icon: <Sliders className="w-5 h-5" />, title: "Full Resolution", desc: "No downscaling. Your image keeps every pixel. What you upload is what you get back — minus the background." },
              { icon: <CloudLightning className="w-5 h-5" />, title: "One-Click Export", desc: "Download as transparent PNG, or with a white or black background. No watermarks, ever." },
              { icon: <Eye className="w-5 h-5" />, title: "Before/After Preview", desc: "Interactive comparison slider lets you see the exact extraction quality before you download." },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <div className="glow-card p-7 h-full group hover:translate-y-[-2px] transition-transform duration-500">
                  <div className="relative z-10">
                    <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-5 text-white/60 group-hover:text-white group-hover:border-white/10 transition-all">
                      {feature.icon}
                    </div>
                    <h3 className="text-[15px] font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-white/35 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#03001a] to-black pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}
            className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">How it works</h2>
            <p className="text-white/35 text-base max-w-lg mx-auto">Three steps. No design skills needed.</p>
          </motion.div>

          <div className="space-y-16">
            {[
              { num: "01", title: "Upload your image", desc: "Drag and drop or click to select. We support JPG, PNG, and WEBP files up to 20MB. Your image stays in your browser until you hit generate." },
              { num: "02", title: "AI removes the background", desc: "Our custom MobileNetV3 U-Net processes your image in real-time. The neural network identifies the foreground with pixel-perfect accuracy." },
              { num: "03", title: "Download your result", desc: "Compare before and after with the interactive slider. Export as transparent PNG, or with a solid white or black background in one click." },
            ].map((step, i) => (
              <motion.div key={step.num} initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7 }}
                className="flex flex-col md:flex-row items-start gap-8">
                <div className="text-6xl font-black gradient-text shrink-0 w-24">{step.num}</div>
                <div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-white/35 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ PRICING ═══════════════════ */}
      <section id="pricing" className="relative py-32 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#080020] to-black pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Simple pricing</h2>
            <p className="text-white/35 text-base max-w-md mx-auto">Start free with 50 credits. No credit card required.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="glow-card p-10 text-center">
            <div className="relative z-10">
              <div className="text-5xl font-black mb-2">Free</div>
              <div className="text-white/30 text-sm mb-8">50 credits • 5 per image • 10 free removals</div>
              <div className="grid grid-cols-2 gap-4 text-sm text-white/50 mb-10 max-w-md mx-auto">
                {["Full resolution output", "Transparent PNG export", "White & black backgrounds", "Before/After slider", "No watermarks", "Privacy guaranteed"].map((f) => (
                  <div key={f} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-violet-400" />{f}</div>
                ))}
              </div>
              <Link href="/register"
                className="inline-block px-10 py-3.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all shadow-2xl shadow-white/10">
                Get Started Free
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ CTA ═══════════════════ */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0 bg-gradient-to-t from-[#030014] to-black pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Ready to remove
              <br />
              <span className="gradient-text">backgrounds?</span>
            </h2>
            <p className="text-white/35 mb-10 max-w-md mx-auto">Join thousands of users already creating professional cutouts with VCranks AI.</p>
            <Link href="/register"
              className="inline-block px-10 py-4 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-500 hover:to-indigo-500 transition-all shadow-2xl shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98]">
              Start for free →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="border-t border-white/[0.04] py-10 px-6 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-white/60">VCranks AI</span>
          </div>
          <p className="text-xs text-white/20">© 2026 VCranks AI. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/about" className="text-xs text-white/20 hover:text-white/50 transition-colors">About</Link>
            <Link href="/#pricing" className="text-xs text-white/20 hover:text-white/50 transition-colors">Pricing</Link>
            <Link href="/login" className="text-xs text-white/20 hover:text-white/50 transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
