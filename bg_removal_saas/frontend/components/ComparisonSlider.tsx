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
        <div className="max-w-4xl mx-auto w-full glass-card p-4">
            <div ref={containerRef} onMouseMove={handleMove} onTouchMove={(e)=>handleMove(e.touches[0])} className="relative w-full h-[500px] rounded-xl overflow-hidden cursor-ew-resize user-select-none select-none">
                {/* Checkered BG for result */}
                <div className="absolute inset-0 bg-[#e5e5f7] opacity-20" style={{backgroundImage: 'repeating-linear-gradient(45deg, #111 25%, transparent 25%, transparent 75%, #111 75%, #111), repeating-linear-gradient(45deg, #111 25%, #0a0a0f 25%, #0a0a0f 75%, #111 75%, #111)', backgroundPosition: '0 0, 10px 10px', backgroundSize: '20px 20px'}}></div>
                
                <img src={resultUrl} alt="Result" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
                <div className="absolute bottom-4 right-4 bg-black/60 px-3 py-1 rounded text-sm backdrop-blur">After</div>
                
                <div className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none" style={{ width: `${sliderPos}%` }}>
                    <div className="absolute inset-y-0 left-0 w-[100vw] sm:w-[860px]">
                        <img src={original} alt="Original" className="w-full h-full object-contain pointer-events-none" />
                        <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded text-sm backdrop-blur">Before</div>
                    </div>
                </div>

                <div className="absolute inset-y-0 w-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] pointer-events-none flex items-center justify-center transform -translate-x-1/2" style={{ left: `${sliderPos}%` }}>
                    <div className="w-8 h-8 bg-white text-accent rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l-4 4 4 4m8-8l4 4-4 4"/></svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
