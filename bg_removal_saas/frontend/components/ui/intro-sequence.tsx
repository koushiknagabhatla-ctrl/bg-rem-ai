'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function CinematicIntro({ children }: { children: React.ReactNode }) {
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    // Lock scroll during intro
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => {
      document.body.style.overflow = 'unset';
      setComplete(true);
    }, 2800);
    return () => {
      document.body.style.overflow = 'unset';
      clearTimeout(t);
    };
  }, []);

  return (
    <>
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: '-100vh' }}
        transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1], delay: 1.4 }}
        className="fixed inset-0 z-[100] bg-ink flex flex-col items-center justify-center origin-top pointer-events-none"
      >
        <div className="overflow-hidden">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 1, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
            className="text-cream font-serif text-3xl md:text-5xl font-semibold flex items-center gap-2"
          >
            <span>VCranks</span>
            <span className="italic text-cream/60">AI</span>
          </motion.div>
        </div>
        <div className="overflow-hidden mt-2">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.4 }}
            className="w-12 h-px bg-cream/30 mx-auto"
          />
        </div>
      </motion.div>
      
      {/* Page Content wrapped in a slight parallax rise */}
      <motion.div
        initial={{ y: '5vh' }}
        animate={{ y: 0 }}
        transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1], delay: 1.5 }}
      >
        {children}
      </motion.div>
    </>
  );
}
