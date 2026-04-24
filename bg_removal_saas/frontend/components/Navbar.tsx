'use client';
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Zap, Menu, X } from 'lucide-react';

export function Navbar() {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<any>(undefined);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/#pricing', label: 'Pricing' },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 w-full z-50 px-4 md:px-6 py-3 ${scrolled ? 'liquid-glass-nav scrolled' : 'liquid-glass-nav'}`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[15px] tracking-tight text-black">VCranks AI</span>
          </Link>

          {/* Center nav — liquid glass pill */}
          <nav
            className="hidden md:flex items-center relative liquid-glass rounded-full px-1.5 py-1.5"
            onMouseLeave={() => setCursorPos(pv => ({ ...pv, opacity: 0 }))}
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href === '/about' && pathname === '/about');
              return (
                <NavTab key={link.label} href={link.href} isActive={isActive} setCursorPos={setCursorPos}>
                  {link.label}
                </NavTab>
              );
            })}
            {/* Animated cursor */}
            <motion.div
              animate={cursorPos}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="absolute z-0 h-8 rounded-full bg-black/[0.05]"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            />
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {!loading && (
              session ? (
                <div className="hidden md:flex items-center gap-3">
                  <button onClick={handleSignOut}
                    className="px-5 py-2 rounded-full text-sm font-medium text-gray-500 hover:text-black transition-colors">
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/login"
                    className="px-5 py-2 rounded-full text-sm font-medium text-gray-500 hover:text-black transition-colors">
                    Sign In
                  </Link>
                  <Link href="/register"
                    className="px-5 py-2.5 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors">
                    Get Started
                  </Link>
                </div>
              )
            )}
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-black transition-colors">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          className="fixed inset-x-0 top-[56px] z-40 p-4 md:hidden">
          <div className="liquid-glass rounded-2xl p-4 space-y-1 shadow-lg">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:text-black hover:bg-black/[0.03] transition-all">
                {link.label}
              </Link>
            ))}
            <div className="h-px bg-black/[0.06] my-2" />
            {!loading && !session && (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-600">Sign In</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-center bg-black text-white">Get Started</Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
}

function NavTab({ children, href, isActive, setCursorPos }: {
  children: React.ReactNode; href: string; isActive: boolean; setCursorPos: (pos: any) => void;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  return (
    <Link ref={ref} href={href}
      onMouseEnter={() => {
        if (!ref.current) return;
        const { width } = ref.current.getBoundingClientRect();
        setCursorPos({ width, opacity: 1, left: ref.current.offsetLeft });
      }}
      className={`relative z-10 px-4 py-2 rounded-full text-sm font-medium transition-colors ${isActive ? 'text-black' : 'text-gray-400 hover:text-gray-700'}`}>
      {children}
    </Link>
  );
}
