'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { LogOut, LayoutGrid, Sparkles, Menu, X } from 'lucide-react';

export function Navbar() {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<any>(undefined);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => { await supabase.auth.signOut(); router.push('/'); };

  // Minimal logo-only on auth pages
  if (pathname === '/login' || pathname === '/register') {
    return (
      <header className="absolute top-0 w-full z-50 px-6 py-5">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-500/20">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-white text-lg tracking-tight">PixelForge</span>
        </Link>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="flex h-14 items-center justify-between max-w-7xl mx-auto px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.4 }}
            className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm shadow-violet-500/20">
            <Sparkles className="w-3 h-3 text-white" />
          </motion.div>
          <span className="font-semibold text-[15px] tracking-tight">PixelForge</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { href: "/#features", label: "Features" },
            { href: "/#pricing", label: "Pricing" },
            { href: "/#about", label: "About" },
          ].map((link) => (
            <Link key={link.href} href={link.href} className="px-3.5 py-1.5 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">{link.label}</Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {!loading && (
            session ? (
              <div className="flex items-center gap-2">
                <Link href="/" className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                  <LayoutGrid className="w-3.5 h-3.5" /> Workspace
                </Link>
                <button onClick={handleSignOut} className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-red-400 transition-colors">
                  <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Sign out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="hidden sm:inline px-3.5 py-1.5 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">Log in</Link>
                <Link href="/register" className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20">
                  Get Started
                </Link>
              </div>
            )
          )}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-1.5 rounded-lg hover:bg-accent transition-colors">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-border/50 bg-background px-6 py-4 space-y-2">
          <Link href="/#features" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-muted-foreground hover:text-foreground">Features</Link>
          <Link href="/#pricing" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-muted-foreground hover:text-foreground">Pricing</Link>
          <Link href="/#about" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-muted-foreground hover:text-foreground">About</Link>
        </motion.div>
      )}
    </header>
  );
}
