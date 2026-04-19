"use client";

import { useEffect, useRef, useState } from "react";

interface CreditDisplayProps {
  creditsLeft: number;
  isAdmin: boolean;
}

export default function CreditDisplay({
  creditsLeft,
  isAdmin,
}: CreditDisplayProps) {
  const [displayCount, setDisplayCount] = useState(creditsLeft);
  const prevRef = useRef(creditsLeft);

  // Animate count-down when credits change
  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = creditsLeft;

    if (prev === creditsLeft) {
      setDisplayCount(creditsLeft);
      return;
    }

    const diff = prev - creditsLeft;
    if (diff <= 0) {
      setDisplayCount(creditsLeft);
      return;
    }

    // Animate from prev to creditsLeft over 600ms
    const steps = Math.min(diff, 20);
    const stepDelay = 600 / steps;
    let current = prev;
    const decrement = diff / steps;

    const timer = setInterval(() => {
      current -= decrement;
      if (current <= creditsLeft) {
        setDisplayCount(creditsLeft);
        clearInterval(timer);
      } else {
        setDisplayCount(Math.round(current));
      }
    }, stepDelay);

    return () => clearInterval(timer);
  }, [creditsLeft]);

  // Admin: unlimited badge
  if (isAdmin) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5">
        <span className="text-lg leading-none text-amber-400">∞</span>
        <span className="text-sm font-semibold text-amber-300">Unlimited</span>
      </div>
    );
  }

  // Low credit warning: red glow when < 10
  const isLow = displayCount < 10;
  const isEmpty = displayCount <= 0;

  return (
    <div
      className={`flex items-center gap-2 rounded-full border px-4 py-1.5 transition-all duration-300 ${
        isEmpty
          ? "border-red-500/30 bg-red-500/10 shadow-[0_0_12px_rgba(239,68,68,0.15)]"
          : isLow
            ? "border-red-500/20 bg-red-500/[0.07] shadow-[0_0_8px_rgba(239,68,68,0.1)]"
            : "border-indigo-500/20 bg-indigo-500/10"
      }`}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        className={
          isEmpty
            ? "text-red-400"
            : isLow
              ? "text-red-400"
              : "text-indigo-400"
        }
      >
        <path
          d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
          fill="currentColor"
        />
      </svg>
      <span
        className={`text-sm font-semibold tabular-nums ${
          isEmpty
            ? "text-red-300"
            : isLow
              ? "text-red-300"
              : "text-indigo-300"
        }`}
      >
        {displayCount} credits
      </span>
    </div>
  );
}
