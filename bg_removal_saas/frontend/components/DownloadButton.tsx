'use client';
import { Download } from 'lucide-react';

export function DownloadButton({ resultUrl }: { resultUrl: string }) {
  const download = async (bgColor: string) => {
    const res = await fetch(resultUrl);
    const blob = await res.blob();
    let outBlob: Blob = blob;

    if (bgColor !== 'transparent') {
      const img = new Image();
      img.src = URL.createObjectURL(blob);
      await new Promise((r) => (img.onload = r));
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      outBlob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b as Blob), 'image/jpeg', 0.95));
      URL.revokeObjectURL(img.src);
    }

    const url = URL.createObjectURL(outBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pixelforge-${Date.now()}.${bgColor === 'transparent' ? 'png' : 'jpg'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-2.5">
      <button onClick={() => download('transparent')} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary/10 text-primary border border-primary/15 hover:bg-primary/15 text-xs font-medium transition-colors">
        <Download className="w-3.5 h-3.5" /> PNG (Transparent)
      </button>
      <div className="grid grid-cols-2 gap-2.5">
        <button onClick={() => download('#ffffff')} className="py-2 rounded-lg bg-muted text-muted-foreground hover:bg-accent text-xs font-medium transition-colors border border-border/50">White BG</button>
        <button onClick={() => download('#000000')} className="py-2 rounded-lg bg-muted text-muted-foreground hover:bg-accent text-xs font-medium transition-colors border border-border/50">Black BG</button>
      </div>
    </div>
  );
}
