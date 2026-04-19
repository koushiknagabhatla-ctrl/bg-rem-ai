'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { useImageUpload } from '@/components/hooks/use-image-upload';
import { ImagePlus, Trash2, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ComparisonSlider } from '@/components/ComparisonSlider';
import { DownloadButton } from '@/components/DownloadButton';
import { CreditDisplay } from '@/components/CreditDisplay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Workspace() {
    const supabase = createBrowserSupabaseClient();
    const [apiStatus, setApiStatus] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [originalUrl, setOriginalUrl] = useState<string | null>(null);
    const [triggerTime, setTriggerTime] = useState(Date.now());
    const [isDragging, setIsDragging] = useState(false);
    const [activeTab, setActiveTab] = useState("input");

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
        if (previewUrl && !resultUrl) {
            setOriginalUrl(previewUrl);
        }
    }, [previewUrl, resultUrl]);

    const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); }, []);
    const handleDragEnter = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }, []);
    const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }, []);
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) {
            const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
            handleFileChange(fakeEvent);
            setResultUrl(null);
            setError('');
        }
    }, [handleFileChange]);

    const resetWorkspace = () => {
        handleRemove();
        setResultUrl(null);
        setOriginalUrl(null);
        setActiveTab("input");
        setError('');
    };

    const runExtraction = async () => {
        if (!fileObject) return;
        setApiStatus('Analyzing image...');
        setError('');
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Please sign in to continue');
            
            setApiStatus('Processing with AI (est. 2-5s)...');
            
            const formData = new FormData();
            formData.append('image', fileObject);

            const res = await fetch('/api/remove-bg', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${session.access_token}` },
                body: formData
            });

            if (!res.ok) {
                const text = await res.text();
                try {
                    const json = JSON.parse(text);
                    throw new Error(json.error || json.detail || `Request failed (${res.status})`);
                } catch (parseErr: any) {
                    if (parseErr.message.includes('Request failed')) throw parseErr;
                    throw new Error(`Server returned status ${res.status}`);
                }
            }
            
            setApiStatus('Finalizing...');
            const data = await res.json();
            
            if (data.result_url) {
                setResultUrl(data.result_url);
                setActiveTab("output");
                setTriggerTime(Date.now());
            } else {
                throw new Error(data.error || 'No result URL returned');
            }
        } catch (e: any) {
            setError(e.message);
        }
        setApiStatus('');
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-6 py-8 flex flex-col items-center">
            
            {/* Credits badge */}
            <div className="w-full flex justify-end mb-6">
                <CreditDisplay triggerTime={triggerTime} />
            </div>

            <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                
                {/* Main canvas area */}
                <div className="glass-card p-6 min-h-[520px] flex flex-col">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold tracking-tight text-white/90">AI Workbench</h2>
                            <TabsList className="bg-white/[0.03] border border-white/[0.06] p-1 rounded-full">
                                <TabsTrigger value="input" className="rounded-full px-5 text-xs data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/40 transition-all font-medium">Input</TabsTrigger>
                                <TabsTrigger value="output" disabled={!resultUrl} className="rounded-full px-5 text-xs data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/40 transition-all font-medium">Output</TabsTrigger>
                            </TabsList>
                        </div>

                        {/* INPUT TAB */}
                        <TabsContent value="input" className="flex-1 flex flex-col mt-0 border-none justify-center">
                            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => { handleFileChange(e); setResultUrl(null); setError(''); }} />
                            
                            {!previewUrl ? (
                                <div
                                    onClick={handleThumbnailClick}
                                    onDragOver={handleDragOver}
                                    onDragEnter={handleDragEnter}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={cn(
                                        "flex flex-1 min-h-[400px] cursor-pointer flex-col items-center justify-center gap-6 rounded-2xl bg-white/[0.02] transition-all hover:bg-white/[0.04] relative group",
                                        isDragging && "border-purple-500/40 bg-purple-500/5",
                                        "border-2 border-dashed border-white/[0.08]"
                                    )}
                                >
                                    <div className="w-20 h-20 rounded-2xl bg-white/[0.03] flex items-center justify-center group-hover:scale-105 transition-transform duration-500 border border-white/[0.06]">
                                        <ImagePlus className="h-8 w-8 text-white/40 group-hover:text-white/70 transition-colors" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <p className="text-lg font-medium text-white/70">Click or drag image here</p>
                                        <p className="text-sm text-white/30">Supports JPG, PNG, WEBP • Max 20MB</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 rounded-2xl bg-black/40 border border-white/[0.04] p-4 flex items-center justify-center relative overflow-hidden group min-h-[400px]">
                                    <img src={previewUrl} alt="Upload preview" className="max-w-full max-h-[450px] object-contain rounded-lg" />
                                    {fileName && (
                                        <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs text-white/60 border border-white/10">
                                            {fileName}
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={resetWorkspace} className="w-9 h-9 rounded-full bg-black/70 hover:bg-red-500/70 flex items-center justify-center backdrop-blur-md transition-colors border border-white/10">
                                            <Trash2 className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        {/* OUTPUT TAB */}
                        <TabsContent value="output" className="flex-1 flex flex-col mt-0 border-none">
                            {resultUrl && originalUrl ? (
                                <div className="flex-1 w-full rounded-2xl overflow-hidden border border-white/[0.06] min-h-[400px] relative bg-[repeating-conic-gradient(rgba(255,255,255,0.03)_0%_25%,transparent_0%_50%)] bg-[length:20px_20px]">
                                    <ComparisonSlider original={originalUrl} resultUrl={resultUrl} />
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-white/30 text-sm">
                                    No result generated yet.
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar */}
                <div className="flex flex-col gap-5">
                    {/* Actions panel */}
                    <div className="glass-card p-5 flex flex-col gap-5">
                        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Actions</h3>
                        
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex justify-between items-start gap-2">
                                <span>{error}</span>
                                <button onClick={() => setError('')} className="text-red-400/50 hover:text-red-400 text-xs shrink-0">✕</button>
                            </div>
                        )}

                        <button 
                            className="w-full py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition-all shadow-lg shadow-white/5 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
                            disabled={!previewUrl || !!apiStatus} 
                            onClick={runExtraction}
                        >
                            {apiStatus ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                    <span>{apiStatus}</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" /> Remove Background (5 Cr)
                                </>
                            )}
                        </button>
                        
                        {resultUrl && (
                            <button
                                onClick={resetWorkspace}
                                className="w-full py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-xs font-medium text-white/50 flex items-center justify-center gap-2"
                            >
                                <RotateCcw className="w-3.5 h-3.5" /> New Image
                            </button>
                        )}
                    </div>

                    {/* Export panel */}
                    {resultUrl && (
                        <div className="glass-card p-5 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Export</h3>
                            <DownloadButton resultUrl={resultUrl} reset={resetWorkspace} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
