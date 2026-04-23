'use client';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRef, MouseEvent } from 'react';
import { Zap, Target, Lock, Cpu, ArrowLeft, Users, Image, Clock, Server } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { LiquidButton } from '@/components/ui/liquid-glass-button';

/* ─── Parallax Tilt Card ─── */
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
    const mouseY = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(mouseX);
    y.set(mouseY);

    // Set CSS custom properties for radial glow
    ref.current.style.setProperty('--mouse-x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
    ref.current.style.setProperty('--mouse-y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className={`tilt-card ${className || ''}`}
    >
      <div style={{ transform: 'translateZ(20px)' }}>
        {children}
      </div>
    </motion.div>
  );
}

/* ─── Animated Counter ─── */
function AnimatedStat({ value, label, suffix = '' }: { value: string; label: string; suffix?: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-black gradient-text font-display mb-1">{value}{suffix}</div>
      <div className="text-xs text-white/30 font-tech uppercase tracking-wider">{label}</div>
    </div>
  );
}

export function AboutView() {
  return (
    <div className="w-full min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#030014] via-[#050518] to-[#030014] pointer-events-none -z-10" />
      <div className="fixed top-[20%] left-[30%] w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[150px] pointer-events-none -z-10 animate-orb-1" />
      <div className="fixed bottom-[20%] right-[20%] w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-orb-2" />

      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        {/* Back link */}
        <ScrollReveal variant="fade-right">
          <Link href="/" className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 text-sm transition-colors mb-16 font-tech">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
        </ScrollReveal>

        {/* Header */}
        <ScrollReveal variant="fade-up" className="mb-20">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 font-display">
            About <span className="gradient-text">VCranks AI</span>
          </h1>
          <p className="text-lg text-white/35 leading-relaxed max-w-2xl">
            VCranks AI is a professional-grade background removal platform built from the ground up.
            No third-party APIs, no shortcuts — just a custom-trained neural network delivering
            pixel-perfect results at machine speed.
          </p>
        </ScrollReveal>

        {/* Stats */}
        <ScrollReveal variant="scale" className="mb-20">
          <div className="glass-card p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <AnimatedStat value="10K" suffix="+" label="Images Processed" />
              <AnimatedStat value="99.9" suffix="%" label="Uptime" />
              <AnimatedStat value="<1" suffix="s" label="Processing Time" />
              <AnimatedStat value="0" label="Images Stored" />
            </div>
          </div>
        </ScrollReveal>

        {/* Mission */}
        <ScrollReveal variant="fade-up" className="mb-20">
          <h2 className="text-2xl font-bold mb-6 font-display">Our mission</h2>
          <p className="text-white/35 leading-relaxed text-base">
            We believe professional image editing shouldn&apos;t require expensive software or years of experience.
            VCranks AI makes background removal accessible to everyone — designers, marketers, e-commerce sellers,
            and anyone who needs clean, professional cutouts without the complexity.
          </p>
        </ScrollReveal>

        {/* Tech Stack — Parallax Tilt Cards */}
        <ScrollReveal variant="fade-up" className="mb-20">
          <h2 className="text-2xl font-bold mb-10 font-display">The technology</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { icon: <Cpu className="w-5 h-5" />, title: "Custom Neural Network", desc: "Built on MobileNetV3-Small U-Net architecture with CBAM attention modules. Trained on millions of images for edge-case handling.", color: "violet" },
              { icon: <Zap className="w-5 h-5" />, title: "INT8 Quantization", desc: "Model quantized to INT8 precision for 4x faster inference without quality loss. Optimized for both GPU and CPU deployment.", color: "cyan" },
              { icon: <Lock className="w-5 h-5" />, title: "HMAC-SHA256 Security", desc: "Every API request is cryptographically signed. Your images are processed in-memory and never persisted to disk.", color: "emerald" },
              { icon: <Target className="w-5 h-5" />, title: "Edge Deployment", desc: "Inference runs on dedicated infrastructure served through edge networks for sub-second response times globally.", color: "rose" },
            ].map((item, i) => (
              <ScrollReveal key={item.title} variant="fade-up" delay={i * 0.1}>
                <TiltCard className="p-7 h-full">
                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4 text-white/50 transition-colors group-hover:text-white/80">
                      {item.icon}
                    </div>
                    <h3 className="font-semibold mb-2 font-display">{item.title}</h3>
                    <p className="text-sm text-white/30 leading-relaxed">{item.desc}</p>
                  </div>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </ScrollReveal>

        {/* Timeline */}
        <ScrollReveal variant="fade-up" className="mb-20">
          <h2 className="text-2xl font-bold mb-10 font-display">Our journey</h2>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 md:left-6 top-0 bottom-0 w-px bg-gradient-to-b from-violet-500/30 via-cyan-500/20 to-transparent" />
            
            <div className="space-y-10">
              {[
                { date: "Phase 1", title: "Research & Architecture", desc: "Designed the MobileNetV3-Small U-Net architecture with CBAM attention modules for optimal edge detection." },
                { date: "Phase 2", title: "Training Pipeline", desc: "Built a production-grade training pipeline on P3M-10K dataset using progressive resolution training." },
                { date: "Phase 3", title: "Quantization & Optimization", desc: "Quantized the model to INT8 ONNX format achieving 4x inference speedup while maintaining IoU > 0.95." },
                { date: "Phase 4", title: "Production Launch", desc: "Deployed to dedicated GPU infrastructure with HMAC-SHA256 secured APIs and real-time processing." },
              ].map((item, i) => (
                <ScrollReveal key={item.date} variant="fade-left" delay={i * 0.1}>
                  <div className="flex gap-6 ml-1">
                    <div className="relative">
                      <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center shrink-0">
                        <div className="w-2 h-2 rounded-full bg-violet-400" />
                      </div>
                    </div>
                    <div className="pb-2">
                      <div className="text-xs text-violet-400 font-tech uppercase tracking-wider mb-1">{item.date}</div>
                      <h3 className="font-semibold mb-2 font-display">{item.title}</h3>
                      <p className="text-sm text-white/30 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal variant="scale" className="text-center py-16">
          <h2 className="text-3xl font-bold mb-4 font-display">Ready to try it?</h2>
          <p className="text-white/30 mb-8 font-tech">50 free credits. No credit card required.</p>
          <Link href="/register">
            <LiquidButton size="xl" className="text-white font-semibold">
              Get Started Free
            </LiquidButton>
          </Link>
        </ScrollReveal>
      </div>
    </div>
  );
}
