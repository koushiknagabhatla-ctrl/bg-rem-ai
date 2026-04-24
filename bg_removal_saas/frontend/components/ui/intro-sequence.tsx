'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function CinematicIntro({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [activeWord, setActiveWord] = useState(0);
  const words = ['Waking up', 'Preparing canvas', 'Mixing colors', 'Ready'];

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            setLoading(false);
            document.body.style.overflow = 'unset';
          }, 200); // reduced linger
          return 100;
        }
        return prev + 25; // incredibly fast increment
      });
    }, 40);

    const wordInterval = setInterval(() => {
      setActiveWord((prev) => (prev < words.length - 1 ? prev + 1 : prev));
    }, 180);

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
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[99999] bg-[#0C0806] flex flex-col justify-center items-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(196,149,106,0.1)_0%,_transparent_70%)] pointer-events-none" />

            <div className="flex flex-col items-center gap-12 z-10 w-full max-w-sm px-6">
              
              <div className="h-16 overflow-hidden relative w-full flex justify-center">
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={activeWord}
                    initial={{ y: 40, opacity: 0, rotateX: 45 }}
                    animate={{ y: 0, opacity: 1, rotateX: 0 }}
                    exit={{ y: -40, opacity: 0, rotateX: -45 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute text-2xl md:text-3xl font-display font-medium text-white text-center transform-gpu"
                  >
                    {words[activeWord]}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="w-full flex items-center gap-6">
                <div className="flex-1 h-[2px] bg-[#8B5E3C]/10 relative overflow-hidden rounded-full">
                  <motion.div 
                    className="absolute top-0 left-0 h-full bg-[#E8B98A] transition-all duration-300 ease-out"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <span className="text-xs font-mono font-medium tracking-widest text-[#BFA899] w-10 text-right tabular-nums">
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
