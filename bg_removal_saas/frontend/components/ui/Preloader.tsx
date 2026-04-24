'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Preloader({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);
  // Match Oryzo's loading text vibe
  const words = ['MAPPING', 'CALIBRATING', 'RENDERING', 'READY'];

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const prog = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(prog);
          setTimeout(() => {
            setLoading(false);
            document.body.style.overflow = '';
          }, 400);
          return 100;
        }
        return Math.min(p + Math.floor(Math.random() * 12) + 3, 100);
      });
    }, 80);

    const word = setInterval(() => {
      setWordIdx(i => (i < words.length - 1 ? i + 1 : i));
    }, 300);

    return () => {
      clearInterval(prog);
      clearInterval(word);
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            key="preloader"
            exit={{ y: '-100%' }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[99999] bg-[#0C0806] flex flex-col items-center justify-center"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,94,60,0.15)_0%,_transparent_70%)] pointer-events-none mix-blend-screen" />

            <div className="flex flex-col items-center gap-10 w-full max-w-sm px-6 relative z-10">
              <span className="font-mono text-[10px] tracking-[0.5em] uppercase text-[#8B5E3C]">
                Neural Initialization
              </span>

              <div className="h-10 overflow-hidden relative w-full flex justify-center">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={wordIdx}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute font-display text-2xl tracking-[0.2em] text-[#E8B98A] font-bold"
                  >
                    {words[wordIdx]}
                  </motion.span>
                </AnimatePresence>
              </div>

              <div className="w-full flex flex-col items-center gap-4">
                <div className="w-full h-[1px] bg-[#8B5E3C]/20 relative overflow-hidden flex-1 rounded-full">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-[#C4956A]"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                <span className="font-mono text-[10px] text-[#BFA899] tabular-nums tracking-[0.2em]">
                  {progress}%
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}
