'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Mail, Lock, Eye, EyeClosed, ArrowRight } from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { cn } from "@/lib/utils"

export function SignInCard() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setIsLoading(false); }
    else { router.push('/'); }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen w-full bg-[#09090b] relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-b from-violet-600/20 via-violet-900/30 to-transparent" />
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-b-full bg-violet-500/15 blur-[100px]" />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[380px] relative z-10 px-4" style={{ perspective: 1500 }}>
        <motion.div className="relative" style={{ rotateX, rotateY }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
          <div className="relative group">
            {/* Traveling light beams */}
            <div className="absolute -inset-px rounded-2xl overflow-hidden pointer-events-none">
              <motion.div className="absolute top-0 left-0 h-[2px] w-[40%] bg-gradient-to-r from-transparent via-white/60 to-transparent" animate={{ left: ["-40%", "100%"] }} transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatDelay: 2 }} />
              <motion.div className="absolute top-0 right-0 w-[2px] h-[40%] bg-gradient-to-b from-transparent via-white/60 to-transparent" animate={{ top: ["-40%", "100%"] }} transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatDelay: 2, delay: 0.75 }} />
              <motion.div className="absolute bottom-0 right-0 h-[2px] w-[40%] bg-gradient-to-l from-transparent via-white/60 to-transparent" animate={{ right: ["-40%", "100%"] }} transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatDelay: 2, delay: 1.5 }} />
              <motion.div className="absolute bottom-0 left-0 w-[2px] h-[40%] bg-gradient-to-t from-transparent via-white/60 to-transparent" animate={{ bottom: ["-40%", "100%"] }} transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatDelay: 2, delay: 2.25 }} />
            </div>

            <div className="relative bg-[#0f0f12]/80 backdrop-blur-2xl rounded-2xl p-7 border border-white/[0.06] shadow-2xl">
              {/* Header */}
              <div className="text-center mb-7">
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", duration: 0.8 }}
                  className="mx-auto w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/25">
                  <span className="text-base font-bold text-white">PF</span>
                </motion.div>
                <h1 className="text-xl font-semibold text-white">Welcome back</h1>
                <p className="text-[13px] text-white/40 mt-1">Sign in to your PixelForge account</p>
              </div>

              {error && <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/15 text-red-400 text-xs text-center">{error}</div>}

              <form onSubmit={handleEmailSignIn} className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/50">Email</label>
                  <div className="relative">
                    <Mail className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors", focusedInput === "email" ? "text-violet-400" : "text-white/25")} />
                    <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedInput("email")} onBlur={() => setFocusedInput(null)}
                      className="w-full h-10 pl-10 pr-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all" />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/50">Password</label>
                  <div className="relative">
                    <Lock className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors", focusedInput === "password" ? "text-violet-400" : "text-white/25")} />
                    <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedInput("password")} onBlur={() => setFocusedInput(null)}
                      className="w-full h-10 pl-10 pr-10 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                      {showPassword ? <Eye className="w-4 h-4 text-white/30 hover:text-white/60 transition-colors" /> : <EyeClosed className="w-4 h-4 text-white/30 hover:text-white/60 transition-colors" />}
                    </button>
                  </div>
                </div>

                {/* Remember / Forgot */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)}
                      className="w-3.5 h-3.5 rounded border border-white/15 bg-white/[0.04] checked:bg-violet-500 checked:border-violet-500 appearance-none transition-all cursor-pointer" />
                    <span className="text-xs text-white/40">Remember me</span>
                  </label>
                </div>

                {/* Sign in button */}
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={isLoading}
                  className="w-full h-10 rounded-lg bg-white text-[#09090b] font-medium text-sm hover:bg-white/90 transition-all shadow-lg shadow-white/5 flex items-center justify-center gap-1.5 mt-2">
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      </motion.div>
                    ) : (
                      <motion.span key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                        Sign in <ArrowRight className="w-3.5 h-3.5" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-white/[0.06]" />
                  <span className="text-[11px] text-white/25 uppercase tracking-wider">or</span>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>

                {/* Google */}
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="button" onClick={handleGoogleSignIn}
                  className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.07] transition-all flex items-center justify-center gap-2.5">
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  <span className="text-xs text-white/60 font-medium">Continue with Google</span>
                </motion.button>

                <p className="text-center text-xs text-white/30 mt-5">
                  Don&apos;t have an account?{' '}
                  <Link href="/register" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">Sign up</Link>
                </p>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
