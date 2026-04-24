'use client';
import { motion, useScroll, useTransform, useInView, animate } from 'framer-motion';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { Check, Star, Zap, Code, Shield, UploadCloud, Cpu, Award, Users, DownloadCloud } from 'lucide-react';
import { CinematicIntro } from '@/components/ui/intro-sequence';
import { ImageComparisonSlider } from '@/components/ui/image-comparison-slider';

const premiumEase = [0.16, 1, 0.3, 1] as const;

/* ═════════ UTILITIES ═════════ */
function SectionLabel({ label }: { label: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 1, ease: premiumEase }}
      className="flex items-center gap-4 mb-8 md:mb-12"
    >
      <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse" />
      <span className="text-xs font-bold tracking-[0.3em] uppercase text-cyan-400/80">{label}</span>
    </motion.div>
  );
}

function Counter({ from, to, duration = 2 }: { from: number; to: number; duration?: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(nodeRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView && nodeRef.current) {
      const controls = animate(from, to, {
        duration,
        ease: "easeOut",
        onUpdate(value) {
          if (nodeRef.current) {
            nodeRef.current.textContent = Math.floor(value).toLocaleString();
          }
        },
      });
      return () => controls.stop();
    }
  }, [from, to, duration, isInView]);

  return <span ref={nodeRef}>{from}</span>;
}

/* ═════════ SECTIONS ═════════ */

