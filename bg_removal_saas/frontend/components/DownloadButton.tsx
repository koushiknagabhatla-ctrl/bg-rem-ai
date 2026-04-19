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
        <div className="flex flex-col items-center gap-6 mt-8 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                <button onClick={() => downloadImage('transparent')} className="glass bg-white/5 hover:bg-indigo-500 hover:border-indigo-400 px-6 py-4 rounded-xl font-medium transition-all duration-300 text-white w-full shadow-lg">
                    Download PNG (Transparent)
                </button>
                <button onClick={() => downloadImage('#ffffff')} className="glass bg-white hover:bg-gray-100 hover:scale-105 text-black px-6 py-4 rounded-xl font-medium transition-all duration-300 w-full shadow-lg">
                    Download JPEG (Solid White)
                </button>
                <button onClick={() => downloadImage('#000000')} className="glass bg-black hover:bg-neutral-900 border-white/20 px-6 py-4 rounded-xl font-medium transition-all duration-300 text-white w-full shadow-lg">
                    Download JPEG (Solid Black)
                </button>
            </div>
            <button onClick={reset} className="text-white/50 hover:text-white underline underline-offset-4 transition-colors font-medium text-sm mt-2">
                Discard and select another image
            </button>
        </div>
    );
}
