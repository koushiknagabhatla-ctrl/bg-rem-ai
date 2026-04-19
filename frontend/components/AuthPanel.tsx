"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

interface AuthPanelProps {
  onClose: () => void;
}

export default function AuthPanel({ onClose }: AuthPanelProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = createSupabaseBrowserClient();

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "OAuth failed";
      setMessage(msg);
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setMessage("Check your email for the login link!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send link";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-[400px] max-w-[92vw] rounded-2xl border border-white/[0.08] bg-[#13131d] p-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-2xl text-zinc-500 transition-colors hover:text-white"
          aria-label="Close"
        >
          &times;
        </button>

        <h2 className="mb-1 text-center text-2xl font-extrabold text-white">
          Sign In
        </h2>
        <p className="mb-8 text-center text-sm text-zinc-400">
          Get <span className="font-semibold text-indigo-400">50 free credits</span> to start
        </p>

        {/* Google OAuth */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-zinc-200 transition-all hover:border-white/20 hover:bg-white/[0.08] disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
            />
            <path
              fill="#34A853"
              d="M9.003 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9.003 18z"
            />
            <path
              fill="#FBBC05"
              d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
            />
            <path
              fill="#EA4335"
              d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.002 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29c.708-2.127 2.692-3.71 5.036-3.71z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/[0.06]" />
          <span className="text-xs text-zinc-500">or</span>
          <div className="h-px flex-1 bg-white/[0.06]" />
        </div>

        {/* Magic Link */}
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleMagicLink()}
          className="mb-3 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-200 outline-none transition-colors placeholder:text-zinc-600 focus:border-indigo-500/50"
        />
        <button
          onClick={handleMagicLink}
          disabled={loading || !email.trim()}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Magic Link"}
        </button>

        {message && (
          <p
            className={`mt-4 text-center text-sm ${
              message.includes("Check your email")
                ? "text-emerald-400"
                : "text-red-400"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
