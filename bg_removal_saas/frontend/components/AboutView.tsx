'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Zap, Target, Lock, Cpu, ArrowLeft } from 'lucide-react';

export function AboutView() {
  return (
    <div className="w-full min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#030014] via-black to-black pointer-events-none -z-10" />
      <div className="fixed top-[20%] left-[30%] w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="fixed bottom-[20%] right-[20%] w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        {/* Back link */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <Link href="/" className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 text-sm transition-colors mb-16">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-20">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
            About <span className="gradient-text">VCranks AI</span>
          </h1>
          <p className="text-lg text-white/35 leading-relaxed max-w-2xl">
            VCranks AI is a professional-grade background removal platform built from the ground up.
            No third-party APIs, no shortcuts — just a custom-trained neural network delivering
            pixel-perfect results at machine speed.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-20">
          <h2 className="text-2xl font-bold mb-6">Our mission</h2>
          <p className="text-white/35 leading-relaxed text-base">
            We believe professional image editing shouldn&apos;t require expensive software or years of experience.
            VCranks AI makes background removal accessible to everyone — designers, marketers, e-commerce sellers,
            and anyone who needs clean, professional cutouts without the complexity.
          </p>
        </motion.section>

        {/* Tech Stack */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-20">
          <h2 className="text-2xl font-bold mb-10">The technology</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { icon: <Cpu className="w-5 h-5" />, title: "Custom Neural Network", desc: "Built on MobileNetV3-Small U-Net architecture with CBAM attention modules. Trained on millions of images for edge-case handling." },
              { icon: <Zap className="w-5 h-5" />, title: "INT8 Quantization", desc: "Model quantized to INT8 precision for 4x faster inference without quality loss. Optimized for both GPU and CPU deployment." },
              { icon: <Lock className="w-5 h-5" />, title: "HMAC-SHA256 Security", desc: "Every API request is cryptographically signed. Your images are processed in-memory and never persisted to disk." },
              { icon: <Target className="w-5 h-5" />, title: "Edge Deployment", desc: "Inference runs on dedicated infrastructure served through edge networks for sub-second response times globally." },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="glow-card p-7 h-full">
                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4 text-white/50">{item.icon}</div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-white/30 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center py-16">
          <h2 className="text-3xl font-bold mb-4">Ready to try it?</h2>
          <p className="text-white/30 mb-8">50 free credits. No credit card required.</p>
          <Link href="/register" className="inline-block px-10 py-3.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all shadow-2xl shadow-white/10">
            Get Started Free
          </Link>
        </motion.section>
      </div>
    </div>
  );
}
