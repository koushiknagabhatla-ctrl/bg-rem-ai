'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';

const ease = [0.16, 1, 0.3, 1] as const;

export function Footer() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <footer ref={ref} className="bg-black px-6 md:px-16 pt-20 pb-10">
      <div className="max-w-[1280px] mx-auto">
        {/* Top Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease }}
          className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-16 border-b border-white/[0.06]"
        >
          {/* Brand */}
          <div>
            <span className="font-display text-2xl font-bold text-white block mb-4">VCranks <span className="text-[#6C63FF] italic">AI</span></span>
            <p className="text-sm text-[#4A4A57] leading-relaxed max-w-xs">
              Professional AI background removal. Built for designers, photographers, and e-commerce teams who refuse to compromise.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16">
            <div>
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#4A4A57] mb-4 block">Navigate</span>
              <div className="flex flex-col gap-3">
                <Link href="/" className="text-sm text-[#8B8A97] hover:text-white transition-colors">Home</Link>
                <Link href="/about" className="text-sm text-[#8B8A97] hover:text-white transition-colors">About</Link>
                <Link href="/tool" className="text-sm text-[#8B8A97] hover:text-white transition-colors">Workspace</Link>
              </div>
            </div>
            <div>
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#4A4A57] mb-4 block">Account</span>
              <div className="flex flex-col gap-3">
                <Link href="/login" className="text-sm text-[#8B8A97] hover:text-white transition-colors">Sign In</Link>
                <Link href="/register" className="text-sm text-[#8B8A97] hover:text-white transition-colors">Register</Link>
              </div>
            </div>
          </div>

          {/* Social */}
          <div>
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#4A4A57] mb-4 block">Connect</span>
            <div className="flex gap-4">
              {['X', 'GH', 'LI'].map((label, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full border border-white/[0.06] flex items-center justify-center text-[#4A4A57] text-xs font-mono font-bold hover:text-white hover:border-[#6C63FF]/50 hover:rotate-12 transition-all duration-300"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.3 }}
          className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#4A4A57]">
            © 2026 VCranks AI. Developed by Koushik. All Rights Reserved.
          </p>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#4A4A57]">
            Engineered with precision.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
