'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { useImageUpload } from '@/components/hooks/use-image-upload';
import { ImagePlus, Trash2, RotateCcw, Sparkles, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComparisonSlider } from '@/components/ComparisonSlider';
import { DownloadButton } from '@/components/DownloadButton';
import { CreditDisplay } from '@/components/CreditDisplay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function Workspace() {
  const supabase = createBrowserSupabaseClient();
  const [apiStatus, setApiStatus] = useState('');
  const [error, setError] = useState('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [triggerTime, setTriggerTime] = useState(Date.now());
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState('input');

  const { previewUrl, fileName, fileObject, fileInputRef, handleThumbnailClick, handleFileChange, handleRemove } = useImageUpload();

  useEffect(() => { if (previewUrl && !resultUrl) setOriginalUrl(previewUrl); }, [previewUrl, resultUrl]);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); }, []);
  const handleDragEnter = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith('image/')) {
      handleFileChange({ target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>);
      setResultUrl(null); setError('');
    }
  }, [handleFileChange]);

  const resetWorkspace = () => { handleRemove(); setResultUrl(null); setOriginalUrl(null); setActiveTab('input'); setError(''); };

  const runExtraction = async () => {
    if (!fileObject) return;
    setApiStatus('Uploading...'); setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Please sign in first');
      setApiStatus('Processing...');

      const formData = new FormData();
      formData.append('image', fileObject);

      const res = await fetch('/api/remove-bg', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        try { const json = JSON.parse(text); throw new Error(json.error || json.detail || `Error ${res.status}`); }
        catch (pe: any) { if (pe.message.includes('Error')) throw pe; throw new Error(`Server error (${res.status})`); }
      }

      const data = await res.json();
      if (data.result_url) {
        setResultUrl(data.result_url);
        setActiveTab('output');
        setTriggerTime(Date.now());
      } else throw new Error(data.error || 'No result returned');
    } catch (e: any) { setError(e.message); }
    setApiStatus('');
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workspace</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Upload an image and remove its background</p>
        </div>
        <CreditDisplay triggerTime={triggerTime} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Canvas */}
        <div className="rounded-2xl border border-border/50 bg-card/50 p-5 min-h-[540px] flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="bg-muted/50 border border-border/30 p-1 rounded-lg w-fit mb-5">
              <TabsTrigger value="input" className="rounded-md px-4 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">Input</TabsTrigger>
              <TabsTrigger value="output" disabled={!resultUrl} className="rounded-md px-4 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">Output</TabsTrigger>
            </TabsList>

            <TabsContent value="input" className="flex-1 flex flex-col mt-0">
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => { handleFileChange(e); setResultUrl(null); setError(''); }} />
              {!previewUrl ? (
                <div onClick={handleThumbnailClick} onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDrop={handleDrop}
                  className={cn(
                    "flex-1 min-h-[420px] flex flex-col items-center justify-center gap-5 rounded-xl cursor-pointer transition-all border-2 border-dashed",
                    isDragging ? "border-primary/40 bg-primary/5" : "border-border/30 bg-muted/20 hover:bg-muted/40 hover:border-border/50"
                  )}>
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                    <ImagePlus className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium">Drop your image here</p>
                    <p className="text-xs text-muted-foreground">or click to browse • JPG, PNG, WEBP • Max 20MB</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 min-h-[420px] rounded-xl bg-muted/20 border border-border/30 flex items-center justify-center relative group overflow-hidden">
                  <img src={previewUrl} alt="Preview" className="max-w-full max-h-[460px] object-contain rounded-lg" />
                  {fileName && <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-medium text-muted-foreground bg-background/80 backdrop-blur-md border border-border/50">{fileName}</div>}
                  <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={handleThumbnailClick} className="w-8 h-8 rounded-lg bg-background/80 backdrop-blur-md border border-border/50 flex items-center justify-center hover:bg-accent transition-colors"><Upload className="w-3.5 h-3.5" /></button>
                    <button onClick={resetWorkspace} className="w-8 h-8 rounded-lg bg-background/80 backdrop-blur-md border border-border/50 flex items-center justify-center hover:bg-destructive/10 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="output" className="flex-1 flex flex-col mt-0">
              {resultUrl && originalUrl ? (
                <div className="flex-1 min-h-[420px] rounded-xl overflow-hidden border border-border/30">
                  <ComparisonSlider original={originalUrl} resultUrl={resultUrl} />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">No result yet</div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Generate */}
          <div className="rounded-2xl border border-border/50 bg-card/50 p-5 space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Generate</h3>
            {error && (
              <div className="p-2.5 rounded-lg bg-destructive/5 border border-destructive/10 text-xs text-red-400 flex justify-between items-center gap-2">
                <span className="line-clamp-2">{error}</span>
                <button onClick={() => setError('')} className="text-red-400/50 hover:text-red-400 shrink-0">✕</button>
              </div>
            )}
            <button disabled={!previewUrl || !!apiStatus} onClick={runExtraction}
              className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all shadow-sm shadow-primary/15 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {apiStatus ? (
                <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{apiStatus}</>
              ) : (
                <><Sparkles className="w-3.5 h-3.5" /> Remove Background</>
              )}
            </button>
            <p className="text-[10px] text-center text-muted-foreground">Uses 5 credits per image</p>
            {resultUrl && (
              <button onClick={resetWorkspace} className="w-full py-2 rounded-lg border border-border/50 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors flex items-center justify-center gap-1.5">
                <RotateCcw className="w-3 h-3" /> New image
              </button>
            )}
          </div>

          {/* Export */}
          {resultUrl && (
            <div className="rounded-2xl border border-border/50 bg-card/50 p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Export</h3>
              <DownloadButton resultUrl={resultUrl} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
