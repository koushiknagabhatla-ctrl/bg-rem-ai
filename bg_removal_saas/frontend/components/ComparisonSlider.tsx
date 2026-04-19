'use client';
import { useState, useRef, useCallback } from 'react';

export function ComparisonSlider({ original, resultUrl }: { original: string; resultUrl: string }) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePos = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPos((x / rect.width) * 100);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePos(e.clientX);
  }, [updatePos]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (dragging.current) updatePos(e.clientX);
  }, [updatePos]);

  const onPointerUp = useCallback(() => { dragging.current = false; }, []);

  return (
    <div ref={containerRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
      className="relative w-full h-full min-h-[420px] select-none touch-none overflow-hidden rounded-xl bg-[repeating-conic-gradient(hsl(var(--muted))_0%_25%,transparent_0%_50%)] bg-[length:16px_16px]">
      
      {/* Result (full, behind) */}
      <img src={resultUrl} alt="Result" className="absolute inset-0 w-full h-full object-contain pointer-events-none" draggable={false} />
      <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md text-[10px] font-semibold text-white/70 bg-black/50 backdrop-blur-md border border-white/10 z-20 uppercase tracking-wider">After</div>

      {/* Original (clipped) */}
      <div className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none z-10" style={{ width: `${pos}%` }}>
        <img src={original} alt="Original" className="absolute inset-0 h-full object-contain pointer-events-none" draggable={false}
          style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }} />
        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-semibold text-white/70 bg-black/50 backdrop-blur-md border border-white/10 uppercase tracking-wider">Before</div>
      </div>

      {/* Handle */}
      <div className="absolute inset-y-0 z-30 pointer-events-none" style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}>
        <div className="w-0.5 h-full bg-white/80 mx-auto shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-xl cursor-ew-resize pointer-events-auto">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#09090b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 9l-4 4 4 4"/><path d="M16 9l4 4-4 4"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
