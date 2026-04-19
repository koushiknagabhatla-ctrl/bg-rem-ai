'use client';
import { useState, useRef, useCallback } from 'react';

export function ComparisonSlider({ original, resultUrl }: { original: string; resultUrl: string }) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePos = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPos(Math.max(0, Math.min((clientX - rect.left) / rect.width * 100, 100)));
  }, []);

  return (
    <div ref={containerRef}
      onPointerDown={(e) => { dragging.current = true; (e.target as HTMLElement).setPointerCapture(e.pointerId); updatePos(e.clientX); }}
      onPointerMove={(e) => { if (dragging.current) updatePos(e.clientX); }}
      onPointerUp={() => { dragging.current = false; }}
      className="relative w-full h-full min-h-[420px] select-none touch-none overflow-hidden rounded-xl"
      style={{ background: 'repeating-conic-gradient(rgba(255,255,255,0.03) 0% 25%, transparent 0% 50%) 0 0 / 16px 16px' }}>
      
      <img src={resultUrl} alt="Result" className="absolute inset-0 w-full h-full object-contain pointer-events-none" draggable={false} />
      <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-white/60 bg-black/60 backdrop-blur-md border border-white/10 z-20 uppercase tracking-wider">After</div>

      <div className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none z-10" style={{ width: `${pos}%` }}>
        <img src={original} alt="Original" className="absolute inset-0 h-full object-contain pointer-events-none" draggable={false}
          style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }} />
        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-white/60 bg-black/60 backdrop-blur-md border border-white/10 uppercase tracking-wider">Before</div>
      </div>

      <div className="absolute inset-y-0 z-30 pointer-events-none" style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}>
        <div className="w-0.5 h-full bg-white/80 mx-auto shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-2xl pointer-events-auto cursor-ew-resize">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 9l-4 4 4 4"/><path d="M16 9l4 4-4 4"/></svg>
        </div>
      </div>
    </div>
  );
}
