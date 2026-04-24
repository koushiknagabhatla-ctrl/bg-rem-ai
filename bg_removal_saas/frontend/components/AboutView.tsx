'use client';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRef, MouseEvent } from 'react';
import { Zap, Target, Lock, Cpu, ArrowLeft } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

/* ─── Parallax Tilt Card (no glow, subtle 3D) ─── */
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["6deg", "-6deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-6deg", "6deg"]);

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
      <div style={{ transform: 'translateZ(15px)' }}>{children}</div>
    </motion.div>
  );
}

export function AboutView() {
  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        {/* Back link */}
        <ScrollReveal variant="fade-right">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-black text-sm transition-colors mb-16">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
        </ScrollReveal>

        {/* Header */}
        <ScrollReveal variant="fade-up" className="mb-20">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-black mb-6">
            About <span className="gradient-text">VCranks AI</span>
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed max-w-2xl">
            VCranks AI is a professional-grade background removal platform built from the ground up.
            No third-party APIs, no shortcuts — just a custom-trained neural network delivering
            pixel-perfect results at machine speed.
          </p>
        </ScrollReveal>

        {/* Stats */}
        <ScrollReveal variant="scale" className="mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "10K+", label: "Images Processed" },
              { value: "99.9%", label: "Uptime" },
              { value: "<1s", label: "Processing Time" },
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
        </ScrollReveal>

        {/* Mission */}
        <ScrollReveal variant="fade-up" className="mb-20">
          <h2 className="text-2xl font-bold text-black mb-6">Our mission</h2>
          <p className="text-gray-500 leading-relaxed">
            We believe professional image editing shouldn&apos;t require expensive software or years of experience.
            VCranks AI makes background removal accessible to everyone — designers, marketers, e-commerce sellers,
            and anyone who needs clean, professional cutouts without the complexity.
          </p>
        </ScrollReveal>

        {/* Tech — Tilt Cards */}
        <ScrollReveal variant="fade-up" className="mb-20">
          <h2 className="text-2xl font-bold text-black mb-10">The technology</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { icon: <Cpu className="w-5 h-5" />, title: "Custom Neural Network", desc: "Built on MobileNetV3-Small U-Net architecture with CBAM attention modules. Trained on millions of images for edge-case handling." },
              { icon: <Zap className="w-5 h-5" />, title: "INT8 Quantization", desc: "Model quantized to INT8 precision for 4x faster inference without quality loss. Optimized for both GPU and CPU deployment." },
              { icon: <Lock className="w-5 h-5" />, title: "HMAC-SHA256 Security", desc: "Every API request is cryptographically signed. Your images are processed in-memory and never persisted to disk." },
              { icon: <Target className="w-5 h-5" />, title: "Edge Deployment", desc: "Inference runs on dedicated infrastructure served through edge networks for sub-second response times globally." },
            ].map((item, i) => (
              <ScrollReveal key={item.title} variant="fade-up" delay={i * 0.1}>
                <TiltCard className="p-7 h-full">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-4 text-indigo-500">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-black mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal variant="fade-up" className="text-center py-16 mb-16">
          <h2 className="text-3xl font-bold text-black mb-4">Ready to try it?</h2>
          <p className="text-gray-500 mb-8">50 free credits. No credit card required.</p>
          <Link href="/register"
            className="inline-block px-10 py-3.5 rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-all shadow-lg shadow-black/10 hover:scale-[1.02] active:scale-[0.98]">
            Get Started Free
          </Link>
        </ScrollReveal>

        {/* ═══════════ Developed By ═══════════ */}
        <ScrollReveal variant="fade-up">
          <div className="border-t border-gray-100 pt-12 text-center">
            <p className="text-sm text-gray-400 mb-4">Developed by</p>
            <p className="text-xl font-bold text-black mb-6">Koushik</p>
            <a
              href="https://github.com/koushiknagabhatla-ctrl"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-black transition-all hover:scale-[1.02]"
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
