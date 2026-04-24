'use client';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRef, MouseEvent } from 'react';
import { Cpu, Zap, Lock, Target, ArrowLeft } from 'lucide-react';
import { ScrollReveal, TextReveal, HeadingReveal } from '@/components/ui/scroll-reveal';

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <motion.div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className={`liquid-glass-card ${className || ''}`}>
      <div style={{ transform: 'translateZ(12px)' }}>{children}</div>
    </motion.div>
  );
}

export function AboutView() {
  return (
    <div className="w-full min-h-screen">
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <ScrollReveal variant="fade-right">
          <Link href="/" className="inline-flex items-center gap-2 text-ink-muted hover:text-ink text-sm transition-colors duration-300 mb-16">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
        </ScrollReveal>

        {/* Header */}
        <div className="mb-24">
          <ScrollReveal variant="fade-up">
            <p className="text-xs font-medium tracking-[0.25em] uppercase text-ink-muted mb-6">About us</p>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.1}>
            <h1 className="text-4xl md:text-6xl font-serif font-semibold leading-[1.05] tracking-tight mb-8">
              Building the future<br />of <em>image editing</em>.
            </h1>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.2}>
            <p className="text-lg text-ink-light leading-relaxed max-w-2xl">
              VCranks AI is a professional-grade background removal platform built from the ground up. 
              No third-party APIs. No shortcuts. Just a custom-trained neural network delivering pixel-perfect 
              results at machine speed.
            </p>
          </ScrollReveal>
        </div>

        {/* Stats */}
        <ScrollReveal variant="fade-up" className="mb-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "10K+", label: "Images Processed" },
              { value: "99.9%", label: "Uptime" },
              { value: "<1s", label: "Processing" },
              { value: "0", label: "Images Stored" },
            ].map((stat, i) => (
              <ScrollReveal key={stat.label} variant="fade-up" delay={i * 0.1}>
                <div className="text-center p-6 rounded-2xl section-cream">
                  <div className="text-2xl md:text-3xl font-serif font-bold text-ink mb-1">{stat.value}</div>
                  <div className="text-[10px] text-ink-muted uppercase tracking-[0.2em]">{stat.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </ScrollReveal>

        {/* Mission */}
        <ScrollReveal variant="fade-up" className="mb-24">
          <p className="text-xs font-medium tracking-[0.25em] uppercase text-ink-muted mb-6">Our mission</p>
          <p className="text-ink-light leading-relaxed text-base max-w-2xl">
            We believe professional image editing shouldn&apos;t require expensive software or years of experience.
            VCranks AI makes background removal accessible to everyone — designers, marketers, e-commerce sellers,
            and anyone who needs clean, professional cutouts without the complexity.
          </p>
        </ScrollReveal>

        {/* Technology — Tilt Cards */}
        <div className="mb-24">
          <ScrollReveal variant="fade-up">
            <p className="text-xs font-medium tracking-[0.25em] uppercase text-ink-muted mb-6">The technology</p>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.1}>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold leading-[1.1] mb-12">
              Engineered for<br /><em>perfection</em>.
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: <Cpu className="w-5 h-5" />, title: "Custom Neural Network", desc: "MobileNetV3-Small U-Net with CBAM attention. Trained on P3M-10K with progressive resolution for edge-case handling." },
              { icon: <Zap className="w-5 h-5" />, title: "INT8 Quantization", desc: "4x faster inference without quality loss. Optimized ONNX format for CPU and GPU deployment." },
              { icon: <Lock className="w-5 h-5" />, title: "HMAC-SHA256 Security", desc: "Every request cryptographically signed. Images processed in-memory, never persisted to any disk." },
              { icon: <Target className="w-5 h-5" />, title: "Edge Deployment", desc: "Dedicated GPU infrastructure with edge networks for sub-second response globally." },
            ].map((item, i) => (
              <ScrollReveal key={item.title} variant="fade-up" delay={i * 0.1}>
                <TiltCard className="p-7 h-full group">
                  <div className="text-ink-light group-hover:text-ink transition-colors duration-300 mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-ink mb-2 group-hover:italic transition-all duration-300">{item.title}</h3>
                  <p className="text-sm text-ink-light leading-relaxed">{item.desc}</p>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* CTA */}
        <ScrollReveal variant="fade-up" className="text-center py-16 mb-16">
          <h2 className="text-3xl font-serif font-semibold text-ink mb-4">Ready to try it?</h2>
          <p className="text-ink-light mb-8">50 free credits. No credit card required.</p>
          <Link href="/register"
            className="rolling-btn px-10 py-4 rounded-full bg-ink text-cream-light text-sm font-medium shadow-lg shadow-ink/10">
            <span className="rolling-text">Get Started Free</span>
            <span className="rolling-text-clone">Get Started Free</span>
          </Link>
        </ScrollReveal>

        {/* ═══════════ DEVELOPED BY KOUSHIK ═══════════ */}
        <ScrollReveal variant="fade-up">
          <div className="border-t border-ink/[0.06] pt-12 text-center">
            <p className="text-xs text-ink-muted tracking-[0.2em] uppercase mb-4">Developed by</p>
            <p className="text-2xl font-serif font-semibold text-ink mb-6">Koushik</p>
            <a
              href="https://github.com/koushiknagabhatla-ctrl"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-ink text-cream-light text-sm font-medium hover:bg-ink/90 transition-all duration-300 hover:scale-[1.02]"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              GitHub
            </a>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
