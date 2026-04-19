'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { useImageUpload } from '@/components/hooks/use-image-upload';
import { motion } from 'framer-motion';
import { ImagePlus, Trash2, RotateCcw, Sparkles, Upload } from 'lucide-react';
import { ComparisonSlider } from '@/components/ComparisonSlider';
import { DownloadButton } from '@/components/DownloadButton';
import { CreditDisplay } from '@/components/CreditDisplay';

export function Workspace() {
  const supabase = createBrowserSupabaseClient();
  const [apiStatus, setApiStatus] = useState('');
  const [error, setError] = useState('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [triggerTime, setTriggerTime] = useState(Date.now());
  const [isDragging, setIsDragging] = useState(false);
  const [tab, setTab] = useState<'input' | 'output'>('input');

  const { previewUrl, fileName, fileObject, fileInputRef, handleThumbnailClick, handleFileChange, handleRemove } = useImageUpload();

  useEffect(() => { if (previewUrl && !resultUrl) setOriginalUrl(previewUrl); }, [previewUrl, resultUrl]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith('image/')) { handleFileChange({ target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>); setResultUrl(null); setError(''); }
  }, [handleFileChange]);

  const resetAll = () => { handleRemove(); setResultUrl(null); setOriginalUrl(null); setTab('input'); setError(''); };

  const runExtraction = async () => {
    if (!fileObject) return;
    setApiStatus('Uploading...'); setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Please sign in first');
      setApiStatus('Processing...');
      const formData = new FormData(); formData.append('image', fileObject);
      const res = await fetch('/api/remove-bg', { method: 'POST', headers: { 'Authorization': `Bearer ${session.access_token}` }, body: formData });
      if (!res.ok) { const t = await res.text(); try { const j = JSON.parse(t); throw new Error(j.error || j.detail || `Error ${res.status}`); } catch (p: any) { if (p.message.includes('Error')) throw p; throw new Error(`Server error (${res.status})`); } }
      const data = await res.json();
      if (data.result_url) { setResultUrl(data.result_url); setTab('output'); setTriggerTime(Date.now()); }
      else throw new Error(data.error || 'No result returned');
    } catch (e: any) { setError(e.message); }
    setApiStatus('');
  };

  return (
    <div className="w-full min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#030014] via-black to-black pointer-events-none -z-10" />
      <div className="fixed top-[10%] right-[20%] w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Studio</h1>
            <p className="text-sm text-white/30">Upload an image and let AI remove the background</p>
          </div>
          <CreditDisplay triggerTime={triggerTime} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Main area */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glow-card min-h-[540px] flex flex-col">
            <div className="relative z-10 flex-1 flex flex-col p-6">
              {/* Tabs */}
              <div className="flex items-center gap-1 bg-white/[0.03] rounded-full p-1 w-fit mb-6 border border-white/[0.04]">
                <button onClick={() => setTab('input')} className={`px-5 py-2 rounded-full text-xs font-medium transition-all ${tab === 'input' ? 'bg-white/[0.08] text-white' : 'text-white/30 hover:text-white/50'}`}>Input</button>
                <button onClick={() => resultUrl && setTab('output')} disabled={!resultUrl} className={`px-5 py-2 rounded-full text-xs font-medium transition-all ${tab === 'output' ? 'bg-white/[0.08] text-white' : 'text-white/30 hover:text-white/50'} disabled:opacity-30`}>Output</button>
              </div>

              {tab === 'input' ? (
                <>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => { handleFileChange(e); setResultUrl(null); setError(''); }} />
                  {!previewUrl ? (
                    <div onClick={handleThumbnailClick}
                      onDragOver={(e) => e.preventDefault()} onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }} onDrop={handleDrop}
                      className={`flex-1 min-h-[380px] flex flex-col items-center justify-center gap-5 rounded-2xl cursor-pointer transition-all border-2 border-dashed ${isDragging ? 'border-violet-500/30 bg-violet-500/5' : 'border-white/[0.06] hover:border-white/[0.1] hover:bg-white/[0.02]'}`}>
                      <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                        <ImagePlus className="w-7 h-7 text-white/25" />
                      </div>
                      <p className="text-sm font-medium text-white/50">Drop your image here</p>
                      <p className="text-xs text-white/20">or click to browse • JPG, PNG, WEBP</p>
                    </div>
                  ) : (
                    <div className="flex-1 min-h-[380px] rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center relative group overflow-hidden">
                      <img src={previewUrl} alt="Preview" className="max-w-full max-h-[440px] object-contain rounded-lg" />
                      {fileName && <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg text-[10px] font-medium text-white/40 bg-black/60 backdrop-blur-md border border-white/10">{fileName}</div>}
                      <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={handleThumbnailClick} className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"><Upload className="w-3.5 h-3.5 text-white/60" /></button>
                        <button onClick={resetAll} className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-red-500/20 transition-colors"><Trash2 className="w-3.5 h-3.5 text-white/60" /></button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                resultUrl && originalUrl ? (
                  <div className="flex-1 min-h-[380px] rounded-2xl overflow-hidden border border-white/[0.04]">
                    <ComparisonSlider original={originalUrl} resultUrl={resultUrl} />
                  </div>
                ) : <div className="flex-1 flex items-center justify-center text-white/20 text-sm">No result yet</div>
              )}
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col gap-5">
            <div className="glow-card">
              <div className="relative z-10 p-5 space-y-4">
                <h3 className="text-[11px] font-semibold text-white/30 uppercase tracking-[0.15em]">Generate</h3>
                {error && (
                  <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-xs text-red-400 flex justify-between items-center">
                    <span className="line-clamp-2">{error}</span>
                    <button onClick={() => setError('')} className="text-red-400/40 hover:text-red-400 shrink-0 ml-2">✕</button>
                  </div>
                )}
                <button disabled={!previewUrl || !!apiStatus} onClick={runExtraction}
                  className="w-full h-11 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition-all shadow-lg shadow-white/5 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {apiStatus ? <><div className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />{apiStatus}</>
                  : <><Sparkles className="w-3.5 h-3.5" /> Remove Background</>}
                </button>
                <p className="text-[10px] text-center text-white/15">5 credits per image</p>
                {resultUrl && (
                  <button onClick={resetAll} className="w-full py-2.5 rounded-xl border border-white/[0.06] text-xs font-medium text-white/30 hover:bg-white/[0.04] transition-colors flex items-center justify-center gap-1.5">
                    <RotateCcw className="w-3 h-3" /> New image
                  </button>
                )}
              </div>
            </div>

            {resultUrl && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glow-card">
                <div className="relative z-10 p-5 space-y-4">
                  <h3 className="text-[11px] font-semibold text-white/30 uppercase tracking-[0.15em]">Export</h3>
                  <DownloadButton resultUrl={resultUrl} />
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
