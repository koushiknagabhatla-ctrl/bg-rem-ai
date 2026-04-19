'use client';
import { useState, useRef } from 'react';

export function ComparisonSlider({ original, resultUrl }: { original: string, resultUrl: string }) {
    const [sliderPos, setSliderPos] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = (clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        setSliderPos((x / rect.width) * 100);
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={(e) => handleMove(e.clientX)}
            onTouchMove={(e) => handleMove(e.touches[0].clientX)}
            className="relative w-full h-full min-h-[400px] cursor-ew-resize select-none overflow-hidden"
        >
            {/* Result (background) */}
            <img src={resultUrl} alt="Result" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
            <div className="absolute bottom-4 right-4 bg-black/70 text-white/80 px-3 py-1 rounded-lg text-xs font-medium backdrop-blur-md border border-white/10 z-20">After</div>

            {/* Original (foreground, clipped) */}
            <div className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none z-10" style={{ width: `${sliderPos}%` }}>
                <img
                    src={original}
                    alt="Original"
                    className="absolute inset-0 h-full object-contain pointer-events-none"
                    style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}
                />
                <div className="absolute bottom-4 left-4 bg-black/70 text-white/80 px-3 py-1 rounded-lg text-xs font-medium backdrop-blur-md border border-white/10">Before</div>
            </div>

            {/* Slider handle */}
            <div
                className="absolute inset-y-0 z-30 pointer-events-none"
                style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
            >
                <div className="w-[2px] h-full bg-white/70 mx-auto shadow-[0_0_12px_rgba(255,255,255,0.6)]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-2xl border-2 border-white/30">
                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 9l-4 4 4 4m8-8l4 4-4 4"/>
                    </svg>
                </div>
            </div>
        </div>
    );
}
