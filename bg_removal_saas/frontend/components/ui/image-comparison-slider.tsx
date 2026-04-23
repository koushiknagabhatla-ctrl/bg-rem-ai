'use client';

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageComparisonSliderProps extends React.HTMLAttributes<HTMLDivElement> {
  leftImage: string;
  rightImage: string;
  altLeft?: string;
  altRight?: string;
  initialPosition?: number;
}

export const ImageComparisonSlider = React.forwardRef<HTMLDivElement, ImageComparisonSliderProps>(
  ({ className, leftImage, rightImage, altLeft = "Before", altRight = "After", initialPosition = 50, ...props }, ref) => {
    const [sliderPosition, setSliderPosition] = React.useState(initialPosition);
    const [isDragging, setIsDragging] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const handleMove = (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      let newPosition = (x / rect.width) * 100;
      newPosition = Math.max(0, Math.min(100, newPosition));
      setSliderPosition(newPosition);
    };

    const handleMouseMove = (e: MouseEvent) => { if (!isDragging) return; handleMove(e.clientX); };
    const handleTouchMove = (e: TouchEvent) => { if (!isDragging) return; handleMove(e.touches[0].clientX); };
    const handleInteractionStart = () => { setIsDragging(true); };
    const handleInteractionEnd = () => { setIsDragging(false); };

    React.useEffect(() => {
      if (isDragging) {
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("touchmove", handleTouchMove);
        document.addEventListener("mouseup", handleInteractionEnd);
        document.addEventListener("touchend", handleInteractionEnd);
        document.body.style.cursor = 'ew-resize';
      } else {
        document.body.style.cursor = '';
      }
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("mouseup", handleInteractionEnd);
        document.removeEventListener("touchend", handleInteractionEnd);
        document.body.style.cursor = '';
      };
    }, [isDragging]);

    return (
      <div
        ref={containerRef}
        className={cn("relative w-full h-full overflow-hidden select-none group", className)}
        onMouseDown={handleInteractionStart}
        onTouchStart={handleInteractionStart}
        {...props}
      >
        {/* Right Image (bottom) */}
        <img src={rightImage} alt={altRight} className="absolute inset-0 w-full h-full object-cover pointer-events-none" draggable={false} />
        {/* Label */}
        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-white/60 bg-black/60 backdrop-blur-md border border-white/10 z-20 uppercase tracking-wider">After</div>
        
        {/* Left Image (top, clipped) */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
          style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}>
          <img src={leftImage} alt={altLeft} className="w-full h-full object-cover" draggable={false} />
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-white/60 bg-black/60 backdrop-blur-md border border-white/10 uppercase tracking-wider">Before</div>
        </div>

        {/* Slider Handle */}
        <div className="absolute top-0 h-full w-1 cursor-ew-resize" style={{ left: `calc(${sliderPosition}% - 2px)` }}>
          <div className="absolute inset-y-0 w-0.5 bg-white/50 backdrop-blur-sm mx-auto shadow-[0_0_10px_rgba(255,255,255,0.3)]"></div>
          <div className={cn(
            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-12 w-12 flex items-center justify-center rounded-full bg-white/10 text-white shadow-xl backdrop-blur-xl border border-white/20",
            "transition-all duration-300 ease-in-out",
            "group-hover:scale-105",
            isDragging && "scale-105 shadow-2xl shadow-violet-500/30 bg-white/20"
          )}
            role="slider" aria-valuenow={sliderPosition} aria-valuemin={0} aria-valuemax={100} aria-orientation="horizontal" aria-label="Image comparison slider"
          >
            <div className="flex items-center text-white">
              <ChevronLeft className="h-4 w-4 drop-shadow-md" />
              <ChevronRight className="h-4 w-4 drop-shadow-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ImageComparisonSlider.displayName = "ImageComparisonSlider";