function HeroSection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  return (
    <section className="relative w-full min-h-[95vh] flex flex-col justify-center px-6 md:px-16 pt-32 pb-20 overflow-hidden">
      {/* Background Abstract Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none mix-blend-screen" />
      
      {/* Oryzo Tech Grid Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '100px 100px' }} />

      <div className="relative z-10 w-full max-w-[1600px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={mounted ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1, duration: 1, ease: premiumEase }}
          className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-md mb-8"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/70">V2.0 Neural Engine</span>
        </motion.div>

        <h1 className="text-[clamp(3.5rem,10vw,12rem)] leading-[0.85] tracking-[-0.04em] font-serif font-bold text-white mb-10 w-full max-w-[1400px]">
          <span className="block overflow-hidden pb-4">
            <motion.span className="block" initial={{ y: '110%' }} animate={mounted ? { y: 0 } : {}} transition={{ delay: 0.2, duration: 1.2, ease: premiumEase }}>Extract Reality.</motion.span>
          </span>
          <span className="block overflow-hidden pb-4">
            <motion.span className="block italic text-white/50 pr-4" initial={{ y: '110%' }} animate={mounted ? { y: 0 } : {}} transition={{ delay: 0.3, duration: 1.2, ease: premiumEase }}>Isolate</motion.span>
          </span>
          <span className="block overflow-hidden pb-4">
            <motion.span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-cyan-400/50" initial={{ y: '110%' }} animate={mounted ? { y: 0 } : {}} transition={{ delay: 0.4, duration: 1.2, ease: premiumEase }}>Perfection.</motion.span>
          </span>
        </h1>

        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-12 w-full border-t border-white/10 pt-12">
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={mounted ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1.2, delay: 0.8, ease: premiumEase }}
            className="text-xl md:text-2xl text-white/50 max-w-2xl font-light leading-relaxed"
          >
            The invisible intelligence powering the world's most demanding creative pipelines. Zero pixels lost. Zero backgrounds remaining.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={mounted ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1.2, delay: 1, ease: premiumEase }}
            className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto"
          >
             <Link href="/register" className="w-full sm:w-auto px-10 py-5 rounded-full bg-white text-[#050508] font-bold text-xs tracking-[0.1em] uppercase hover:scale-105 transition-transform duration-500 flex items-center justify-center">
                Get Started
             </Link>
             <Link href="/login" className="w-full sm:w-auto px-8 py-5 rounded-full border border-white/20 text-white/80 font-bold text-xs tracking-[0.1em] uppercase hover:bg-white/5 transition-colors duration-500 flex items-center justify-center">
                Sign In
             </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function SocialProof() {
  return (
    <section className="py-20 px-6 md:px-16 border-y border-white/5 bg-[#050508] relative">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-12 md:gap-0">
        <div className="flex flex-col items-center md:items-start opacity-70 hover:opacity-100 transition-opacity">
          <span className="text-4xl md:text-6xl font-serif font-bold text-white mb-2"><Counter from={0} to={4200000} duration={3} />+</span>
          <span className="text-[10px] tracking-[0.2em] uppercase text-cyan-400">API Requests Served</span>
        </div>
        <div className="flex flex-col items-center md:items-start opacity-70 hover:opacity-100 transition-opacity">
          <span className="text-4xl md:text-6xl font-serif font-bold text-white mb-2"><Counter from={0} to={99} duration={2} />.<Counter from={0} to={9} duration={2} />%</span>
          <span className="text-[10px] tracking-[0.2em] uppercase text-violet-400">Sub-pixel Accuracy</span>
        </div>
        <div className="flex flex-col items-center md:items-start opacity-70 hover:opacity-100 transition-opacity">
          <span className="text-4xl md:text-6xl font-serif font-bold text-white mb-2">&lt;<Counter from={0} to={30} duration={2} />ms</span>
          <span className="text-[10px] tracking-[0.2em] uppercase text-lime-400">Avg. Inference Time</span>
        </div>
      </div>
    </section>
  );
}

function DemoSection() {
  return (
    <section className="py-32 md:py-48 px-6 md:px-16 bg-[#030305]">
      <div className="max-w-[1600px] mx-auto">
        <SectionLabel label="Product Showcase" />
        <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-20 max-w-3xl leading-tight">
          Micro-level precision. <br /> <span className="text-white/40 italic">Even on complex subjects.</span>
        </h2>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: premiumEase }}
          className="w-full h-[60vh] md:h-[80vh] rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(139,92,246,0.15)] border border-white/10"
        >
          <ImageComparisonSlider
            leftImage="https://images.unsplash.com/photo-1549416878-b9ca95e26903?w=1600&q=80"
            rightImage="https://images.unsplash.com/photo-1549416878-b9ca95e26903?w=1600&q=80&monochrome=101010"
            altLeft="Original" altRight="Transparent"
          />
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { title: "Drop Media", desc: "Upload via UI or ping our API endpoint. We support RAW, high-res JPGs, and PNGs natively.", icon: <UploadCloud className="w-6 h-6" /> },
    { title: "Neural Isolation", desc: "Our massive U-Net array dissects the foreground semantic layers in sub 30ms.", icon: <Cpu className="w-6 h-6" /> },
    { title: "Alpha Export", desc: "Instantly retrieve your pristine asset. Zero compressed downscaling.", icon: <DownloadCloud className="w-6 h-6" /> }
  ];

  return (
    <section className="py-32 px-6 md:px-16 relative">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row gap-20">
        <div className="w-full md:w-1/3">
          <SectionLabel label="The Mechanism" />
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">3 Steps to <br/><span className="text-cyan-400 italic">Clarity.</span></h2>
          <p className="text-white/50 text-lg leading-relaxed">A completely frictionless architectural flow designed to keep you inside your creative engine.</p>
        </div>
        
        <div className="w-full md:w-2/3 flex flex-col gap-12">
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 1, delay: i * 0.15, ease: premiumEase }}
              className="flex gap-8 group"
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-500">
                  {step.icon}
                </div>
                {i !== steps.length - 1 && <div className="w-px h-full bg-white/5 mt-8" />}
              </div>
              <div className="pb-12">
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors">{step.title}</h3>
                <p className="text-white/50 leading-relaxed max-w-lg">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}



function Testimonials() {
  return (
    <section className="py-32 md:py-48 px-6 md:px-16 overflow-hidden">
      <div className="max-w-[1600px] mx-auto text-center flex flex-col items-center mb-20">
        <SectionLabel label="Industry Vetted" />
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-white max-w-2xl">Relied upon by massive design pipelines globally.</h2>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once:true }} transition={{duration:1, ease:premiumEase}} className="p-10 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
          <div className="flex gap-1 mb-8 text-cyan-400">
            <Star className="w-4 h-4 fill-current"/> <Star className="w-4 h-4 fill-current"/> <Star className="w-4 h-4 fill-current"/> <Star className="w-4 h-4 fill-current"/> <Star className="w-4 h-4 fill-current"/>
          </div>
          <p className="text-xl md:text-2xl font-light text-white/80 leading-relaxed mb-8">
            "We integrated the VCranks API into our CMS upload pipeline. It completely eliminated thousands of hours of manual catalog processing. Absolute game changer."
          </p>
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-white/10" />
             <div><p className="text-white font-bold text-sm">Sarah Jenkins</p><p className="text-white/40 text-xs">Creative Director, NeoBrand</p></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once:true }} transition={{duration:1, delay: 0.1, ease:premiumEase}} className="p-10 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
          <div className="flex gap-1 mb-8 text-cyan-400">
            <Star className="w-4 h-4 fill-current"/> <Star className="w-4 h-4 fill-current"/> <Star className="w-4 h-4 fill-current"/> <Star className="w-4 h-4 fill-current"/> <Star className="w-4 h-4 fill-current"/>
          </div>
          <p className="text-xl md:text-2xl font-light text-white/80 leading-relaxed mb-8">
            "The semantic isolation on stray hair and transparent fabrics is unmatched. Better than Adobe's native tools, and infinitely faster via the web."
          </p>
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-white/10" />
             <div><p className="text-white font-bold text-sm">Marcus Wei</p><p className="text-white/40 text-xs">Lead Photographer</p></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-40 md:py-64 px-6 md:px-16 bg-[#020202] text-white relative overflow-hidden rounded-t-[3rem] md:rounded-t-[5rem]">
      {/* Massive Shader Background Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none opacity-[0.01]">
        <span className="text-[25vw] font-serif font-bold whitespace-nowrap tracking-tighter">VCRANKS</span>
      </div>

      <div className="max-w-[1200px] mx-auto text-center flex flex-col items-center relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: premiumEase }}>
          <span className="px-6 py-2 rounded-full border border-white/10 text-[10px] font-bold tracking-[0.4em] uppercase text-cyan-400 mb-10 inline-flex items-center gap-3">
            <Zap className="w-3 h-3" /> Ready when you are
          </span>
          <h2 className="text-[clamp(4rem,8vw,8rem)] font-serif font-bold leading-[0.85] tracking-tight mb-8">
            Initialize <span className="italic font-light text-white/50 block md:inline mt-4 md:mt-0">perfection.</span>
          </h2>
          <p className="text-xl md:text-2xl text-white/60 font-light mb-16 max-w-2xl mx-auto">
            Join the ranks of elite designers. Sign up today and get 50 high-res extractions on us.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/register" className="w-full sm:w-auto inline-flex items-center justify-center px-14 py-6 rounded-full bg-white text-black font-bold text-xs uppercase tracking-widest hover:scale-[1.03] hover:shadow-[0_0_80px_rgba(255,255,255,0.2)] transition-all duration-500">
              Start Building Free
            </Link>
            <Link href="/login" className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-6 rounded-full border border-white/20 bg-transparent text-white font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all duration-500">
              Access Terminal
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-black pb-12 px-6 md:px-16 pt-20">
      <div className="max-w-[1600px] mx-auto border-t border-white/10 pt-12 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-6">
        <span className="text-2xl font-serif font-bold text-white flex items-center gap-2">VCRANKS <Award className="w-5 h-5 text-cyan-400" /></span>
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/30 text-center">
          © 2026 VCranks AI. All Rights Reserved. Engineered with precision.
        </p>
        <div className="flex items-center gap-8">
          <Link href="/about" className="text-[10px] font-bold text-white/50 hover:text-cyan-400 transition-colors uppercase tracking-[0.2em]">Our Architecture</Link>
          <Link href="/tool" className="text-[10px] font-bold text-white/50 hover:text-cyan-400 transition-colors uppercase tracking-[0.2em]">Interface</Link>
        </div>
      </div>
    </footer>
  );
}

/* ═════════ MAIN VIEW EXPORT ═════════ */
export function LandingView() {
  return (
    <CinematicIntro>
      <main className="w-full min-h-screen bg-[#050508] text-white selection:bg-cyan-500/30 selection:text-white font-sans">
        <HeroSection />
        <SocialProof />
        <DemoSection />
        <HowItWorks />
        <Testimonials />
        <FinalCTA />
        <Footer />
      </main>
    </CinematicIntro>
  );
}
