'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { MagneticWrapper } from '@/components/ui/MagneticWrapper';

export function Navbar() {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<any>(undefined);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const links = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: session ? '/tool' : '/login', label: 'Workspace' },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 w-full z-50 px-6 md:px-10 py-4 liquid-glass-nav ${scrolled ? 'scrolled' : ''}`}
      >
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-1.5">
            <span className="font-display text-lg font-bold tracking-tight text-white">VCranks</span>
            <span className="font-display text-lg font-bold italic text-[#6C63FF] group-hover:text-[#00E5C3] transition-colors duration-300">AI</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] px-2 py-1.5 rounded-full backdrop-blur-md">
            {links.map(link => (
              <MagneticWrapper key={link.href} strength={0.15}>
                <Link
                  href={link.href}
                  className={`relative px-5 py-2 text-xs font-semibold tracking-[0.08em] uppercase transition-colors duration-300 rounded-full ${
                    pathname === link.href
                      ? 'text-white bg-white/[0.08]'
                      : 'text-[#8B8A97] hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              </MagneticWrapper>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            {!session ? (
              <>
                <MagneticWrapper>
                  <Link href="/login" className="text-xs font-semibold tracking-[0.08em] uppercase text-[#8B8A97] hover:text-white transition-colors duration-300 px-4 py-2">
                    Sign In
                  </Link>
                </MagneticWrapper>
                <MagneticWrapper>
                  <Link href="/register" className="px-6 py-2.5 rounded-full bg-[#6C63FF] text-white text-xs font-bold tracking-[0.08em] uppercase hover:bg-[#5B54E6] transition-all duration-300 shadow-[0_0_20px_rgba(108,99,255,0.3)]">
                    Get Started
                  </Link>
                </MagneticWrapper>
              </>
            ) : (
              <MagneticWrapper>
                <button onClick={handleSignOut} className="text-xs font-semibold tracking-[0.08em] uppercase text-[#8B8A97] hover:text-red-400 transition-colors duration-300 px-4 py-2">
                  Sign Out
                </button>
              </MagneticWrapper>
            )}
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden w-9 h-9 flex items-center justify-center text-white/60 hover:text-white transition-colors">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-[#0A0A0F]/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8"
          >
            {links.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-3xl font-display font-bold text-white hover:text-[#6C63FF] transition-colors"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-col gap-4 mt-8"
            >
              {!session ? (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="px-8 py-3 border border-white/10 rounded-full text-center text-sm font-semibold text-white">Sign In</Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="px-8 py-3 bg-[#6C63FF] rounded-full text-center text-sm font-bold text-white">Get Started</Link>
                </>
              ) : (
                <button onClick={() => { handleSignOut(); setMobileOpen(false); }} className="px-8 py-3 border border-white/10 rounded-full text-sm font-semibold text-white">Sign Out</button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
