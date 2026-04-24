'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Zap } from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase';

export function SignInCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true); setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setIsLoading(false); }
    else { router.push('/'); }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } });
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 section-cream relative">
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="absolute top-6 left-6 z-20">
        <Link href="/" className="flex items-center gap-2 text-ink-muted hover:text-ink text-sm transition-colors duration-300">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm">
        <div className="liquid-glass-card p-8 shadow-xl shadow-ink/[0.03]">
          <div className="flex items-center gap-3 mb-10">
            <span className="text-lg font-serif font-semibold text-ink">VCranks</span>
            <span className="text-lg font-serif italic text-ink-light">AI</span>
          </div>

          <h1 className="text-2xl font-serif font-semibold tracking-tight text-ink mb-2">Welcome back</h1>
          <p className="text-sm text-ink-muted mb-8">Sign in to your studio.</p>

          {error && <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-3 rounded-xl bg-red-50/80 border border-red-200/50 text-red-500 text-xs text-center">{error}</motion.div>}

          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleGoogleSignIn} type="button"
            className="w-full h-12 rounded-xl bg-cream-light text-ink font-medium text-sm flex items-center justify-center gap-3 mb-4 border border-ink/[0.06] hover:bg-cream-dark transition-all duration-300">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </motion.button>

          <div className="flex items-center gap-3 my-6"><div className="flex-1 h-px bg-ink/[0.06]" /><span className="text-[10px] text-ink-muted uppercase tracking-[0.2em]">or email</span><div className="flex-1 h-px bg-ink/[0.06]" /></div>

          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-cream-light border border-ink/[0.06] text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-ink/20 transition-all duration-300" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-cream-light border border-ink/[0.06] text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-ink/20 transition-all duration-300" />
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={isLoading}
              className="w-full h-11 rounded-xl bg-ink text-cream-light font-medium text-sm hover:bg-ink/90 transition-all duration-300 flex items-center justify-center gap-2">
              <AnimatePresence mode="wait">
                {isLoading ? <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><div className="w-4 h-4 border-2 border-cream/20 border-t-cream rounded-full animate-spin" /></motion.div>
                : <motion.span key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">Sign In <ArrowRight className="w-3.5 h-3.5" /></motion.span>}
              </AnimatePresence>
            </motion.button>
          </form>

          <p className="text-xs text-ink-muted mt-8 text-center">By continuing, you agree to our Terms.</p>
          <p className="text-xs text-ink-light mt-4 text-center">No account? <Link href="/register" className="text-ink font-medium underline underline-offset-2">Sign up</Link></p>
        </div>
      </motion.div>
    </div>
  );
}
