'use client';
export function DownloadButton({ resultUrl, reset }: { resultUrl: string, reset: () => void }) {
    
    const downloadImage = async (bgColor: string) => {
        const res = await fetch(resultUrl);
        const blob = await res.blob();
        
        let outBlob = blob;
        if (bgColor !== 'transparent') {
            const img = new Image();
            img.src = URL.createObjectURL(blob);
            await new Promise(r => img.onload = r);
            
            const canvas = document.createElement('canvas');
            canvas.width = img.width; canvas.height = img.height;
            const ctx = canvas.getContext('2d')!;
            ctx.fillStyle = bgColor;
            ctx.fillRect(0,0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            
            outBlob = await new Promise(resolve => canvas.toBlob((b) => resolve(b as Blob), 'image/jpeg', 0.95));
        }

        const url = URL.createObjectURL(outBlob);
        const a = document.createElement('a'); 
        a.href = url; a.download = `bg-removed-${Date.now()}.${bgColor==='transparent'?'png':'jpg'}`;
        a.click();
    };

    return (
        <div className="flex flex-col items-center gap-6 mt-8">
            <div className="flex flex-wrap justify-center gap-4">
                <button onClick={() => downloadImage('transparent')} className="glass-card bg-gradient-to-r from-accent/20 to-accent/5 hover:from-accent hover:to-accent-light px-6 py-3 font-semibold transition-all">
                    Download PNG (Transparent)
                </button>
                <button onClick={() => downloadImage('#ffffff')} className="glass-card hover:bg-white hover:text-black px-6 py-3 font-semibold transition-all">
                    White BG
                </button>
                <button onClick={() => downloadImage('#000000')} className="glass-card hover:bg-zinc-800 px-6 py-3 font-semibold transition-all">
                    Black BG
                </button>
            </div>
            <button onClick={reset} className="text-zinc-400 hover:text-white underline text-sm">
                Process another image
            </button>
        </div>
    );
}
