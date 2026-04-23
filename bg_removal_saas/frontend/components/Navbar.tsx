'use client';
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Info, CreditCard, Wrench, Zap, Menu, X } from 'lucide-react';
import { LiquidButton, GlassFilter } from '@/components/ui/liquid-glass-button';

export function Navbar() {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<any>(undefined);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Animated cursor state
  const [cursorPos, setCursorPos] = useState({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSignOut = async () => { await supabase.auth.signOut(); router.push('/'); };

  const navLinks = [
    { href: '/', label: 'Home', icon: <Home className="w-3.5 h-3.5" /> },
    { href: '/about', label: 'About', icon: <Info className="w-3.5 h-3.5" /> },
    { href: '/#pricing', label: 'Pricing', icon: <CreditCard className="w-3.5 h-3.5" /> },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 w-full z-50 px-4 md:px-6 py-3 transition-all duration-400 ${scrolled ? 'liquid-glass-nav scrolled' : 'liquid-glass-nav'}`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-all duration-300 group-hover:scale-105">
              <Zap className="w-4 h-4 text-white" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-bold text-[15px] tracking-tight text-white font-display">VCranks AI</span>
          </Link>

          {/* Center pill nav with animated cursor */}
          <nav
            className="hidden md:flex items-center relative rounded-full px-1.5 py-1.5 liquid-glass-strong"
            onMouseLeave={() => setCursorPos(pv => ({ ...pv, opacity: 0 }))}
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href === '/about' && pathname === '/about');
              return (
                <NavTab
                  key={link.label}
                  href={link.href}
                  isActive={isActive}
                  setCursorPos={setCursorPos}
                >
                  {link.icon}
                  {link.label}
                </NavTab>
              );
            })}
            {/* Animated cursor pill */}
            <motion.div
              animate={cursorPos}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="absolute z-0 h-8 rounded-full bg-white/[0.08] md:h-9"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            />
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {!loading && (
              session ? (
                <div className="hidden md:flex items-center gap-3">
                  <Link href="/" className="px-4 py-2 rounded-full text-white/60 text-[13px] font-medium hover:text-white transition-colors flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5" /> Studio
                  </Link>
                  <button onClick={handleSignOut}
                    className="px-5 py-2 rounded-full border border-white/[0.08] text-white/70 text-[13px] font-medium hover:bg-white/[0.05] hover:text-white transition-all">
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-3">
                  <Link href="/login"
                    className="px-5 py-2 rounded-full text-white/60 text-[13px] font-medium hover:text-white transition-colors">
                    Sign In
                  </Link>
                  <Link href="/register"
                    className="relative px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-[13px] font-semibold hover:from-violet-500 hover:to-cyan-500 transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:scale-[1.02] active:scale-[0.98]">
                    Get Started
                  </Link>
                </div>
              )
            )}
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 rounded-xl liquid-glass flex items-center justify-center text-white/60 hover:text-white transition-colors"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 top-[60px] z-40 p-4 md:hidden"
          >
            <div className="liquid-glass-strong rounded-2xl p-4 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.label} href={link.href} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.05] transition-all">
                  {link.icon}
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-white/[0.06] my-2" />
              {!loading && (
                session ? (
                  <>
                    <Link href="/" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.05] transition-all">
                      <Wrench className="w-3.5 h-3.5" /> Studio
                    </Link>
                    <button onClick={() => { handleSignOut(); setMobileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.05] transition-all text-left">
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.05] transition-all">
                      Sign In
                    </Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-cyan-600 text-white">
                      Get Started Free
                    </Link>
                  </>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <GlassFilter />
    </>
  );
}

/* ─── Nav Tab with cursor tracking ─── */
function NavTab({ children, href, isActive, setCursorPos }: {
  children: React.ReactNode;
  href: string;
  isActive: boolean;
  setCursorPos: (pos: any) => void;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  return (
    <Link
      ref={ref}
      href={href}
      onMouseEnter={() => {
        if (!ref.current) return;
        const { width } = ref.current.getBoundingClientRect();
        setCursorPos({ width, opacity: 1, left: ref.current.offsetLeft });
      }}
      className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-300 ${
        isActive
          ? 'text-white'
          : 'text-white/40 hover:text-white/80'
      }`}
    >
      {children}
    </Link>
  );
}
