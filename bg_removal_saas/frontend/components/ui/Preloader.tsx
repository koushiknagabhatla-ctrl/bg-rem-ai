'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Preloader({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);
  const words = ['INITIALIZING', 'CONNECTING', 'CALIBRATING', 'READY'];

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
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[99999] bg-[#0A0A0F] flex flex-col items-center justify-center"
          >
            <div className="flex flex-col items-center gap-8 w-full max-w-xs px-6">
              <span className="font-mono text-[10px] tracking-[0.5em] uppercase text-[#4A4A57]">
                System Sequence
              </span>

              <div className="h-8 overflow-hidden relative w-full flex justify-center">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={wordIdx}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute font-display text-lg tracking-[0.2em] text-white/90 font-bold"
                  >
                    VCRANKS // {words[wordIdx]}
                  </motion.span>
                </AnimatePresence>
              </div>

              <div className="w-full flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-[#6C63FF]"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                <span className="font-mono text-[10px] text-white/50 w-8 text-right tabular-nums">
                  {progress}
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
