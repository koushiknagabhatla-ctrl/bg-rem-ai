'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function CinematicIntro({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [activeWord, setActiveWord] = useState(0);
  const words = ['INITIALIZING', 'CONNECTING', 'ANALYZING', 'READY'];

  useEffect(() => {
    // Prevent scrolling while intro is playing
    document.body.style.overflow = 'hidden';

    // Simulate loading progress much faster (zero lag)
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

    // Swap words rapidly
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
            className="fixed inset-0 z-[99999] bg-[#0a0a0a] flex flex-col justify-center items-center overflow-hidden"
          >
            {/* Ambient Noise / CRT effect overlay */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png')] pointer-events-none mix-blend-screen" />

            <div className="flex flex-col items-center gap-8 z-10 w-full max-w-sm px-6">
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/40 tabular-nums w-full text-center">
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
                    className="absolute text-xl md:text-2xl font-serif font-bold tracking-widest text-white text-center"
                  >
                    VCRANKS // {words[activeWord]}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="w-full flex items-center gap-4">
                <div className="flex-1 h-[1px] bg-white/10 relative overflow-hidden">
                  <motion.div 
                    className="absolute top-0 left-0 h-full bg-white transition-all duration-300 ease-out"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold tracking-[0.3em] text-white/70 w-8 text-right tabular-nums">
                  {Math.min(progress, 100)}%
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* 
        IMPORTANT: Do not wrap children in opacity-0 or conditional rendering. 
        Framer Motion's whileInView needs the DOM nodes to be fully present 
        and calculating correctly behind the black intro overlay so they don't break. 
      */}
      {children}
    </>
  );
}
