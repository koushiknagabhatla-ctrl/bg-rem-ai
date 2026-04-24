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
    if (fileObject.size > 4.5 * 1024 * 1024) { setError('File is too large. Max 4.5MB.'); return; }
    setApiStatus('Uploading...'); setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setError('Please sign in first'); setApiStatus(''); return; }
      setApiStatus('Processing...');
      const formData = new FormData(); formData.append('image', fileObject);
      const response = await fetch('/api/remove-bg', { method: 'POST', headers: { 'Authorization': `Bearer ${session.access_token}` }, body: formData });
      if (!response.ok) {
        let errObj: any = {}; try { errObj = await response.json(); } catch (e) {}
        if (response.status === 402) setError('No credits left.');
        else if (response.status === 504) setError('Server waking up. Try in 30s.');
        else if (response.status === 429) setError('Too many requests. Wait 1 min.');
        else setError(errObj.detail || errObj.error || 'Something went wrong.');
        setApiStatus(''); return;
      }
      const data = await response.json();
      if (data.result_url) { setResultUrl(data.result_url); setTab('output'); setTriggerTime(Date.now()); }
      else { setError('Processing failed.'); }
    } catch (e: any) { setError(e.message || 'Network error'); }
    setApiStatus('');
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 pt-28 pb-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-black mb-1">Studio</h1>
            <p className="text-sm text-gray-400">Upload an image and let AI remove the background</p>
          </div>
          <CreditDisplay triggerTime={triggerTime} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Main area */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="liquid-glass-card min-h-[540px] flex flex-col overflow-hidden">
            <div className="flex-1 flex flex-col p-6">
              {/* Tabs */}
              <div className="flex items-center gap-1 bg-gray-50 rounded-full p-1 w-fit mb-6">
                <button onClick={() => setTab('input')} className={`px-5 py-2 rounded-full text-xs font-medium transition-all ${tab === 'input' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Input</button>
                <button onClick={() => resultUrl && setTab('output')} disabled={!resultUrl} className={`px-5 py-2 rounded-full text-xs font-medium transition-all ${tab === 'output' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'} disabled:opacity-30`}>Output</button>
              </div>

              <AnimatePresence mode="wait">
                {tab === 'input' ? (
                  <motion.div key="input" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex-1 flex flex-col">
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => { handleFileChange(e); setResultUrl(null); setError(''); }} />
                    {!previewUrl ? (
                      <div onClick={handleThumbnailClick}
                        onDragOver={(e) => e.preventDefault()} onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }} onDrop={handleDrop}
                        className={`flex-1 min-h-[380px] flex flex-col items-center justify-center gap-5 rounded-2xl cursor-pointer transition-all border-2 border-dashed ${isDragging ? 'border-indigo-300 bg-indigo-50/50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'}`}>
                        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}
                          className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center">
                          <ImagePlus className="w-7 h-7 text-gray-300" />
                        </motion.div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-500">Drop your image here</p>
                          <p className="text-xs text-gray-400 mt-1">or click to browse • JPG, PNG, WEBP</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 min-h-[380px] rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center relative group overflow-hidden">
                        <img src={previewUrl} alt="Preview" className="max-w-full max-h-[440px] object-contain rounded-lg" />
                        {fileName && <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg text-[10px] font-medium text-gray-500 bg-white/80 backdrop-blur-md border border-gray-100">{fileName}</div>}
                        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={handleThumbnailClick} className="w-8 h-8 rounded-lg bg-white/80 backdrop-blur-md border border-gray-100 flex items-center justify-center hover:bg-white"><Upload className="w-3.5 h-3.5 text-gray-500" /></button>
                          <button onClick={resetAll} className="w-8 h-8 rounded-lg bg-white/80 backdrop-blur-md border border-gray-100 flex items-center justify-center hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-gray-500" /></button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="output" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col">
                    {resultUrl && originalUrl ? (
                      <div className="flex-1 min-h-[380px] rounded-2xl overflow-hidden border border-gray-100">
                        <ImageComparisonSlider leftImage={originalUrl} rightImage={resultUrl} altLeft="Original" altRight="Background Removed" />
                      </div>
                    ) : <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">No result yet</div>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col gap-5">
            <div className="liquid-glass-card p-5 space-y-4">
              <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.15em]">Generate</h3>
              {error && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-500 flex justify-between items-center">
                  <span className="line-clamp-2">{error}</span>
                  <button onClick={() => setError('')} className="text-red-300 hover:text-red-500 shrink-0 ml-2">✕</button>
                </motion.div>
              )}
              <button disabled={!previewUrl || !!apiStatus} onClick={runExtraction}
                className="w-full h-12 rounded-xl bg-black text-white font-semibold text-sm hover:bg-gray-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]">
                {apiStatus ? <><div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />{apiStatus}</>
                : <><Sparkles className="w-3.5 h-3.5" /> Remove Background</>}
              </button>
              <p className="text-[10px] text-center text-gray-300">5 credits per image</p>
              {resultUrl && (
                <button onClick={resetAll} className="w-full py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5">
                  <RotateCcw className="w-3 h-3" /> New image
                </button>
              )}
            </div>

            {resultUrl && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="liquid-glass-card p-5 space-y-4">
                <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.15em]">Export</h3>
                <DownloadButton resultUrl={resultUrl} />
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
