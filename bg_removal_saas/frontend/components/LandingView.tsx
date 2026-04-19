'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, Zap, Shield, Image as ImageIcon, CreditCard, Star } from 'lucide-react';

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } }
};

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export function LandingView() {
  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Hero Section */}
      <section id="hero" className="w-full min-h-[92vh] flex flex-col items-center justify-center relative px-6 py-24 text-center">
        {/* Background orbs */}
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-purple-600/15 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[15%] w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none" />
        
        <motion.div 
          variants={stagger}
          initial="initial"
          animate="animate"
          className="max-w-4xl flex flex-col items-center gap-8 relative z-10"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-300 text-sm font-medium">
            <Sparkles className="w-4 h-4" /> PixelForge V2 — AI Core Online
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl md:text-8xl font-black tracking-[-0.04em] leading-[0.95]">
            <span className="text-white">Erase backgrounds.</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400">Keep perfection.</span>
          </motion.h1>
          
          <motion.p variants={fadeUp} className="text-lg md:text-xl text-white/40 max-w-2xl font-light leading-relaxed">
            Professional-grade AI background removal in 40ms.
            Custom MobileNetV3 U-Net, INT8 quantized, served at the edge.
          </motion.p>
          
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4 mt-4">
            <Link href="/register" className="px-10 py-4 rounded-xl bg-white text-black text-base font-semibold hover:bg-white/90 transition-all shadow-2xl shadow-white/10 hover:shadow-white/20 hover:scale-[1.02] active:scale-[0.98]">
              Start For Free →
            </Link>
            <Link href="/#about" className="px-8 py-4 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/20 text-base font-medium transition-all">
              How It Works
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* About / Features Section */}
      <section id="about" className="w-full max-w-7xl px-6 py-32 border-t border-white/[0.04]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Technology Driven Design</h2>
          <p className="text-lg text-white/35 max-w-2xl mx-auto leading-relaxed">
            Not just another wrapper. A custom MobileNetV3-Small U-Net, quantized to INT8 precision, secured via HMAC-SHA256 and served through Edge networks.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<Zap className="w-6 h-6 text-yellow-400" />}
            title="40ms Inference"
            desc="Lightning fast execution. From upload to extraction in less time than a single screen refresh cycle."
          />
          <FeatureCard 
            icon={<ImageIcon className="w-6 h-6 text-blue-400" />}
            title="Maximum Fidelity"
            desc="Zero downscaling. We preserve your image's original resolution while cleanly separating the foreground."
          />
          <FeatureCard 
            icon={<Shield className="w-6 h-6 text-emerald-400" />}
            title="Secure Enclave"
            desc="HMAC-SHA256 signature verification protects every request. Images are processed in-memory and never stored."
          />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="w-full max-w-5xl px-6 py-32 border-t border-white/[0.04]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Simple Pricing</h2>
          <p className="text-lg text-white/35 max-w-xl mx-auto">Start free. Scale as you grow.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 flex flex-col gap-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                <CreditCard className="w-5 h-5 text-white/60" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Free Tier</h3>
                <p className="text-sm text-white/40">For individuals</p>
              </div>
            </div>
            <div className="text-3xl font-bold">50 <span className="text-base font-normal text-white/40">credits</span></div>
            <ul className="space-y-3 text-sm text-white/50">
              <li className="flex items-center gap-2"><Star className="w-4 h-4 text-purple-400" /> 5 credits per image</li>
              <li className="flex items-center gap-2"><Star className="w-4 h-4 text-purple-400" /> Full resolution output</li>
              <li className="flex items-center gap-2"><Star className="w-4 h-4 text-purple-400" /> PNG + JPEG export</li>
              <li className="flex items-center gap-2"><Star className="w-4 h-4 text-purple-400" /> Before/After comparison</li>
            </ul>
            <Link href="/register" className="w-full py-3 rounded-lg border border-white/10 hover:bg-white/5 text-center text-sm font-medium text-white/70 transition-all mt-auto">
              Get Started
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8 flex flex-col gap-6 border-purple-500/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-bl-lg">Popular</div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Pro</h3>
                <p className="text-sm text-white/40">For professionals</p>
              </div>
            </div>
            <div className="text-3xl font-bold">Unlimited <span className="text-base font-normal text-white/40">credits</span></div>
            <ul className="space-y-3 text-sm text-white/50">
              <li className="flex items-center gap-2"><Star className="w-4 h-4 text-purple-400" /> Unlimited generations</li>
              <li className="flex items-center gap-2"><Star className="w-4 h-4 text-purple-400" /> Priority inference</li>
              <li className="flex items-center gap-2"><Star className="w-4 h-4 text-purple-400" /> Batch processing</li>
              <li className="flex items-center gap-2"><Star className="w-4 h-4 text-purple-400" /> API access</li>
            </ul>
            <Link href="/register" className="w-full py-3 rounded-lg bg-white text-black text-center text-sm font-semibold hover:bg-white/90 transition-all mt-auto shadow-lg">
              Upgrade to Pro
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-white/[0.04] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-white/80">PixelForge</span>
          </div>
          <p className="text-sm text-white/30">© 2026 PixelForge AI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/#about" className="text-sm text-white/40 hover:text-white/70 transition-colors">About</Link>
            <Link href="/#pricing" className="text-sm text-white/40 hover:text-white/70 transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className="glass-card p-8 flex flex-col gap-4 relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white/90">{title}</h3>
      <p className="text-white/35 leading-relaxed text-sm">{desc}</p>
    </motion.div>
  );
}
