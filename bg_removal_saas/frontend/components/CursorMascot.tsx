'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import Image from 'next/image';

type MascotMood = 'neutral' | 'excited' | 'crying';

const MASCOT_IMAGES: Record<MascotMood, string> = {
  neutral: '/mascot/shinobu-neutral.png',
  excited: '/mascot/shinobu-excited.png',
  crying: '/mascot/shinobu-crying.png',
};

/* Elements that trigger excitement */
const EXCITED_SELECTORS = [
  '[data-mascot="excited"]',
  'a[href="/register"]',
  'a[href="/login"]',
  'a[href="/about"]',
  '[data-nav-tool]',
];

/* Elements that trigger crying */
const CRYING_SELECTORS = [
  '[data-mascot="crying"]',
  'button[data-signout]',
];

export function CursorMascot() {
  const [mood, setMood] = useState<MascotMood>('neutral');
  const [visible, setVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Smooth cursor following with LERP (0.08 factor for natural lag)
  const cursorX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 500);
  const cursorY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 400);

  const springConfig = { stiffness: 60, damping: 20, mass: 0.8 };
  const x = useSpring(cursorX, springConfig);
  const y = useSpring(cursorY, springConfig);

  // Scale bounce when mood changes
  const scale = useSpring(1, { stiffness: 300, damping: 15 });

  const checkElementProximity = useCallback((clientX: number, clientY: number) => {
    // Check crying elements first
    for (let si = 0; si < CRYING_SELECTORS.length; si++) {
      const els = Array.from(document.querySelectorAll(CRYING_SELECTORS[si]));
      for (let ei = 0; ei < els.length; ei++) {
        const rect = els[ei].getBoundingClientRect();
        const dist = Math.hypot(
          clientX - (rect.left + rect.width / 2),
          clientY - (rect.top + rect.height / 2)
        );
        if (dist < 120) { return 'crying'; }
      }
    }
    
    // Check excited elements
    for (let si = 0; si < EXCITED_SELECTORS.length; si++) {
      const els = Array.from(document.querySelectorAll(EXCITED_SELECTORS[si]));
      for (let ei = 0; ei < els.length; ei++) {
        const rect = els[ei].getBoundingClientRect();
        const dist = Math.hypot(
          clientX - (rect.left + rect.width / 2),
          clientY - (rect.top + rect.height / 2)
        );
        if (dist < 120) { return 'excited'; }
      }
    }
    
    // Check if cursor is near top edge (leaving website)
    if (clientY < 15) { return 'crying'; }
    
    return 'neutral';
  }, []);

  useEffect(() => {
    // Check mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    let prevMood: MascotMood = 'neutral';

    const onMouseMove = (e: MouseEvent) => {
      // Position mascot offset from cursor (bottom-right)
      cursorX.set(e.clientX + 20);
      cursorY.set(e.clientY + 20);

      const newMood = checkElementProximity(e.clientX, e.clientY);
      if (newMood !== prevMood) {
        prevMood = newMood;
        setMood(newMood);
        // Bounce effect on mood change
        scale.set(1.25);
        setTimeout(() => scale.set(1), 150);
      }
    };

    const onMouseLeave = () => {
      setMood('crying');
      scale.set(0.9);
    };

    const onMouseEnter = () => {
      setMood('neutral');
      scale.set(1);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onMouseLeave);
    document.documentElement.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', checkMobile);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      document.documentElement.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [cursorX, cursorY, scale, checkElementProximity]);

  // Don't render on mobile
  if (isMobile) return null;

  return (
    <motion.div
      style={{ x, y, scale }}
      className="fixed top-0 left-0 z-[9999] pointer-events-none select-none"
    >
      <div className="relative w-16 h-20">
        {/* Shadow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-2 bg-ink/5 rounded-full blur-sm" />
        
        {/* Character sprite — crossfade between moods */}
        {(['neutral', 'excited', 'crying'] as MascotMood[]).map((m) => (
          <Image
            key={m}
            src={MASCOT_IMAGES[m]}
            alt={`Shinobu ${m}`}
            fill
            className={`object-contain transition-opacity duration-300 ${mood === m ? 'opacity-100' : 'opacity-0'}`}
            sizes="64px"
            priority
          />
        ))}
        
        {/* Mood indicator */}
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: mood !== 'neutral' ? 1 : 0, y: mood !== 'neutral' ? 0 : 5 }}
          transition={{ duration: 0.3 }}
          className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap"
        >
          {mood === 'excited' && <span className="text-[10px]">✨</span>}
          {mood === 'crying' && <span className="text-[10px]">💧</span>}
        </motion.div>
      </div>
    </motion.div>
  );
}
