'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function CinematicIntro({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [activeWord, setActiveWord] = useState(0);
  const words = ['INITIALIZING', 'CONNECTING', 'ANALYZING', 'READY'];

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            setLoading(false);
            document.body.style.overflow = 'unset';
          }, 200);
          return 100;
        }
        return prev + 25;
      });
    }, 50);

    const wordInterval = setInterval(() => {
      setActiveWord((prev) => (prev < words.length - 1 ? prev + 1 : prev));
    }, 150);

    return () => {
      clearInterval(progressInterval);
      clearInterval(wordInterval);
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            key="intro-overlay"
            initial={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[99999] bg-[#0C0806] flex flex-col justify-center items-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,94,60,0.08)_0%,_transparent_70%)] pointer-events-none" />

            <div className="flex flex-col items-center gap-8 z-10 w-full max-w-sm px-6">
              <span className="text-[10px] font-mono font-bold tracking-[0.4em] uppercase text-[#8B5E3C] tabular-nums w-full text-center">
                System Sequence
              </span>
              
              <div className="h-10 overflow-hidden relative w-full flex justify-center">
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={activeWord}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="absolute text-xl md:text-2xl font-display font-bold tracking-widest text-[#E8B98A] text-center"
                  >
                    VCRANKS // {words[activeWord]}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="w-full flex items-center gap-4">
                <div className="flex-1 h-[1px] bg-[#8B5E3C]/20 relative overflow-hidden">
                  <motion.div 
                    className="absolute top-0 left-0 h-full bg-[#C4956A] transition-all duration-300 ease-out"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono font-bold tracking-[0.3em] text-[#BFA899] w-8 text-right tabular-nums">
                  {Math.min(progress, 100)}%
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
