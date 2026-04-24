'use client';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRef, MouseEvent } from 'react';
import { Cpu, Zap, Lock, Target, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { CinematicIntro } from '@/components/ui/intro-sequence';

/* ─── Cinematic Label ─── */
function SectionLabel({ num, label }: { num: string; label: string }) {
  return (
    <div className="flex items-center gap-4 mb-10">
      <span className="text-xs font-bold tracking-[0.25em] uppercase text-ink/70 tabular-nums">{num}</span>
      <div className="w-10 h-px bg-ink/20" />
      <span className="text-xs font-bold tracking-[0.25em] uppercase text-ink/70">{label}</span>
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
      className={`p-10 h-full border border-ink/10 rounded-[2rem] bg-ink/[0.02] hover:bg-ink/[0.04] transition-all duration-500 hover:shadow-2xl hover:shadow-ink/5 ${className || ''}`}>
      <div style={{ transform: 'translateZ(12px)' }}>{children}</div>
    </motion.div>
  );
}

/* ─── Line Reveal ─── */
function LineReveal({ children, delay = 0 }: { children: string; delay?: number }) {
  return (
    <span className="block overflow-hidden pb-4">
      <motion.span className="block"
        initial={{ y: '130%' }}
        whileInView={{ y: 0 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay }}>
        {children}
      </motion.span>
    </span>
  );
}

export function AboutView() {
  return (
    <CinematicIntro>
      <div className="w-full min-h-screen bg-cream selection:bg-ink selection:text-cream">
        <div className="max-w-5xl mx-auto px-6 pt-40 pb-32">
          
          {/* Back */}
          <ScrollReveal variant="fade-right">
            <Link href="/" className="inline-flex items-center gap-3 font-bold text-ink hover:text-ink/60 transition-colors duration-300 mb-20 group">
              <span className="w-8 h-8 rounded-full border border-ink/20 flex items-center justify-center group-hover:-translate-x-1 transition-transform duration-300">
                <ArrowLeft className="w-4 h-4" />
              </span> 
              Return Home
            </Link>
          </ScrollReveal>

          {/* Header */}
          <div className="mb-40">
            <ScrollReveal variant="fade-up">
              <SectionLabel num="—" label="About us" />
            </ScrollReveal>
            <h1 className="text-4xl md:text-[5rem] font-serif font-bold leading-[0.95] tracking-tight mb-12 text-ink">
              <LineReveal delay={0.1}>Building the future</LineReveal>
              <span className="block overflow-hidden relative pb-4">
                <motion.span className="block italic text-ink"
                  initial={{ y: '130%' }}
                  whileInView={{ y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}>
                  of image editing.
                </motion.span>
              </span>
            </h1>

            <ScrollReveal variant="fade-up" delay={0.3}>
              <p className="text-xl md:text-2xl text-ink/80 font-medium leading-relaxed max-w-3xl">
                VCranks AI is a professional-grade background removal platform built from the ground up.
                No third-party APIs. No shortcuts. Just a custom-trained neural network delivering pixel-perfect
                results at machine speed.
              </p>
            </ScrollReveal>
          </div>

          {/* Stats */}
          <div className="mb-40">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: "10K+", label: "Images" },
                { value: "99.9%", label: "Uptime" },
                { value: "<1s", label: "Speed" },
                { value: "0", label: "Stored" },
              ].map((stat, i) => (
                <ScrollReveal key={stat.label} variant="fade-up" delay={i * 0.08}>
                  <div className="text-center p-8 rounded-3xl bg-ink/5 border border-ink/5">
                    <div className="text-3xl md:text-4xl font-serif font-bold text-ink mb-3">{stat.value}</div>
                    <div className="text-xs font-bold text-ink/50 uppercase tracking-[0.25em]">{stat.label}</div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          {/* Technology */}
          <div className="mb-40">
            <ScrollReveal variant="fade-up">
              <SectionLabel num="01" label="The Engine" />
            </ScrollReveal>
            <ScrollReveal variant="fade-up" delay={0.1}>
              <h2 className="text-4xl md:text-[4.5rem] font-serif font-bold leading-[1.05] tracking-tight mb-20 text-ink">
                Engineered for<br /><em className="text-ink">perfection</em>.
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: <Cpu />, title: "Custom Neural Network", desc: "MobileNetV3-Small U-Net with CBAM attention. Trained on P3M-10K with progressive resolution." },
                { icon: <Zap />, title: "INT8 Quantization", desc: "4x faster inference, zero quality loss. ONNX format optimized for extreme CPU execution speed." },
                { icon: <Lock />, title: "HMAC-SHA256 Security", desc: "Every request cryptographically signed. Images processed completely in-memory, never written to disk." },
                { icon: <Target />, title: "Edge Deployment", desc: "High-performance processing servers behind global edge networks for sub-second response worldwide." },
              ].map((item, i) => (
                <ScrollReveal key={item.title} variant="fade-up" delay={i * 0.1}>
                  <TiltCard className="group cursor-default">
                    <div className="w-14 h-14 rounded-full bg-ink/5 flex items-center justify-center text-ink mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:bg-ink group-hover:text-cream">
                      {item.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-ink mb-4 transition-transform duration-500 group-hover:translate-x-2">{item.title}</h3>
                    <p className="text-lg text-ink/80 leading-relaxed font-medium transition-transform duration-500 group-hover:translate-x-2">{item.desc}</p>
                  </TiltCard>
                </ScrollReveal>
              ))}
            </div>
          </div>

          {/* ═══════════ CTA ═══════════ */}
          <section className="py-32 px-6 bg-ink text-cream rounded-[3rem] relative overflow-hidden mb-32">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cream/10 rounded-full blur-3xl pointer-events-none" />
            <div className="max-w-3xl mx-auto text-center relative z-10">
              <ScrollReveal variant="scale" duration={1.2}>
                <h2 className="text-4xl md:text-[4rem] font-serif font-bold leading-[1.05] tracking-tight mb-8">
                  Ready to try it?
                </h2>
                <p className="text-xl text-cream/70 mb-12 font-medium">50 free credits. No credit card required.</p>
                <Link href="/register"
                  className="inline-block px-12 py-5 rounded-full bg-cream text-ink font-bold text-lg shadow-2xl hover:scale-105 transition-all duration-500">
                  Get Started Free
                </Link>
              </ScrollReveal>
            </div>
          </section>

          {/* ═══════════ DEVELOPED BY KOUSHIK ═══════════ */}
          <ScrollReveal variant="fade-up">
            <div className="border-t-2 border-ink/[0.08] pt-20 text-center">
              <p className="text-xs font-bold text-ink/50 tracking-[0.3em] uppercase mb-6">Designed & Developed by</p>
              <p className="text-4xl font-serif font-bold text-ink mb-12">Koushik</p>
              <a
                href="https://github.com/koushiknagabhatla-ctrl"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-ink text-cream font-bold text-sm shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                GitHub Profile
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              </a>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </CinematicIntro>
  );
}
