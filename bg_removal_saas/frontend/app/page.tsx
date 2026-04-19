'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { useImageUpload } from '@/components/hooks/use-image-upload';
import { ImagePlus, X, Upload, Trash2, ArrowRight } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { LiquidButton } from '@/components/ui/liquid-glass-button';
import { ComparisonSlider } from '@/components/ComparisonSlider';
import { DownloadButton } from '@/components/DownloadButton';
import { CreditDisplay } from '@/components/CreditDisplay';

export default function Home() {
    const supabase = createBrowserSupabaseClient();
    const router = useRouter();
    const [session, setSession] = useState<any>(undefined);
    const [loading, setLoading] = useState(true);
    const [apiStatus, setApiStatus] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [result, setResult] = useState<any>(null);
    const [triggerTime, setTriggerTime] = useState(Date.now());
    const [isDragging, setIsDragging] = useState(false);

    const {
        previewUrl,
        fileName,
        fileObject,
        fileInputRef,
        handleThumbnailClick,
        handleFileChange,
        handleRemove,
    } = useImageUpload();

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (!data.session) {
                router.replace('/login');
            } else {
                setSession(data.session);
                setLoading(false);
            }
        });
    }, [supabase, router]);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation();
    }
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(true);
    }
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    }
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) {
            const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
            handleFileChange(fakeEvent);
        }
    }

    const uploadAndRemoveBackground = async () => {
        if (!fileObject) return;
        setApiStatus('Detecting edges...');
        setError('');
        try {
            const { data: { session } } = await supabase.auth.getSession();
            setApiStatus('Removing background (est. 40ms AI Processing)...');
            
            const formData = new FormData();
            formData.append('image', fileObject);

            const res = await fetch('/api/remove-bg', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${session?.access_token}` },
                body: formData
            });

            if (!res.ok) {
                const text = await res.text();
                try {
                    const json = JSON.parse(text);
                    throw new Error(json.error || json.detail || 'Failed');
                } catch {
                    throw new Error(`Server Error (${res.status}): ${text.substring(0, 80)}...`);
                }
            }
            
            setApiStatus('Polishing result...');
            const data = await res.json();
            setResult({ original: previewUrl, resultUrl: data.result_url });
            setTriggerTime(Date.now()); // Update credits automatically
        } catch (e: any) {
            setError(e.message);
        }
        setApiStatus('');
    };

    if (loading || session === undefined) {
        return (
            <div className="min-h-screen w-screen bg-[#010201] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#010201] text-white flex flex-col items-center pt-16 pb-24 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-20%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
            
            <div className="w-full max-w-5xl px-6 z-10 flex flex-col items-center">
                
                <div className="w-full flex justify-end mb-8">
                    <CreditDisplay triggerTime={triggerTime} />
                </div>

                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60">
                        PixelForge Interface
                    </h1>
                    <p className="text-white/40 text-lg">AI-powered object segmentation. 40ms latency.</p>
                </div>

                {!result ? (
                    <div className="w-full max-w-xl flex flex-col items-center gap-8">
                        <div className="w-full rounded-2xl glass p-8 shadow-2xl relative">
                            {/* Inner grid pattern */}
                            <div className="absolute inset-0 opacity-[0.02] pointer-events-none rounded-2xl" 
                                style={{ backgroundImage: `linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }}
                            />
                            
                            <h3 className="text-xl font-medium mb-2 text-white/90">Upload Asset</h3>
                            <p className="text-sm text-white/40 mb-6">Supported formats: JPG, PNG, WEBP (Max 20MB)</p>

                            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

                            {!previewUrl ? (
                                <div
                                    onClick={handleThumbnailClick}
                                    onDragOver={handleDragOver}
                                    onDragEnter={handleDragEnter}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={cn(
                                        "flex h-64 cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-border/50 bg-white/5 transition-all hover:bg-white/10 hover:border-white/20 relative z-10",
                                        isDragging && "border-indigo-500/50 bg-indigo-500/10",
                                        "border border-dashed"
                                    )}
                                >
                                    <div className="rounded-full bg-white/10 p-4 shadow-sm group-hover:scale-110 transition-transform">
                                        <ImagePlus className="h-6 w-6 text-white/60" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-white/80">Click to select</p>
                                        <p className="text-xs text-white/40 mt-1">or drag and drop file here</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="relative group h-64 overflow-hidden rounded-xl border border-white/10 bg-black/50">
                                        <Image src={previewUrl} alt="Preview" fill className="object-contain transition-transform duration-500 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
                                        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 transition-opacity group-hover:opacity-100">
                                            <button onClick={handleThumbnailClick} className="h-10 w-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md transition-colors">
                                                <Upload className="h-4 w-4" />
                                            </button>
                                            <button onClick={handleRemove} className="h-10 w-10 flex items-center justify-center rounded-full bg-red-500/40 hover:bg-red-500/60 backdrop-blur-md transition-colors text-white">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {error ? (
                                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex justify-between items-center">
                                            <span>{error}</span>
                                            <button onClick={() => setError('')} className="underline text-xs">Clear</button>
                                        </div>
                                    ) : apiStatus ? (
                                        <div className="flex flex-col items-center gap-3 p-4">
                                            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-indigo-300 text-sm font-medium animate-pulse">{apiStatus}</span>
                                        </div>
                                    ) : (
                                        <div className="pt-2">
                                            <LiquidButton className="w-full" onClick={uploadAndRemoveBackground}>
                                                Initiate AI Extraction
                                            </LiquidButton>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="w-full flex flex-col items-center gap-12 animate-in fade-in zoom-in duration-500">
                        <ComparisonSlider original={result.original} resultUrl={result.resultUrl} />
                        
                        <div className="flex items-center gap-4">
                            <LiquidButton onClick={() => {
                                setResult(null);
                                handleRemove();
                            }} className="opacity-80">
                                Process Another
                            </LiquidButton>
                            
                            <DownloadButton resultUrl={result.resultUrl} reset={() => {
                                setResult(null);
                                handleRemove();
                            }} />
                        </div>
                    </div>
                )}
            </div>
            
        </div>
    );
}
