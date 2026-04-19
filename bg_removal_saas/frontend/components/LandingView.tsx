'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, Zap, Shield, ScanEye, Layers, ArrowRight, Check, Star } from 'lucide-react';

const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } };
const stagger = { animate: { transition: { staggerChildren: 0.08 } } };

export function LandingView() {
  return (
    <div className="w-full">

      {/* ─── HERO ─── */}
      <section id="hero" className="relative min-h-[94vh] flex flex-col items-center justify-center px-6 py-32 text-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-600/8 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-[15%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-violet-500/8 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[20%] w-[300px] h-[300px] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />

        <motion.div variants={stagger} initial="initial" whileInView="animate" viewport={{ once: true }} className="max-w-3xl flex flex-col items-center gap-6 relative z-10">
          
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/15 bg-violet-500/5 text-violet-400 text-xs font-medium">
            <Sparkles className="w-3 h-3" /> Now in public beta
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-[clamp(2.5rem,7vw,5rem)] font-bold tracking-[-0.035em] leading-[1.05]">
            <span className="text-foreground">Background removal</span><br />
            <span className="text-gradient">at machine speed</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
            Custom MobileNetV3 U-Net, INT8 quantized. Upload an image, get a clean cutout in under a second. No subscriptions, no watermarks.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-3 mt-4">
            <Link href="/register" className="group flex items-center gap-2 px-7 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/15">
              Start free <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/#features" className="px-7 py-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-border/80 transition-all">
              Learn more
            </Link>
          </motion.div>

          {/* Stats strip */}
          <motion.div variants={fadeUp} className="flex items-center gap-8 mt-12 text-sm">
            {[
              { val: "< 1s", label: "Avg latency" },
              { val: "100%", label: "Max resolution" },
              { val: "Free", label: "50 credits" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-lg font-bold text-foreground">{s.val}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-28">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <p className="text-xs font-semibold text-violet-400 uppercase tracking-[0.15em] mb-3">Capabilities</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Built different</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Not a wrapper around a third-party API. PixelForge runs a custom-trained neural network, quantized and served at the edge.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <Zap className="w-5 h-5" />, title: "Sub-second", desc: "INT8 quantized inference. Results before you blink.", color: "text-amber-400" },
            { icon: <ScanEye className="w-5 h-5" />, title: "Full fidelity", desc: "No downscaling. Input resolution = output resolution.", color: "text-blue-400" },
            { icon: <Shield className="w-5 h-5" />, title: "Secure pipeline", desc: "HMAC-SHA256 signed requests. Images never stored.", color: "text-emerald-400" },
            { icon: <Layers className="w-5 h-5" />, title: "Export options", desc: "Transparent PNG, white BG, black BG. One click each.", color: "text-violet-400" },
          ].map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="group p-6 rounded-2xl border border-border/50 bg-card/50 hover:bg-card hover:border-border transition-all duration-300">
              <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-4 ${f.color}`}>{f.icon}</div>
              <h3 className="font-semibold text-sm mb-1.5">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="about" className="max-w-4xl mx-auto px-6 py-28 border-t border-border/30">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <p className="text-xs font-semibold text-violet-400 uppercase tracking-[0.15em] mb-3">Workflow</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Three steps. That&apos;s it.</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "01", title: "Upload", desc: "Drag and drop or click to select. JPG, PNG, WEBP up to 20MB." },
            { step: "02", title: "Generate", desc: "Our AI processes your image in real-time. One button, instant result." },
            { step: "03", title: "Download", desc: "Compare before/after with the slider. Export as PNG or JPEG." },
          ].map((s, i) => (
            <motion.div key={s.step} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
              <div className="text-4xl font-black text-gradient mb-4">{s.step}</div>
              <h3 className="font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="max-w-4xl mx-auto px-6 py-28 border-t border-border/30">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <p className="text-xs font-semibold text-violet-400 uppercase tracking-[0.15em] mb-3">Pricing</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Start free, scale later</h2>
          <p className="text-muted-foreground max-w-md mx-auto">No credit card required. 50 free credits to start.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free */}
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="p-7 rounded-2xl border border-border/50 bg-card/50 flex flex-col">
            <p className="text-sm font-medium text-muted-foreground mb-1">Starter</p>
            <div className="text-3xl font-bold mb-1">Free</div>
            <p className="text-xs text-muted-foreground mb-6">50 credits included</p>
            <ul className="space-y-3 mb-8 flex-1">
              {["50 credits (5 per image)", "Full resolution export", "PNG + JPEG + White/Black BG", "Before/After comparison"].map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-xs text-muted-foreground"><Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />{f}</li>
              ))}
            </ul>
            <Link href="/register" className="w-full py-2.5 rounded-lg border border-border text-center text-sm font-medium hover:bg-accent transition-colors">Get started</Link>
          </motion.div>

          {/* Pro */}
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
            className="p-7 rounded-2xl border border-violet-500/20 bg-violet-500/[0.03] flex flex-col relative overflow-hidden">
            <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-violet-500/15 text-violet-400 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1">
              <Star className="w-3 h-3" /> Pro
            </div>
            <p className="text-sm font-medium text-violet-400 mb-1">Professional</p>
            <div className="text-3xl font-bold mb-1">Unlimited</div>
            <p className="text-xs text-muted-foreground mb-6">For power users</p>
            <ul className="space-y-3 mb-8 flex-1">
              {["Unlimited generations", "Priority inference queue", "Batch processing", "API access"].map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-xs text-muted-foreground"><Check className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" />{f}</li>
              ))}
            </ul>
            <Link href="/register" className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-center text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">Upgrade</Link>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border/30 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold">PixelForge</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 PixelForge AI. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/#features" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="/#pricing" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/#about" className="text-xs text-muted-foreground hover:text-foreground transition-colors">About</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
