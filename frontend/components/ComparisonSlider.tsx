"use client";

import { useCallback, useRef, useState } from "react";

interface ComparisonSliderProps {
  originalUrl: string;
  resultUrl: string;
}

export default function ComparisonSlider({
  originalUrl,
  resultUrl,
}: ComparisonSliderProps) {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = (x / rect.width) * 100;
    setPosition(Math.max(0, Math.min(100, pct)));
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setIsDragging(true);
      updatePosition(e.clientX);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [updatePosition]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      updatePosition(e.clientX);
    },
    [isDragging, updatePosition]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative select-none overflow-hidden rounded-2xl border border-white/[0.06]"
      style={{
        cursor: isDragging ? "grabbing" : "col-resize",
        background:
          "repeating-conic-gradient(#1a1a2e 0% 25%, #111122 0% 50%) 50% / 16px 16px",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* After (result) — full width, behind */}
      <div className="relative w-full">
        <img
          src={resultUrl}
          alt="Result with background removed"
          className="block h-auto max-h-[500px] w-full object-contain"
          draggable={false}
        />
        <span className="absolute right-3 top-3 rounded-md bg-black/60 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
          After
        </span>
      </div>

      {/* Before (original) — clipped */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <img
          src={originalUrl}
          alt="Original image"
          className="block h-auto max-h-[500px] w-full object-contain"
          draggable={false}
        />
        <span className="absolute left-3 top-3 rounded-md bg-black/60 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
          Before
        </span>
      </div>

      {/* Slider line */}
      <div
        className="absolute bottom-0 top-0 z-10 w-0.5 bg-indigo-500"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
      >
        {/* Handle */}
        <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-indigo-600 shadow-lg shadow-black/40">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <polyline points="15 18 9 12 15 6" />
            <polyline points="9 18 15 12 9 6" transform="translate(6,0)" />
          </svg>
        </div>
      </div>
    </div>
  );
}
