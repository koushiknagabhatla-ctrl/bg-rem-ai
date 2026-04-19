'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, Zap, Shield, Image as ImageIcon } from 'lucide-react';
import { LiquidButton } from './ui/liquid-glass-button';

export function LandingView() {
  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Hero Section */}
      <section id="hero" className="w-full min-h-[90vh] flex flex-col items-center justify-center relative px-6 py-24 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl flex flex-col items-center gap-8 relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" /> PixelForge V2 Core Online
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/30">
            Erase the world.<br />
            Keep the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-500">subject.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/50 max-w-2xl font-light">
            Automated, absolute-precision background removal. 
            Powered by a massive 40ms inference pipeline.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
            <Link href="/register">
              <LiquidButton size="xxl" className="w-full sm:w-auto text-lg px-12">
                Start Generating For Free
              </LiquidButton>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* About/Features Section */}
      <section id="about" className="w-full max-w-7xl px-6 py-32 border-t border-white/5">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white/90">Technology Driven Design</h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">
            Not just another wrapper. We built a custom MobileNetV3-Small U-Net, quantified into INT8 precision, and served securely via Edge networks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Zap className="w-6 h-6 text-yellow-400" />}
            title="40ms Inference"
            desc="Lightning fast execution. From upload to extraction in less time than a screen refresh."
          />
          <FeatureCard 
            icon={<ImageIcon className="w-6 h-6 text-blue-400" />}
            title="Max Fidelity"
            desc="Zero downscaling. We preserve your image's original resolution while cleanly severing the background."
          />
          <FeatureCard 
            icon={<Shield className="w-6 h-6 text-emerald-400" />}
            title="Secure Enclave"
            desc="HMAC-SHA256 signature verification protects your assets. Images are processed and instantly discarded."
          />
        </div>
      </section>

    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass p-8 rounded-2xl flex flex-col gap-4 relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white/90">{title}</h3>
      <p className="text-white/40 leading-relaxed">{desc}</p>
    </motion.div>
  );
}
