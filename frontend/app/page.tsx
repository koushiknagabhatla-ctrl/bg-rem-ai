"use client";

import { useCallback, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { useCredits } from "@/hooks/useCredits";
import AuthPanel from "@/components/AuthPanel";
import CreditDisplay from "@/components/CreditDisplay";
import DropZone from "@/components/DropZone";
import ComparisonSlider from "@/components/ComparisonSlider";
import DownloadButton from "@/components/DownloadButton";
import type { User } from "@supabase/supabase-js";

export default function HomePage() {
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processingTime, setProcessingTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { credits, updateAfterRemoval, refetch } = useCredits();

  // ── Auth state ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session) {
        setShowAuth(false);
        refetch();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, refetch]);

  // ── File select ──
  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setResultUrl(null);
    setProcessingTime(null);
    setError(null);
  }, []);

  // ── Process image ──
  const handleProcess = useCallback(async () => {
    if (!file) return;

    if (!user) {
      setShowAuth(true);
      return;
    }

    if (credits && !credits.is_admin && credits.credits_left < 5) {
      setError(
        `You need 5 credits but have ${credits.credits_left}. Upgrade your plan.`
      );
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setShowAuth(true);
        setProcessing(false);
        return;
      }

      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/remove-bg", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.error || errData.detail || `Processing failed (${res.status})`
        );
      }

      const timeMs = res.headers.get("X-Processing-Time-Ms");
      if (timeMs) setProcessingTime(`${timeMs}ms`);

      const creditsLeft = res.headers.get("X-Credits-Remaining");
      if (creditsLeft) {
        updateAfterRemoval(parseInt(creditsLeft, 10));
      }

      const blob = await res.blob();
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setProcessing(false);
    }
  }, [file, user, credits, supabase, updateAfterRemoval]);

  // ── Reset ──
  const handleReset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
    setProcessingTime(null);
    setError(null);
  }, [previewUrl, resultUrl]);

  // ── Sign out ──
  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    handleReset();
  }, [supabase, handleReset]);

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-500" />
      </div>
    );
  }

  return (
    <>
      {/* ── Background ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/2 top-[-30%] h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-indigo-600/[0.06] blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* ── Header ── */}
      <header className="relative z-10 border-b border-white/[0.05] bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">✂️</span>
            <span className="text-lg font-extrabold tracking-tight text-white">
              BG Remover
            </span>
            <span className="rounded bg-gradient-to-r from-indigo-600 to-purple-600 px-1.5 py-0.5 text-[10px] font-bold tracking-widest text-white">
              AI
            </span>
          </div>

          <div className="flex items-center gap-4">
            {user && credits && (
              <CreditDisplay
                creditsLeft={credits.credits_left}
                isAdmin={credits.is_admin}
              />
            )}

            {user ? (
              <div className="flex items-center gap-3">
                <span className="hidden text-sm text-zinc-500 sm:inline">
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-white/20 hover:text-white"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:from-indigo-500 hover:to-purple-500"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="relative z-[1] mx-auto max-w-3xl px-6 pb-16 pt-14">
        {/* Hero */}
        <div className="animate-fade-in mb-12 text-center">
          <h1 className="mb-4 text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl">
            Remove Backgrounds
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              In One Click
            </span>
          </h1>
          <p className="text-base leading-relaxed text-zinc-400">
            Custom MobileNetV3 neural network, trained from scratch.
            <br />
            Upload your image and get a transparent PNG in seconds.
          </p>
        </div>

        {/* ── Upload / Preview / Result ── */}
        {!previewUrl ? (
          <div className="animate-fade-in-delay">
            <DropZone onFileSelect={handleFileSelect} disabled={processing} />
          </div>
        ) : (
          <div className="animate-fade-in space-y-6">
            {/* Comparison or Preview */}
            {resultUrl ? (
              <ComparisonSlider
                originalUrl={previewUrl}
                resultUrl={resultUrl}
              />
            ) : (
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111118]">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="block h-auto max-h-[500px] w-full object-contain"
                />
                {processing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-[3px] border-indigo-500/20 border-t-indigo-500" />
                    <p className="animate-pulse text-sm font-medium text-indigo-300">
                      Removing background...
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {!resultUrl ? (
                <>
                  <button
                    onClick={handleProcess}
                    disabled={processing}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:shadow-none"
                  >
                    {processing ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Processing...
                      </>
                    ) : (
                      <>✂️ Remove Background</>
                    )}
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={processing}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3.5 text-sm text-zinc-400 transition-colors hover:border-white/20 hover:text-white disabled:opacity-50"
                  >
                    Change Image
                  </button>
                </>
              ) : (
                <>
                  <DownloadButton
                    resultUrl={resultUrl}
                    fileName={file?.name || "image.png"}
                  />
                  <button
                    onClick={handleReset}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3.5 text-sm text-zinc-400 transition-colors hover:border-white/20 hover:text-white"
                  >
                    Process Another
                  </button>
                </>
              )}
            </div>

            {/* Processing time */}
            {processingTime && (
              <p className="text-center text-xs text-zinc-600">
                Processed in {processingTime}
              </p>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-5 py-4 text-center text-sm text-red-300">
            ⚠️ {error}
          </div>
        )}

        {/* Features */}
        <div className="animate-fade-in-delay-2 mt-20 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            {
              icon: "🧠",
              title: "Custom AI",
              desc: "Trained from scratch, no API deps",
            },
            {
              icon: "⚡",
              title: "Fast CPU",
              desc: "INT8 ONNX, <300ms inference",
            },
            {
              icon: "🔒",
              title: "Secure",
              desc: "HMAC signatures, 7-layer auth",
            },
            {
              icon: "🎨",
              title: "Clean Edges",
              desc: "Morphological post-processing",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5 text-center transition-colors hover:border-white/[0.1] hover:bg-white/[0.04]"
            >
              <span className="mb-2 block text-2xl">{f.icon}</span>
              <h3 className="mb-1 text-sm font-bold text-zinc-200">
                {f.title}
              </h3>
              <p className="text-xs leading-snug text-zinc-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-[1] border-t border-white/[0.04] py-8 text-center">
        <p className="text-xs text-zinc-600">
          Built from scratch with MobileNetV3 + CBAM Attention. No pretrained
          weights.
        </p>
      </footer>

      {/* Auth Modal */}
      {showAuth && !user && (
        <AuthPanel onClose={() => setShowAuth(false)} />
      )}
    </>
  );
}
