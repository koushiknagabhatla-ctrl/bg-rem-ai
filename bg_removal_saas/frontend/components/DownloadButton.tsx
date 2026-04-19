'use client';

export function DownloadButton({ resultUrl, reset }: { resultUrl: string, reset: () => void }) {
    
    const downloadImage = async (bgColor: string) => {
        const res = await fetch(resultUrl);
        const blob = await res.blob();
        
        let outBlob: Blob = blob;
        if (bgColor !== 'transparent') {
            const img = new Image();
            img.src = URL.createObjectURL(blob);
            await new Promise(r => img.onload = r);
            
            const canvas = document.createElement('canvas');
            canvas.width = img.width; canvas.height = img.height;
            const ctx = canvas.getContext('2d')!;
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            
            outBlob = await new Promise<Blob>(resolve => 
                canvas.toBlob((b) => resolve(b as Blob), 'image/jpeg', 0.95)
            );
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
        <div className="flex flex-col gap-3 w-full">
            <button 
                onClick={() => downloadImage('transparent')} 
                className="w-full py-3 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-300 text-sm font-medium transition-all duration-200"
            >
                Download PNG (Transparent)
            </button>
            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={() => downloadImage('#ffffff')} 
                    className="py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 text-sm font-medium transition-all"
                >
                    White BG
                </button>
                <button 
                    onClick={() => downloadImage('#000000')} 
                    className="py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 text-sm font-medium transition-all"
                >
                    Black BG
                </button>
            </div>
        </div>
    );
}
