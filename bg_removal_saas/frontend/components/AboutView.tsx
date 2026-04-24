'use client';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRef, MouseEvent } from 'react';
import { Cpu, Zap, Lock, Target, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

/* ─── Section Label (consistent with Landing) ─── */
function SectionLabel({ num, label }: { num: string; label: string }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <span className="text-xs font-medium tracking-[0.25em] uppercase text-ink/30 tabular-nums">{num}</span>
      <div className="w-8 h-px bg-ink/10" />
      <span className="text-xs font-medium tracking-[0.25em] uppercase text-ink/30">{label}</span>
    </div>
  );
}

/* ─── 3D Tilt Card ─── */
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

/* ─── Line Reveal ─── */
function LineReveal({ children, delay = 0 }: { children: string; delay?: number }) {
  return (
    <span className="block overflow-hidden">
      <motion.span className="block"
        initial={{ y: '120%', rotate: 2 }}
        whileInView={{ y: 0, rotate: 0 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1], delay }}>
        {children}
      </motion.span>
    </span>
  );
}

export function AboutView() {
  return (
    <div className="w-full min-h-screen">
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        {/* Back */}
        <ScrollReveal variant="fade-right">
          <Link href="/" className="inline-flex items-center gap-2 text-ink/30 hover:text-ink text-sm transition-colors duration-300 mb-20">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
        </ScrollReveal>

        {/* Header */}
        <div className="mb-28">
          <ScrollReveal variant="fade-up">
            <SectionLabel num="—" label="About us" />
          </ScrollReveal>
          <h1 className="text-4xl md:text-[3.5rem] font-serif font-semibold leading-[1.05] tracking-tight mb-8">
            <LineReveal delay={0.1}>Building the future</LineReveal>
            <span className="block overflow-hidden">
              <motion.span className="block italic text-ink/40"
                initial={{ y: '120%', rotate: 2 }}
                whileInView={{ y: 0, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1], delay: 0.25 }}>
                of image editing.
              </motion.span>
            </span>
          </h1>

          <ScrollReveal variant="fade-up" delay={0.3}>
            <p className="text-lg text-ink/40 leading-relaxed max-w-2xl">
              VCranks AI is a professional-grade background removal platform built from the ground up.
              No third-party APIs. No shortcuts. Just a custom-trained neural network delivering pixel-perfect
              results at machine speed.
            </p>
          </ScrollReveal>
        </div>

        {/* Stats */}
        <div className="mb-28">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "10K+", label: "Images" },
              { value: "99.9%", label: "Uptime" },
              { value: "<1s", label: "Speed" },
              { value: "0", label: "Stored" },
            ].map((stat, i) => (
              <ScrollReveal key={stat.label} variant="fade-up" delay={i * 0.08}>
                <div className="text-center p-6 rounded-2xl section-cream">
                  <div className="text-2xl md:text-3xl font-serif font-semibold text-ink mb-1">{stat.value}</div>
                  <div className="text-[10px] text-ink/25 uppercase tracking-[0.25em]">{stat.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Mission */}
        <div className="mb-28">
          <ScrollReveal variant="fade-up">
            <SectionLabel num="01" label="Mission" />
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.1}>
            <p className="text-ink/40 leading-relaxed text-base max-w-2xl">
              We believe professional image editing shouldn&apos;t require expensive software or years of experience.
              VCranks AI makes background removal accessible to everyone — designers, marketers, e-commerce sellers,
              and anyone who needs clean, professional cutouts without the complexity.
            </p>
          </ScrollReveal>
        </div>

        {/* Technology */}
        <div className="mb-28">
          <ScrollReveal variant="fade-up">
            <SectionLabel num="02" label="Technology" />
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delay={0.1}>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold leading-[1.1] tracking-tight mb-14">
              Engineered for<br /><em className="text-ink/40">perfection</em>.
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: <Cpu className="w-5 h-5" />, title: "Custom Neural Network", desc: "MobileNetV3-Small U-Net with CBAM attention. Trained on P3M-10K with progressive resolution." },
              { icon: <Zap className="w-5 h-5" />, title: "INT8 Quantization", desc: "4x faster inference, zero quality loss. ONNX format optimized for CPU and GPU." },
              { icon: <Lock className="w-5 h-5" />, title: "HMAC-SHA256 Security", desc: "Every request cryptographically signed. Images processed in-memory, never written to disk." },
              { icon: <Target className="w-5 h-5" />, title: "Edge Deployment", desc: "Dedicated GPU servers with global edge networks for sub-second response worldwide." },
            ].map((item, i) => (
              <ScrollReveal key={item.title} variant="fade-up" delay={i * 0.08}>
                <TiltCard className="p-7 h-full group">
                  <div className="text-ink/25 group-hover:text-ink/60 transition-colors duration-500 mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-ink mb-2 transition-all duration-500 group-hover:italic">{item.title}</h3>
                  <p className="text-sm text-ink/40 leading-relaxed">{item.desc}</p>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* CTA */}
        <ScrollReveal variant="scale" className="text-center py-16 mb-16">
          <h2 className="text-3xl font-serif font-semibold text-ink mb-4">Ready to try it?</h2>
          <p className="text-ink/40 mb-10">50 free credits. No credit card required.</p>
          <Link href="/register" data-mascot="excited"
            className="inline-block px-10 py-4 rounded-full bg-ink text-cream-light text-sm font-medium shadow-lg shadow-ink/10 hover:bg-ink/90 transition-all duration-300">
            Get Started Free
          </Link>
        </ScrollReveal>

        {/* ═══════════ DEVELOPED BY KOUSHIK ═══════════ */}
        <ScrollReveal variant="fade-up">
          <div className="border-t border-ink/[0.05] pt-14 text-center">
            <p className="text-[10px] text-ink/25 tracking-[0.3em] uppercase mb-4">Developed by</p>
            <p className="text-2xl font-serif font-semibold text-ink mb-8">Koushik</p>
            <a
              href="https://github.com/koushiknagabhatla-ctrl"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-ink text-cream-light text-sm font-medium hover:bg-ink/90 transition-all duration-300 group"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              GitHub
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </a>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
