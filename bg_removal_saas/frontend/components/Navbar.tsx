'use client';
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

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
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSignOut = async () => { await supabase.auth.signOut(); router.push('/'); };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 w-full z-50 px-6 md:px-10 py-4 ${scrolled ? 'liquid-glass-nav scrolled' : 'liquid-glass-nav'}`}
      >
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group">
            <span className="text-lg font-serif font-semibold tracking-tight text-ink">VCranks</span>
            <span className="text-lg font-serif font-semibold italic text-ink-light ml-1">AI</span>
          </Link>

          {/* Center nav */}
          <nav
            className="hidden md:flex items-center relative liquid-glass rounded-full px-1 py-1"
            onMouseLeave={() => setCursorPos(pv => ({ ...pv, opacity: 0 }))}
          >
            {navLinks.map((link) => (
              <NavTab key={link.label} href={link.href} isActive={pathname === link.href} setCursorPos={setCursorPos}>
                {link.label}
              </NavTab>
            ))}
            <motion.div
              animate={cursorPos}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              className="absolute z-0 h-8 rounded-full bg-[#1a1a1a]/[0.06]"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            />
          </nav>

          {/* Right */}
          <div className="flex items-center gap-4">
            {!loading && (
              session ? (
                <button onClick={handleSignOut}
                  className="hidden md:block text-sm text-ink-light hover:text-ink transition-colors duration-300">
                  Sign Out
                </button>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/login" className="text-sm text-ink-light hover:text-ink transition-colors duration-300">Sign In</Link>
                  <Link href="/register"
                    className="rolling-btn px-5 py-2.5 rounded-full bg-ink text-cream-light text-sm font-medium">
                    <span className="rolling-text">Get Started</span>
                    <span className="rolling-text-clone">Get Started</span>
                  </Link>
                </div>
              )
            )}
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center text-ink-light hover:text-ink transition-colors">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile */}
      {mobileOpen && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="fixed inset-x-0 top-[56px] z-40 p-4 md:hidden">
          <div className="liquid-glass rounded-2xl p-4 space-y-1 shadow-lg">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-medium text-ink-light hover:text-ink hover:bg-ink/[0.03] transition-all">
                {link.label}
              </Link>
            ))}
            <div className="h-px bg-ink/[0.06] my-2" />
            {!loading && !session && (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-ink-light">Sign In</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-center bg-ink text-cream-light">Get Started</Link>
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
      className={`relative z-10 px-5 py-2 rounded-full text-[13px] font-medium transition-colors duration-300 ${isActive ? 'text-ink' : 'text-ink-light hover:text-ink'}`}>
      {children}
    </Link>
  );
}
