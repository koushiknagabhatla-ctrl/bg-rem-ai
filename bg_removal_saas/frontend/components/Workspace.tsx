'use client';
import React, { useState, useEffect } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { useImageUpload } from '@/components/hooks/use-image-upload';
import { ImagePlus, X, Upload, Trash2, Maximize2, RotateCcw, Sparkles } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { LiquidButton } from '@/components/ui/liquid-glass-button';
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
        fileObject,
        fileInputRef,
        handleThumbnailClick,
        handleFileChange,
        handleRemove,
    } = useImageUpload();

    // Preserve originalUrl locally so that if useImageUpload unmounts, we keep the data for the slider
    useEffect(() => {
        if (previewUrl && !resultUrl) {
            setOriginalUrl(previewUrl);
        }
    }, [previewUrl, resultUrl]);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); }
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) {
            const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
            handleFileChange(fakeEvent);
            setResultUrl(null); // Reset prev results
            setError('');
        }
    }

    const resetWorkspace = () => {
        handleRemove();
        setResultUrl(null);
        setOriginalUrl(null);
        setActiveTab("input");
        setError('');
    };

    const runExtraction = async () => {
        if (!fileObject) return;
        setApiStatus('Detecting edges...');
        setError('');
        try {
            const { data: { session } } = await supabase.auth.getSession();
            setApiStatus('Severing background (est. 40ms AI Processing)...');
            
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
            
            setResultUrl(data.result_url);
            setActiveTab("output");
            setTriggerTime(Date.now()); // Update credits
        } catch (e: any) {
            setError(e.message);
        }
        setApiStatus('');
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-6 py-12 flex flex-col items-center">
            
            <div className="w-full flex justify-end mb-8 z-20">
                <CreditDisplay triggerTime={triggerTime} />
            </div>

            <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
                
                {/* Main Action Area */}
                <div className="glass rounded-3xl p-6 shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold tracking-tight">AI Workbench</h2>
                            <TabsList className="bg-black/40 border border-white/10 p-1 rounded-full">
                                <TabsTrigger value="input" className="rounded-full px-6 data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 transition-all font-medium">Input</TabsTrigger>
                                <TabsTrigger value="output" disabled={!resultUrl} className="rounded-full px-6 data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 transition-all font-medium">Output</TabsTrigger>
                            </TabsList>
                        </div>

                        {/* INPUT TAB */}
                        <TabsContent value="input" className="flex-1 flex flex-col mt-0 border-none justify-center">
                            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => { handleFileChange(e); setResultUrl(null); }} />
                            
                            {!previewUrl ? (
                                <div
                                    onClick={handleThumbnailClick}
                                    onDragOver={handleDragOver}
                                    onDragEnter={handleDragEnter}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={cn(
                                        "flex flex-1 min-h-[400px] cursor-pointer flex-col items-center justify-center gap-6 rounded-2xl border-white/10 bg-black/30 transition-all hover:bg-black/50 hover:border-white/20 relative group",
                                        isDragging && "border-indigo-500/50 bg-indigo-500/10",
                                        "border-2 border-dashed"
                                    )}
                                >
                                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg border border-white/5">
                                        <ImagePlus className="h-8 w-8 text-white/60 group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <p className="text-xl font-medium text-white/80">Click or drag image here</p>
                                        <p className="text-sm text-white/40">Supports JPG, PNG, WEBP (Max 20MB)</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 rounded-2xl bg-black/40 border border-white/5 p-4 flex flex-col items-center justify-center relative overflow-hidden group min-h-[400px]">
                                    <div className="absolute inset-0 w-full h-full p-4 flex items-center justify-center">
                                       <img src={previewUrl} alt="Upload preview" className="w-full h-full object-contain rounded-lg drop-shadow-2xl" />
                                    </div>
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={resetWorkspace} className="w-10 h-10 rounded-full bg-black/80 hover:bg-red-500/80 flex items-center justify-center backdrop-blur-md transition-colors border border-white/10">
                                            <Trash2 className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        {/* OUTPUT TAB */}
                        <TabsContent value="output" className="flex-1 flex flex-col mt-0 border-none h-full">
                            {resultUrl && originalUrl ? (
                                <div className="flex-1 w-full flex flex-col">
                                    <div className="w-full flex-1 rounded-2xl overflow-hidden bg-[url('/checkers.png')] bg-repeat shadow-2xl relative min-h-[400px] border border-white/10">
                                        <ComparisonSlider original={originalUrl} resultUrl={resultUrl} />
                                    </div>
                                    
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-white/40">
                                    No result generated yet.
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar Controls */}
                <div className="flex flex-col gap-6">
                    <div className="glass rounded-3xl p-6 shadow-xl flex flex-col gap-6">
                        <h3 className="text-lg font-bold text-white/90">Actions</h3>
                        
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex justify-between items-center shadow-inner">
                                <span>{error}</span>
                                <button onClick={() => setError('')} className="underline text-xs opacity-70 hover:opacity-100">Clear</button>
                            </div>
                        )}

                        <div className="space-y-4">
                            <LiquidButton 
                                className="w-full" 
                                disabled={!previewUrl || !!apiStatus} 
                                onClick={runExtraction}
                            >
                                {apiStatus ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        <span>{apiStatus}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" /> Generate Result (5 Cr)
                                    </div>
                                )}
                            </LiquidButton>
                            
                            {resultUrl && (
                                <button
                                    onClick={resetWorkspace}
                                    className="w-full py-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium text-white/70 flex items-center justify-center gap-2"
                                >
                                    <RotateCcw className="w-4 h-4" /> Start New Image
                                </button>
                            )}
                        </div>
                    </div>

                    {resultUrl && (
                        <div className="glass rounded-3xl p-6 shadow-xl flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-lg font-bold text-white/90">Export Options</h3>
                            <DownloadButton resultUrl={resultUrl} reset={() => {}} />
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
