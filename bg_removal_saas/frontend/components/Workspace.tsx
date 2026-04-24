'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { useImageUpload } from '@/components/hooks/use-image-upload';
import { motion, AnimatePresence } from 'framer-motion';
import { ImagePlus, Trash2, RotateCcw, Sparkles, Upload } from 'lucide-react';
import { ImageComparisonSlider } from '@/components/ui/image-comparison-slider';
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
    if (fileObject.size > 4.5 * 1024 * 1024) { setError('Max file size 4.5MB.'); return; }
    setApiStatus('Uploading...'); setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setError('Please sign in first'); setApiStatus(''); return; }
      setApiStatus('Processing...');
      const formData = new FormData(); formData.append('image', fileObject);
      const response = await fetch('/api/remove-bg', { method: 'POST', headers: { 'Authorization': `Bearer ${session.access_token}` }, body: formData });
      if (!response.ok) {
        let errObj: any = {}; try { errObj = await response.json(); } catch (e) {}
        if (response.status === 402) setError('No credits remaining.');
        else if (response.status === 504) setError('Server waking up. Try in 30s.');
        else if (response.status === 429) setError('Too many requests.');
        else setError(errObj.detail || errObj.error || 'Something went wrong.');
        setApiStatus(''); return;
      }
      const data = await response.json();
      if (data.result_url) { setResultUrl(data.result_url); setTab('output'); setTriggerTime(Date.now()); }
      else setError('Processing failed.');
    } catch (e: any) { setError(e.message || 'Network error'); }
    setApiStatus('');
  };

  return (
    <div className="w-full min-h-screen">
      <div className="max-w-6xl mx-auto px-6 pt-28 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-serif font-semibold tracking-tight text-ink mb-1">Studio</h1>
            <p className="text-sm text-ink-muted">Upload → Process → Download</p>
          </div>
          <CreditDisplay triggerTime={triggerTime} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="liquid-glass-card min-h-[520px] flex flex-col overflow-hidden">
            <div className="flex-1 flex flex-col p-6">
              <div className="flex items-center gap-1 bg-cream-dark/50 rounded-full p-1 w-fit mb-6">
                <button onClick={() => setTab('input')} className={`px-5 py-2 rounded-full text-xs font-medium transition-all duration-300 ${tab === 'input' ? 'bg-cream-light text-ink shadow-sm' : 'text-ink-muted hover:text-ink'}`}>Input</button>
                <button onClick={() => resultUrl && setTab('output')} disabled={!resultUrl} className={`px-5 py-2 rounded-full text-xs font-medium transition-all duration-300 ${tab === 'output' ? 'bg-cream-light text-ink shadow-sm' : 'text-ink-muted hover:text-ink'} disabled:opacity-30`}>Output</button>
              </div>
              <AnimatePresence mode="wait">
                {tab === 'input' ? (
                  <motion.div key="input" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="flex-1 flex flex-col">
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => { handleFileChange(e); setResultUrl(null); setError(''); }} />
                    {!previewUrl ? (
                      <div onClick={handleThumbnailClick}
                        onDragOver={(e) => e.preventDefault()} onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }} onDrop={handleDrop}
                        className={`flex-1 min-h-[380px] flex flex-col items-center justify-center gap-5 rounded-2xl cursor-pointer transition-all duration-500 border-2 border-dashed ${isDragging ? 'border-ink/20 bg-cream-light' : 'border-ink/[0.08] hover:border-ink/[0.12] hover:bg-cream-light/50'}`}>
                        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }}
                          className="w-16 h-16 rounded-2xl bg-cream-light flex items-center justify-center">
                          <ImagePlus className="w-7 h-7 text-ink-muted" />
                        </motion.div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-ink-light">Drop your image here</p>
                          <p className="text-xs text-ink-muted mt-1">or click to browse</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 min-h-[380px] rounded-2xl bg-cream-light border border-ink/[0.04] flex items-center justify-center relative group overflow-hidden">
                        <img src={previewUrl} alt="Preview" className="max-w-full max-h-[440px] object-contain rounded-lg" />
                        {fileName && <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg text-[10px] font-medium text-ink-muted bg-cream/80 backdrop-blur-md border border-ink/[0.06]">{fileName}</div>}
                        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button onClick={handleThumbnailClick} className="w-8 h-8 rounded-lg bg-cream/80 backdrop-blur-md border border-ink/[0.06] flex items-center justify-center hover:bg-cream"><Upload className="w-3.5 h-3.5 text-ink-light" /></button>
                          <button onClick={resetAll} className="w-8 h-8 rounded-lg bg-cream/80 backdrop-blur-md border border-ink/[0.06] flex items-center justify-center hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-ink-light" /></button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="output" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="flex-1 flex flex-col">
                    {resultUrl && originalUrl ? (
                      <div className="flex-1 min-h-[380px] rounded-2xl overflow-hidden border border-ink/[0.04]">
                        <ImageComparisonSlider leftImage={originalUrl} rightImage={resultUrl} altLeft="Original" altRight="Background Removed" />
                      </div>
                    ) : <div className="flex-1 flex items-center justify-center text-ink-muted text-sm">No result yet</div>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col gap-4">
            <div className="liquid-glass-card p-5 space-y-4">
              <h3 className="text-[10px] font-semibold text-ink-muted uppercase tracking-[0.2em]">Generate</h3>
              {error && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-red-50/80 border border-red-200/50 text-xs text-red-500 flex justify-between items-center">
                  <span className="line-clamp-2">{error}</span>
                  <button onClick={() => setError('')} className="text-red-300 hover:text-red-500 shrink-0 ml-2">✕</button>
                </motion.div>
              )}
              <button disabled={!previewUrl || !!apiStatus} onClick={runExtraction}
                className="w-full h-12 rounded-xl bg-ink text-cream-light font-medium text-sm hover:bg-ink/90 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {apiStatus ? <><div className="w-3.5 h-3.5 border-2 border-cream/20 border-t-cream rounded-full animate-spin" />{apiStatus}</>
                : <><Sparkles className="w-3.5 h-3.5" /> Remove Background</>}
              </button>
              <p className="text-[10px] text-center text-ink-muted">5 credits per image</p>
              {resultUrl && (
                <button onClick={resetAll} className="w-full py-2.5 rounded-xl border border-ink/[0.08] text-xs font-medium text-ink-muted hover:bg-cream-light transition-colors duration-300 flex items-center justify-center gap-1.5">
                  <RotateCcw className="w-3 h-3" /> New image
                </button>
              )}
            </div>
            {resultUrl && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="liquid-glass-card p-5 space-y-4">
                <h3 className="text-[10px] font-semibold text-ink-muted uppercase tracking-[0.2em]">Export</h3>
                <DownloadButton resultUrl={resultUrl} />
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
