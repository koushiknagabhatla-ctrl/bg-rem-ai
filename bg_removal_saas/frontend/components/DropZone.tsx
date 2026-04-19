'use client';
import { useState, useCallback } from 'react';
import { createBrowserSupabaseClient } from '../lib/supabase';

export function DropZone({ onResult }: { onResult: (res: any) => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [statusText, setStatusText] = useState('');
    const supabase = createBrowserSupabaseClient();

    const handleDrop = useCallback((e: any) => {
        e.preventDefault();
        const f = e.dataTransfer?.files[0] || e.target?.files[0];
        if (f && f.size <= 20 * 1024 * 1024) {
            setFile(f);
            setPreview(URL.createObjectURL(f));
            setError('');
        } else {
            setError('File max size is 20MB');
        }
    }, []);

    const upload = async () => {
        if (!file) return;
        setLoading(true);
        setError('');
        setStatusText("Detecting edges...");

        try {
            const { data: { session } } = await supabase.auth.getSession();
            setStatusText("Removing background...");
            
            const formData = new FormData();
            formData.append('image', file);

            const res = await fetch('/api/remove-bg', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${session?.access_token}` },
                body: formData
            });

            if (!res.ok) throw new Error((await res.json()).error || 'Failed');
            
            setStatusText("Polishing result...");
            const data = await res.json();
            onResult({ original: preview, resultUrl: data.result_url });
        } catch (e: any) {
            setError(e.message);
        }
        setLoading(false);
    };

    return (
        <div className="glass-card max-w-4xl mx-auto w-full p-8 text-center min-h-[400px] flex flex-col items-center justify-center relative hover:shadow-[0_0_25px_rgba(99,102,241,0.15)] transition-shadow">
            {!file ? (
                <label className="border-2 border-dashed border-white/20 rounded-2xl w-full h-64 flex items-center justify-center cursor-pointer hover:border-accent transition-colors relative">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/png,image/jpeg,image/webp" onChange={handleDrop} />
                    <div className="text-zinc-400 flex flex-col items-center gap-3">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        <span className="text-lg">Drop your image here or click to browse</span>
                    </div>
                </label>
            ) : (
                <div className="w-full flex flex-col items-center gap-6">
                    <img src={preview} alt="Preview" className="max-h-64 rounded-xl object-contain shadow-2xl" />
                    {loading ? (
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-zinc-300 font-medium animate-pulse">{statusText}</span>
                        </div>
                    ) : (
                        <button onClick={upload} className="bg-gradient-to-r from-accent to-accent-light px-8 py-3 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                            Remove Background
                        </button>
                    )}
                </div>
            )}
            
            {error && (
                <div className="mt-6 text-red-400 p-4 border border-red-500/30 rounded-xl bg-red-500/10 w-full flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => {setFile(null); setError('');}} className="underline">Try again</button>
                </div>
            )}
        </div>
    );
}
