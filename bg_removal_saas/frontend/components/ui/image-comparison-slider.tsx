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
      setSliderPosition(Math.max(0, Math.min(100, (x / rect.width) * 100)));
    };

    const handleMouseMove = (e: MouseEvent) => { if (!isDragging) return; handleMove(e.clientX); };
    const handleTouchMove = (e: TouchEvent) => { if (!isDragging) return; handleMove(e.touches[0].clientX); };
    const handleInteractionEnd = () => { setIsDragging(false); };

    React.useEffect(() => {
      if (isDragging) {
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("touchmove", handleTouchMove);
        document.addEventListener("mouseup", handleInteractionEnd);
        document.addEventListener("touchend", handleInteractionEnd);
        document.body.style.cursor = 'ew-resize';
      } else { document.body.style.cursor = ''; }
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("mouseup", handleInteractionEnd);
        document.removeEventListener("touchend", handleInteractionEnd);
        document.body.style.cursor = '';
      };
    }, [isDragging]);

    return (
      <div ref={containerRef}
        className={cn("relative w-full h-full overflow-hidden select-none group cursor-ew-resize", className)}
        onMouseDown={() => setIsDragging(true)} onTouchStart={() => setIsDragging(true)} {...props}>
        
        <div className="absolute inset-0 checker-bg" />
        <img src={rightImage} alt={altRight} className="absolute inset-0 w-full h-full object-cover pointer-events-none" draggable={false} />
        <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full text-[10px] font-semibold text-white/80 bg-black/40 backdrop-blur-md z-20 uppercase tracking-widest">After</div>
        
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
          style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}>
          <img src={leftImage} alt={altLeft} className="w-full h-full object-cover" draggable={false} />
          <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full text-[10px] font-semibold text-white/80 bg-black/40 backdrop-blur-md uppercase tracking-widest">Before</div>
        </div>

        <div className="absolute top-0 h-full" style={{ left: `calc(${sliderPosition}% - 1px)` }}>
          <div className="absolute inset-y-0 w-[2px] bg-white/80 mx-auto shadow-sm" />
          <div className={cn(
            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-cream border-2 border-white shadow-lg",
            "transition-all duration-200",
            isDragging && "scale-110 shadow-xl"
          )} role="slider" aria-valuenow={sliderPosition} aria-valuemin={0} aria-valuemax={100}>
            <div className="flex items-center text-ink-light">
              <ChevronLeft className="h-3 w-3" />
              <ChevronRight className="h-3 w-3" />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ImageComparisonSlider.displayName = "ImageComparisonSlider";
