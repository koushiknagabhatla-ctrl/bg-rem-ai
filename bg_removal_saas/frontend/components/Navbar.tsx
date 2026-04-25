'use client';
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Wand2 } from 'lucide-react';

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

  const handleToolClick = () => {
    if (session) router.push('/tool');    // Signed in → go to workspace page
    else router.push('/login');            // Not signed in → go to sign in
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        className={`fixed top-0 w-full z-50 px-6 md:px-10 py-3.5 transition-all duration-500 ${
          scrolled
            ? 'liquid-glass-nav scrolled'
            : 'liquid-glass-nav'
        }`}
      >
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-1">
            <span className="text-lg font-serif font-semibold tracking-tight text-white">VCrancks</span>
            <span className="text-lg font-serif font-semibold italic text-white/40 group-hover:text-white/70 transition-colors duration-300">AI</span>
          </Link>

          {/* Center nav — liquid glass pill */}
          <nav
            className="hidden md:flex items-center relative liquid-glass rounded-full px-1 py-1"
            onMouseLeave={() => setCursorPos(pv => ({ ...pv, opacity: 0 }))}
          >
            {navLinks.map((link) => (
              <NavTab key={link.label} href={link.href} isActive={pathname === link.href} setCursorPos={setCursorPos}>
                {link.label}
              </NavTab>
            ))}
            
            {/* Tool button inside nav pill */}
            <button
              onClick={handleToolClick}
              data-nav-tool
              data-mascot="excited"
              onMouseEnter={() => {
                const el = document.querySelector('[data-nav-tool]');
                if (el) {
                  const rect = el.getBoundingClientRect();
                  const parent = el.parentElement;
                  if (parent) {
                    setCursorPos({ width: rect.width, opacity: 1, left: (el as HTMLElement).offsetLeft });
                  }
                }
              }}
              className="relative z-10 px-5 py-2 rounded-full text-[13px] font-medium text-ink/40 hover:text-ink transition-colors duration-300 flex items-center gap-1.5"
            >
              <Wand2 className="w-3.5 h-3.5" />
              Tool
            </button>

            {/* Animated cursor pill */}
            <motion.div
              animate={cursorPos}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              className="absolute z-0 h-8 rounded-full bg-ink/[0.05]"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            />
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {!loading && (
              session ? (
                <button
                  onClick={handleSignOut}
                  data-signout
                  data-mascot="crying"
                  className="hidden md:block text-sm text-white/40 hover:text-white transition-colors duration-300"
                >
                  Sign Out
                </button>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/login" data-mascot="excited"
                    className="text-sm text-white/40 hover:text-white transition-colors duration-300">
                    Sign In
                  </Link>
                  <Link href="/register" data-mascot="excited"
                    className="group relative overflow-hidden px-5 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors duration-300">
                    Get Started
                  </Link>
                </div>
              )
            )}
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center text-white/50 hover:text-white transition-colors">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 top-[54px] z-40 p-4 md:hidden"
          >
            <div className="liquid-glass rounded-2xl p-3 space-y-0.5 shadow-xl shadow-ink/5">
              {navLinks.map((link) => (
                <Link key={link.label} href={link.href} onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-medium text-ink/50 hover:text-ink hover:bg-ink/[0.03] transition-all duration-300">
                  {link.label}
                </Link>
              ))}
              <button onClick={() => { setMobileOpen(false); handleToolClick(); }}
                className="block w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-ink/50 hover:text-ink hover:bg-ink/[0.03] transition-all duration-300">
                Tool
              </button>
              <div className="h-px bg-ink/[0.05] my-1" />
              {!loading && !session && (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-ink/50">Sign In</Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-center bg-ink text-cream-light">Get Started</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavTab({ children, href, isActive, setCursorPos }: {
  children: React.ReactNode; href: string; isActive: boolean; setCursorPos: (pos: any) => void;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  return (
    <Link ref={ref} href={href}
      data-mascot="excited"
      onMouseEnter={() => {
        if (!ref.current) return;
        const { width } = ref.current.getBoundingClientRect();
        setCursorPos({ width, opacity: 1, left: ref.current.offsetLeft });
      }}
      className={`relative z-10 px-5 py-2 rounded-full text-[13px] font-medium transition-colors duration-300 ${isActive ? 'text-ink' : 'text-ink/40 hover:text-ink'}`}>
      {children}
    </Link>
  );
}
