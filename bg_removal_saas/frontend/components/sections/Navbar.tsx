'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { NavHeader } from '@/components/ui/nav-header';

export function Navbar() {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();
  const [session, setSession] = useState<any>(undefined);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 w-full z-50 px-6 md:px-10 py-4 transition-all duration-500 ${scrolled ? 'nav-glass py-3' : 'bg-transparent'}`}
      >
        <div className="max-w-[1280px] mx-auto grid grid-cols-2 md:grid-cols-3 items-center">
          
          {/* Logo (Left, 1/3) */}
          <div className="flex justify-start">
            <Link href="/" className="group flex items-center gap-1.5 focus:outline-none">
              <span className="font-display text-lg font-bold tracking-tight text-white">VCranks</span>
              <span className="font-display text-lg font-bold italic text-[#C4956A] group-hover:text-[#E8B98A] transition-colors duration-300">AI</span>
            </Link>
          </div>

          {/* User's Custom NavHeader (Center, 1/3) */}
          <div className="hidden md:flex justify-center">
             <NavHeader session={session} handleSignOut={handleSignOut} />
          </div>

          {/* Desktop Auth (Right, 1/3) */}
          <div className="hidden md:flex justify-end items-center gap-6 line-clamp-1">
            {!session ? (
              <>
                <Link href="/login" className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-[#BFA899] hover:text-white transition-colors duration-300">Sign In</Link>
                <Link href="/register" className="glass3d px-6 py-2.5 rounded-full border border-[#8B5E3C]/30 text-white text-[10px] font-bold tracking-widest uppercase hover:bg-[#8B5E3C]/20 transition-all duration-300 shadow-[0_0_15px_rgba(139,94,60,0.15)] flex-shrink-0">
                  Get Started
                </Link>
              </>
            ) : (
              <button onClick={handleSignOut} className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-[#BFA899] hover:text-[#E85B5B] transition-colors duration-300">
                Sign Out
              </button>
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
            {[{ href: '/', label: 'Home' }, { href: '/about', label: 'About' }, { href: session ? '/tool' : '/login', label: 'Workspace' }].map((link, i) => (
              <motion.div key={link.href} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
                <Link href={link.href} onClick={() => setMobileOpen(false)} className="text-3xl font-display font-bold text-white hover:text-[#C4956A] transition-colors">{link.label}</Link>
              </motion.div>
            ))}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="flex flex-col gap-4 mt-8 w-full max-w-[200px]">
              {!session ? (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="glass3d px-8 py-3 border border-[#8B5E3C]/20 rounded-full text-center text-sm font-semibold text-white">Sign In</Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="px-8 py-3 bg-gradient-to-r from-[#8B5E3C] to-[#C4956A] rounded-full text-center text-sm font-bold text-white shadow-lg shadow-[#8B5E3C]/20">Get Started</Link>
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
