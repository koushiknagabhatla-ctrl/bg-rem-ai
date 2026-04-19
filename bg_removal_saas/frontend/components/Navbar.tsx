'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Home, Info, Wrench, Zap } from 'lucide-react';

export function Navbar() {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<any>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => { await supabase.auth.signOut(); router.push('/'); };

  const navLinks = [
    { href: '/', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { href: '/about', label: 'About', icon: <Info className="w-4 h-4" /> },
    { href: '/', label: 'Tools', icon: <Wrench className="w-4 h-4" /> },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 w-full z-50 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-shadow">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-[15px] tracking-tight text-white">VCranks AI</span>
        </Link>

        {/* Center pill nav */}
        <nav className="hidden md:flex items-center bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-full px-1.5 py-1.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href === '/about' && pathname === '/about');
            return (
              <Link key={link.label} href={link.href}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-white/[0.1] text-white shadow-sm'
                    : 'text-white/40 hover:text-white/70'
                }`}>
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {!loading && (
            session ? (
              <button onClick={handleSignOut}
                className="px-5 py-2 rounded-full border border-white/[0.1] text-white text-[13px] font-medium hover:bg-white/[0.05] transition-all">
                Sign Out
              </button>
            ) : (
              <Link href="/login"
                className="px-5 py-2 rounded-full bg-white text-black text-[13px] font-semibold hover:bg-white/90 transition-all shadow-lg shadow-white/10">
                Sign In
              </Link>
            )
          )}
        </div>
      </div>
    </motion.header>
  );
}
