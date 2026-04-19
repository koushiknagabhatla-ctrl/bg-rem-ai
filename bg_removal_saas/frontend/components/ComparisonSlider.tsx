'use client';
import { useState, useRef } from 'react';

export function ComparisonSlider({ original, resultUrl }: { original: string, resultUrl: string }) {
    const [sliderPos, setSliderPos] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = (e: any) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        setSliderPos((x / rect.width) * 100);
    };

    return (
        <div className="w-full h-full relative" ref={containerRef} onMouseMove={handleMove} onTouchMove={(e)=>handleMove(e.touches[0])}>
            <div className="relative w-full h-full min-h-[400px] overflow-hidden cursor-ew-resize select-none">
                {/* Result layer */}
                <div className="absolute inset-0 bg-transparent" />
                <img src={resultUrl} alt="Result" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
                <div className="absolute bottom-4 right-4 bg-black/80 text-white/90 px-3 py-1 rounded text-sm backdrop-blur-md font-medium border border-white/10 z-20">After</div>
                
                {/* Original layer (Masked by slider position) */}
                <div className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none z-10" style={{ width: `${sliderPos}%` }}>
                    <div className="absolute inset-y-0 left-0 w-screen max-w-none flex items-center" style={{ width: containerRef.current ? containerRef.current.clientWidth : '100vw' }}>
                        <img src={original} alt="Original" className="w-[100vw] h-full object-contain pointer-events-none" style={{ width: containerRef.current ? containerRef.current.clientWidth : '100vw' }} />
                        <div className="absolute bottom-4 left-4 bg-black/80 text-white/90 px-3 py-1 rounded text-sm backdrop-blur-md font-medium border border-white/10">Before</div>
                    </div>
                </div>

                <div className="absolute inset-y-0 w-[2px] bg-white/80 shadow-[0_0_15px_rgba(255,255,255,0.8)] pointer-events-none flex items-center justify-center transform -translate-x-1/2 z-30" style={{ left: `${sliderPos}%` }}>
                    <div className="w-10 h-10 bg-white text-indigo-600 rounded-full flex items-center justify-center shadow-2xl border border-white/20 backdrop-blur">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 9l-4 4 4 4m8-8l4 4-4 4"/></svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
