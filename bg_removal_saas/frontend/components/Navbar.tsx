'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { LogOut, Layers, Sparkles } from 'lucide-react';

export function Navbar() {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<any>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Hide navbar on auth pages for clean UX
  if (pathname === '/login' || pathname === '/register') {
    return (
      <header className="absolute top-0 w-full z-50 p-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/30 to-indigo-500/30 border border-white/10 flex items-center justify-center group-hover:from-purple-500/50 group-hover:to-indigo-500/50 transition-all">
            <Sparkles className="w-4 h-4 text-white/80" />
          </div>
          <span className="font-semibold text-lg text-white">PixelForge</span>
        </Link>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.04] bg-black/60 backdrop-blur-2xl">
      <div className="flex h-16 items-center justify-between max-w-7xl mx-auto px-6">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div 
             whileHover={{ rotate: 180 }}
             transition={{ duration: 0.5, ease: "easeInOut" }}
             className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20"
          >
            <Sparkles className="w-4 h-4 text-white" />
          </motion.div>
          <span className="font-bold text-xl tracking-tight text-white group-hover:text-purple-300 transition-colors duration-300">PixelForge</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/#hero" className="text-sm font-medium text-white/50 hover:text-white transition-colors duration-200">Product</Link>
          <Link href="/#about" className="text-sm font-medium text-white/50 hover:text-white transition-colors duration-200">Technology</Link>
          <Link href="/#pricing" className="text-sm font-medium text-white/50 hover:text-white transition-colors duration-200">Pricing</Link>
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-4">
          {!loading && (
            session ? (
              <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-white transition-all duration-200">
                  <Layers className="w-4 h-4" /> Workspace
                </Link>
                <div className="h-6 w-px bg-white/10" />
                <button onClick={handleSignOut} className="text-sm font-medium text-white/40 hover:text-red-400 transition-colors flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-sm font-medium text-white/60 hover:text-white transition-colors hidden sm:inline">Log in</Link>
                <Link href="/register" className="px-5 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-all shadow-lg shadow-white/10">
                  Get Started
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </header>
  );
}
