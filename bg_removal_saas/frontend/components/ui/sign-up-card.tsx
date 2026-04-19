'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Mail, Lock, Eye, EyeClosed, ArrowRight, User } from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export function SignUpCard() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleGoogleSignUp = async () => {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name }
      }
    });

    if (error) {
      setErrorMsg(error.message);
      setIsLoading(false);
    } else {
      router.push("/login?registered=true");
    }
  };

  return (
    <div className="min-h-screen w-screen relative overflow-hidden flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-sm relative z-10"
        style={{ perspective: 1500 }}
      >
        <motion.div
          className="relative"
          style={{ rotateX, rotateY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileHover={{ z: 10 }}
        >
          <div className="relative group">
            <div className="relative bg-[#010201]/60 backdrop-blur-3xl rounded-2xl p-8 border border-white/10 shadow-2xl overflow-hidden">
              <div className="text-center space-y-1 mb-6">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", duration: 0.8 }}
                  className="mx-auto w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-black/50"
                >
                  <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white via-white/80 to-white/30">PF</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-white tracking-tight mt-4"
                >
                  Create Account
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/50 text-sm"
                >
                  Get 50 free credits to start generating
                </motion.p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center font-medium">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-3">
                  <div className="relative flex items-center overflow-hidden rounded-lg">
                    <User className={`absolute left-3 w-4 h-4 transition-all duration-300 ${focusedInput === "name" ? 'text-white' : 'text-white/40'}`} />
                    <Input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      required
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setFocusedInput("name")}
                      onBlur={() => setFocusedInput(null)}
                      className="w-full py-5 bg-white/5 border-white/5 focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-3 focus:bg-white/10"
                    />
                  </div>

                  <div className="relative flex items-center overflow-hidden rounded-lg">
                    <Mail className={`absolute left-3 w-4 h-4 transition-all duration-300 ${focusedInput === "email" ? 'text-white' : 'text-white/40'}`} />
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      required
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedInput("email")}
                      onBlur={() => setFocusedInput(null)}
                      className="w-full py-5 bg-white/5 border-white/5 focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-3 focus:bg-white/10"
                    />
                  </div>

                  <div className="relative flex items-center overflow-hidden rounded-lg">
                    <Lock className={`absolute left-3 w-4 h-4 transition-all duration-300 ${focusedInput === "password" ? 'text-white' : 'text-white/40'}`} />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create Password"
                      value={password}
                      required
                      minLength={6}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedInput("password")}
                      onBlur={() => setFocusedInput(null)}
                      className="w-full py-5 bg-white/5 border-white/5 focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-10 focus:bg-white/10"
                    />
                    <div onClick={() => setShowPassword(!showPassword)} className="absolute right-3 cursor-pointer p-1">
                      {showPassword ? <Eye className="w-4 h-4 text-white/40 hover:text-white" /> : <EyeClosed className="w-4 h-4 text-white/40 hover:text-white" />}
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-6 bg-white text-black font-semibold h-11 rounded-lg transition-all duration-300 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:bg-white/90"
                >
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-black/80 border-t-transparent rounded-full animate-spin" />
                      </motion.div>
                    ) : (
                      <motion.span key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-2">
                        Create Account <ArrowRight className="w-4 h-4 translate-x-0" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                <div className="relative mt-4 mb-4 flex items-center">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="mx-3 text-xs text-white/30 font-medium tracking-wide">OR</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleGoogleSignUp}
                  className="w-full relative overflow-hidden bg-white/5 text-white font-medium h-11 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  <span className="text-sm font-medium">Continue with Google</span>
                </motion.button>

                <p className="text-center text-xs text-white/50 mt-6 font-medium">
                  Already have an account?{' '}
                  <Link href="/login" className="text-white hover:text-white/80 transition-colors border-b border-white/30 hover:border-white pb-0.5 ml-1">
                    Sign in
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
