'use client';
import { Download } from 'lucide-react';
import { LiquidButton } from '@/components/ui/liquid-glass-button';

export function DownloadButton({ resultUrl }: { resultUrl: string }) {
  const download = async (bgColor: string) => {
    const res = await fetch(resultUrl);
    const blob = await res.blob();
    let outBlob: Blob = blob;
    if (bgColor !== 'transparent') {
      const img = new Image(); img.src = URL.createObjectURL(blob);
      await new Promise((r) => (img.onload = r));
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d')!; ctx.fillStyle = bgColor; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0);
      outBlob = await new Promise<Blob>((resolve) => c.toBlob((b) => resolve(b as Blob), 'image/jpeg', 0.95));
      URL.revokeObjectURL(img.src);
    }
    const url = URL.createObjectURL(outBlob); const a = document.createElement('a');
    a.href = url; a.download = `vcranks-${Date.now()}.${bgColor === 'transparent' ? 'png' : 'jpg'}`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <LiquidButton onClick={() => download('transparent')} className="w-full flex items-center justify-center gap-2 py-3">
        <Download className="w-3.5 h-3.5" /> PNG (Transparent)
      </LiquidButton>
      <div className="grid grid-cols-2 gap-2.5">
        <button onClick={() => download('#ffffff')} className="py-2.5 rounded-xl bg-[#1A0E08] border border-[#8B5E3C]/20 text-[#BFA899] hover:bg-[#8B5E3C]/10 text-xs font-semibold transition-all duration-300">White BG</button>
        <button onClick={() => download('#000000')} className="py-2.5 rounded-xl bg-[#1A0E08] border border-[#8B5E3C]/20 text-[#BFA899] hover:bg-[#8B5E3C]/10 text-xs font-semibold transition-all duration-300">Black BG</button>
      </div>
    </div>
  );
}
