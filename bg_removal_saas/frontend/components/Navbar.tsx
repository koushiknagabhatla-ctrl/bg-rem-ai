'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { LogOut, Layers, Sparkles } from 'lucide-react';
import { LiquidButton } from './ui/liquid-glass-button';

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

  // Do not show full navbar on auth routes for clean UX
  if (pathname === '/login' || pathname === '/register') {
    return (
      <header className="absolute top-0 w-full z-50 p-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-black/50 group-hover:bg-white/10 transition-colors">
            <span className="font-bold text-sm text-white">PF</span>
          </div>
          <span className="font-semibold text-lg text-white">PixelForge</span>
        </Link>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40 px-6">
      <div className="flex h-16 items-center justify-between max-w-7xl mx-auto">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div 
             whileHover={{ rotate: 180 }}
             transition={{ duration: 0.5, ease: "easeInOut" }}
             className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20"
          >
            <Sparkles className="w-4 h-4 text-white" />
          </motion.div>
          <span className="font-bold text-xl tracking-tight text-white group-hover:text-indigo-400 transition-colors duration-300">PF AI</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/#hero" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Product</Link>
          <Link href="/#about" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Technology</Link>
          <Link href="/#pricing" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Pricing</Link>
        </nav>

        {/* Auth State */}
        <div className="flex items-center gap-4">
          {!loading && (
            session ? (
              <div className="flex items-center gap-4">
                <Link href="/">
                  <LiquidButton variant="default" size="sm">
                    <Layers className="w-4 h-4 mr-2" /> Workspace
                  </LiquidButton>
                </Link>
                <div className="h-6 w-px bg-white/10" />
                <button onClick={handleSignOut} className="text-sm font-medium text-white/50 hover:text-red-400 transition-colors flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors hidden sm:inline">
                  Log in
                </Link>
                <Link href="/register">
                  <LiquidButton size="sm">Get Started</LiquidButton>
                </Link>
              </div>
            )
          )}
        </div>
        
      </div>
    </header>
  );
}
