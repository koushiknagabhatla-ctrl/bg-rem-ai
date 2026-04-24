'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { NavHeader } from '@/components/ui/nav-header';
import { LiquidButton } from '@/components/ui/liquid-glass-button';

const ease = [0.16, 1, 0.3, 1] as const;

export function Navbar() {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<any>(undefined);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Don't show the sliding pill nav on auth pages
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isToolPage = pathname === '/tool';

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSignOut = async () => { await supabase.auth.signOut(); router.push('/'); };

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.1, ease }}
        className={`fixed top-0 w-full z-50 px-6 md:px-10 py-3 transition-all duration-500 ${
          scrolled 
            ? 'bg-[#0C0806]/80 backdrop-blur-xl border-b border-[#8B5E3C]/10' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1280px] mx-auto grid grid-cols-2 md:grid-cols-3 items-center">
          
          {/* Logo */}
          <div className="flex justify-start">
            <Link href="/" className="group flex items-center gap-1.5 focus:outline-none">
              <span className="font-display text-lg font-bold tracking-tight text-white">VCranks</span>
              <span className="font-display text-lg font-bold italic text-[#C4956A] group-hover:text-[#E8B98A] transition-colors duration-300">AI</span>
            </Link>
          </div>

          {/* Center Nav — only on landing page */}
          <div className="hidden md:flex justify-center">
            {!isAuthPage && (
              <NavHeader session={session} handleSignOut={handleSignOut} />
            )}
          </div>

          {/* Right Auth */}
          <div className="hidden md:flex justify-end items-center gap-6">
            {session === undefined ? (
              <div className="w-20 h-8 rounded-full bg-[#1A0E08] animate-pulse" />
            ) : !session ? (
              <>
                <Link href="/login" className="text-[11px] font-semibold tracking-widest uppercase text-[#BFA899] hover:text-white transition-colors duration-300">Sign In</Link>
                <LiquidButton size="lg" asChild>
                  <Link href="/register">Get Started</Link>
                </LiquidButton>
              </>
            ) : (
              <div className="flex items-center gap-4">
                {!isToolPage && (
                  <LiquidButton size="sm" asChild>
                    <Link href="/tool">Studio</Link>
                  </LiquidButton>
                )}
                <button onClick={handleSignOut} className="text-[11px] font-semibold tracking-widest uppercase text-[#BFA899] hover:text-red-400 transition-colors duration-300">
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex justify-end">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="w-9 h-9 flex items-center justify-center text-[#BFA899] hover:text-white transition-colors">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </motion.header>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-[#0C0806]/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8"
          >
            {[{ href: '/', label: 'Home' }, { href: '#about', label: 'About' }, { href: session ? '/tool' : '/login', label: 'Workspace' }].map((link, i) => (
              <motion.div key={link.href} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                transition={{ delay: i * 0.08, duration: 0.5, ease }}>
                <Link href={link.href} onClick={() => setMobileOpen(false)} className="text-3xl font-display font-bold text-white hover:text-[#C4956A] transition-colors">{link.label}</Link>
              </motion.div>
            ))}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="flex flex-col gap-4 mt-8 w-full max-w-[200px]">
              {!session ? (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="glass3d px-8 py-3 border border-[#8B5E3C]/20 rounded-full text-center text-sm font-semibold text-white">Sign In</Link>
                  <LiquidButton size="xl" asChild onClick={() => setMobileOpen(false)}>
                    <Link href="/register">Get Started</Link>
                  </LiquidButton>
                </>
              ) : (
                <button onClick={() => { handleSignOut(); setMobileOpen(false); }} className="glass3d px-8 py-3 border border-[#8B5E3C]/20 rounded-full text-sm font-semibold text-white">Sign Out</button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
